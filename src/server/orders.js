const fs = require('fs');
const config = require('./config')
const winston = require('winston')
const {createPersister} = require('./persist')

let orders = {}
let togoOrders = {}
let productsToProductGroup = {}
let initialized = false
let products = []

let tables = {}

const updateOrders = (data) => {
  orders = data.reduce((result, order) => {
    const created = new Date(order.order_created_at)
    result[order.order_id] = {
      status: 0,
      ...orders[order.order_id],
      id: order.order_id,
      name: order.order_product_name,
      comment: order.order_comment,
      number: order.order_number,
      quantity: order.order_quantity,
      created: created,
      groupType: order.productgroup_type_id,
      updated: true,
      productId: order.product_id,
      tableId: order.table_id
    }

    return result
  }, {})
}

const getTogoCutoff = () => Date.now() - config.togoWindowMinutes * 60000

// Invoices are sorted newest first, invoices of a to-go table become to-go orders
const updateTogoOrders = (invoices) => {
  const cutoff = getTogoCutoff()
  const cancelledInvoiceIds = invoices.map(i => i.invoice_reference_id).filter(Boolean)
  const result = {...togoOrders}

  invoices
    .filter(invoice => tables[invoice.table_id]?.togo && !invoice.invoice_reference_id && !invoice.invoice_deleted_at)
    .forEach(invoice => {
      const created = new Date(invoice.invoice_timestamp)
      invoice.items.filter(item => !item.item_retour).forEach(item => {
        const id = `togo-${item.item_id}`
        // Only pick up orders of the last minutes, but keep the ones we already know
        if (created < cutoff && !result[id]) return

        result[id] = {
          status: 0,
          ...result[id],
          id,
          name: item.item_name,
          comment: item.item_comment,
          number: invoice.invoice_number,
          quantity: item.item_qty,
          created: created,
          updated: true,
          productId: item.product_id,
          tableId: `togo-${invoice.invoice_id}`,
          invoiceId: invoice.invoice_id,
          tableName: `${tables[invoice.table_id].name} #${invoice.invoice_number}`
        }
      })
    })

  // Drop cancelled invoices and finished orders older than the to-go window
  Object.values(result).forEach(order => {
    if (cancelledInvoiceIds.includes(order.invoiceId)
      || (order.status === 2 && new Date(order.created) < cutoff)) {
      delete result[order.id]
    }
  })

  togoOrders = result
}

// Status changes are batched, a crash loses at most config.persistDelaySeconds of toggles
const ordersPersister = createPersister(config.storage.filePath, () => orders, config.persistDelaySeconds.orders * 1000)
const togoPersister = createPersister(config.storage.togoPath, () => togoOrders, config.persistDelaySeconds.togo * 1000)

const persistOrders = () => {
  ordersPersister.schedule()
  togoPersister.schedule()
}

const rehydrate = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (err) {
    // Nothing has been saved yet, the file is created on the first status change
    if (err.code === 'ENOENT') return
    winston.error(`[orders] Failed to rehydrate ${filePath}`, err);
  }
}

const rehydrateOrders = () => {
  if (initialized) return
  togoOrders = rehydrate(config.storage.togoPath) || {}
  const storedOrders = rehydrate(config.storage.filePath)
  if (!storedOrders) return
  orders = storedOrders
  initialized = true
}

const initializeTables = (data) => {
  data.forEach(t => {
    // Tables in checkout mode are invoiced immediately, that's the to-go table
    tables[t.table_id] = {name: t.table_name, updated: false, togo: t.table_checkoutMode}
  })
}

const initializeProducts = (data) => {
  products = data
  data.forEach(product => {
    productsToProductGroup[product.product_id] = {name: product.productgroup.productgroup_name, id: product.productgroup.productgroup_id}
  });
}

const toggleStatus = (orderId) => {
  const order = orders[orderId] || togoOrders[orderId]
  if (!order) {
    return false
  }

  order.status = (order.status + 1) % 3

  persistOrders()
  return true
}

const getOrders = () => {return {...orders}}

// Every to-go invoice gets its own card
const getTablesWithOrders = () =>
  [...Object.values(orders), ...Object.values(togoOrders)].reduce((pv, cv) => {
    if (!pv[cv.tableId]) {
      const table = cv.invoiceId ? {name: cv.tableName, togo: true} : tables[cv.tableId]
      pv[cv.tableId] = {...table, orders: {[cv.id]: {...cv}}}
    } else {
      pv[cv.tableId].orders[cv.id] = cv
    }
    return pv
  }, {})

const getProductsToProductGroup = () => productsToProductGroup
const getProducts = () => products

let lastError = {}

const getLastError = () => lastError
const setLastError = (date, code, error) => lastError = {date, error, code}

module.exports = {
  toggleOrder: toggleStatus,
  initializeTables,
  updateOrders,
  updateTogoOrders,
  getTogoCutoff,
  getOrders,
  getTablesWithOrders,
  rehydrateOrders,
  getLastError,
  setLastError,
  initializeProducts,
  getProductsToProductGroup,
  getProducts
}
