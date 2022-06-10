const axios = require('axios')
const CronJob = require('cron').CronJob;
const {updateOrders, initializeTables, rehydrateOrders, setLastError, initializeProducts} = require('./orders.js')
const config = require('./config.js')
const winston = require('winston')

const instance = axios.create({
  baseURL: 'https://api.ready2order.com/v1/',
  timeout: 9000,
  headers: {
    'Authorization': config.authorizationKey
  }
})

var locked = false

// Fetch all orders every 15 seconds, and overwrite them
const job = new CronJob('*/15 * * * * *', async () => {

  // lock api calls to disable concurrent calls
  if (locked) return
  locked = true

  try {
    let allData = []
    let page = 1

    do {
      var {status, data} = await instance.get(`orders?page=${page++}&limit=250&trainingsMode=${config.useTrainingData}`)
      
      if (status !== 200) {
        setLastError(new Date(), status, data)
        winston.warn(`[synchronizer] Couldn't get order data. Status: ${status}. Data:`, data)
        return
      }
      allData = [...allData, ...data]
    } while (data && data.length === 250)

    locked = false

    updateOrders(allData)
  } catch (exception) {
    locked = false

    setLastError(new Date(), 500, exception)
    winston.error('[synchronizer] Error getting orders', exception)
  }
})

const getTableInformation = () => {
  return new Promise((resolve, reject) => {
    instance.get('tables')
      .then((response) => {
        const {status, data} = response
        if (status !== 200) {
          winston.error(`[synchronizer] Couldn't get table data. Status: ${status}. Data:`, data)
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

const getProductInformation = () => {
  return new Promise(async function (resolve, reject) {
    try {

      let allData = []
      let page = 1

      do {
        var {status, data} = await instance.get(`products?page=${page++}&limit=250&includeProductGroup=true`)

        if (status !== 200) {
          winston.error(`[synchronizer] Couldn't get product data. Status: ${status}. Data:`, data)
          return
        }

        allData = [...allData, ...data]

      } while (data && data.length === 250)

      initializeProducts(allData)

      resolve()
    } catch (error) {
      winston.error('[synchronizer] Error getting product information', error)
      reject(error)
    }
  })
}

const startOrderSynchonization = () => {
  winston.info('[synchronizer] Staring order synchronization')
  rehydrateOrders()
  getTableInformation().then(() => {
    getProductInformation().then(
      () => {
        job.start()
      })
  })
}

module.exports = startOrderSynchonization