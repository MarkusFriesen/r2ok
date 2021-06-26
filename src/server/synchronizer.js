const axios = require('axios')
const CronJob = require('cron').CronJob;
const {updateOrders, initializeTables} = require('./orders.js')
const config = require('./config.js')
const winston = require('winston');

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
        winston.warn(`[synchronizer] Couldn't get order data. Status: ${status}. Data:`, data);
        return
      }

      updateOrders(data)
    })
    .catch((error) => {
      winston.error('[synchronizer] Error getting orders', error);
    })
})

const getTableInformation = () => {
  return new Promise((resolve, reject) => {
    instance.get('tables')
      .then((response) => {
        const {status, data} = response
        if (status !== 200) {
          winston.error(`[synchronizer] Couldn't get table data. Status: ${status}. Data:`, data);
          return
        }

        initializeTables(data)

        resolve()
      })
      .catch((error) => {
        winston.error('[synchronizer] Error getting table information', error)
        reject(error)
      })
  })
}

const startOrderSynchonization = () => {
  winston.info('[synchronizer] Staring order synchronization')
  getTableInformation().then(() => {
    job.start()
  })
}

module.exports = startOrderSynchonization