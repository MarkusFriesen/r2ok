const fs = require('fs');
const config = require('./config')
const winston = require('winston')

let orders = {}
let productsToProductGroup = {}
let initialized = false
let products = []

let tables = {}

const updateOrders = (data) => {
  data.forEach(order => {
    orders[order.order_id] = {
      made: false,
      ...orders[order.order_id],
      id: order.order_id,
      name: order.order_product_name,
      comment: order.order_comment,
      number: order.order_number,
      quantity: order.order_quantity,
      created: order.order_created_at,
      groupType: order.productgroup_type_id,
      updated: true,
      productId: order.product_id,
      tableId: order.table_id
    }
  })
}

const persistOrders = () => {
  fs.writeFile(config.storage.filePath, JSON.stringify(orders), (err) => {
    if (!err) return
    winston.error('[orders] Failed to save state to file', err);
  });
}

const rehydrateOrders = () => {
  if (initialized) return
  try {
    orders = JSON.parse(fs.readFileSync(config.storage.filePath));
    initialized = true
  } catch (err) {
    winston.error('[orders] Failed to rehydrate orders', err);
    return;
  }
}

const initializeTables = (data) => {
  data.forEach(t => {
    tables[t.table_id] = {name: t.table_name, updated: false}
  })
}

const initializeProducts = (data) => {
  products = data
  data.forEach(product => {
    productsToProductGroup[product.product_id] = {name: product.productgroup.productgroup_name, id: product.productgroup.productgroup_id}
  });
}

const toggleOrder = (orderId) => {
  if (!orders[orderId]) {
    return false
  }

  orders[orderId].made = !orders[orderId].made

  persistOrders()
  return true
}

const getOrders = () => {return {...orders}}

const getTablesWithOrders = () =>
  Object.values(orders).reduce((pv, cv) => {
    if (!pv[cv.tableId]) {
      pv[cv.tableId] = {...tables[cv.tableId], orders: {[cv.id]: {...cv}}}
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
  toggleOrder,
  initializeTables,
  updateOrders,
  getOrders,
  getTablesWithOrders,
  rehydrateOrders,
  getLastError,
  setLastError,
  initializeProducts,
  getProductsToProductGroup,
  getProducts
}
