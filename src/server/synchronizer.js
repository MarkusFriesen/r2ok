const axios = require('axios')
const CronJob = require('cron').CronJob;
const orders = require('./orders.js')
const config = require('./config.js')

const instance = axios.create({
  baseURL: 'https://api.ready2order.com/v1/',
  timeout: 9000,
  headers: {
    'Authorization': config.authorizationKey
  }
});

// Fetch all Orders every 5 seconds, and overwrite them
const job = new CronJob('*/5 * * * * *', async () => {
  instance.get('orders')
    .then((response) => {
      const {status, data} = response

      if (status !== 200) {
        console.warn(`Couldn't get order data. Status: ${status}. Data:`, data);
        return
      }

      data.forEach(order => {
        orders[order.table_id].orders[order.order_id] = {
          ...orders[order.table_id].orders[order.order_id],
          name: order.order_product_name,
          comment: order.order_comment,
          number: order.order_number,
          quantity: order.order_quantity,
          created: order.order_created_at,
          updated: true
        }

        orders[order.table_id].updated = true
      })

      deleteStaleOrders()
      
    })
    .catch((error) => {
      console.error('Error getting orders', error);
    })
})

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

const getTableInformation = () => {
  return new Promise((resolve, reject) => {
    instance.get('tables')
      .then((response) => {
        const {status, data} = response
        if (status !== 200) {
          console.warn(`Couldn't get table data. Status: ${status}. Data:`, data);
          return
        }

        data.forEach(t => {
          orders[t.table_id] = {name: t.table_name, orders: {}, updated: false}
        })

        resolve()
      })
      .catch((error) => {
        console.error('Error getting table information', error)
        reject(error)
      })
  })
}

const startOrderSynchonization = () => {
  console.info('Staring order synchronization')
  getTableInformation().then(() => {
    job.start()
  })
}

module.exports = startOrderSynchonization