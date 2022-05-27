const fs = require('fs');
const config = require('./config')
const winston = require('winston')

let orders = {}
let initialized = false

const updateOrders = (data) => {
  data.forEach(order => {
    orders[order.table_id].orders[order.order_id] = {
      ...orders[order.table_id].orders[order.order_id],
      name: order.order_product_name,
      comment: order.order_comment,
      number: order.order_number,
      quantity: order.order_quantity,
      created: order.order_created_at,
      groupType: order.productgroup_type_id,
      updated: true
    }

    orders[order.table_id].updated = true
  })

  deleteStaleOrders()
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
  } catch (err){
    winston.error('[orders] Failed to rehydrate orders', err);
    return;
  }
}

const deleteStaleOrders = () => {
  for (const table in orders) {

    //delete all tables that have been payed 
    if (!orders[table].updated) {
      orders[table].orders = {}
    }

    //delete all orders that have been removed
    for (const order in orders[table].orders) {
      if (!orders[table].orders[order].updated) {
        delete orders[table].orders[order]
      } else {
        orders[table].orders[order].updated = false
      }
    }
    orders[table].updated = false
  }
}

const initializeTables = (data) => {
  data.forEach(t => {
    orders[t.table_id] = {name: t.table_name, orders: orders[t.table_id]?.orders ?? {}, updated: false}
  })
}

const toggleOrder = (tableId, orderId) => {
  if (!orders[tableId] || !orders[tableId].orders[orderId]) {
    return false
  }

  orders[tableId].orders[orderId].made = !orders[tableId].orders[orderId].made

  persistOrders()
  return true
}

const getOrders = () => { return { ...orders } } 

let lastError = {}

const getLastError = () => lastError
const setLastError = (date, code, error) => lastError = {date, error, code}

module.exports = {
  toggleOrder, 
  initializeTables,
  updateOrders,
  getOrders,
  rehydrateOrders,
  getLastError,
  setLastError
}
