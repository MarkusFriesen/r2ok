const orders = {}

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
    orders[t.table_id] = {name: t.table_name, orders: {}, updated: false}
  })
}

const toggleOrder = (tableId, orderId) => {
  if (!orders[tableId] || !orders[tableId].orders[orderId]) {
    return false
  }

  orders[tableId].orders[orderId].made = !orders[tableId].orders[orderId].made
  return true
}

const getOrders = () => { return { ...orders } } 

module.exports = {
  toggleOrder, 
  initializeTables,
  updateOrders,
  getOrders
}