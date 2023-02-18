const axios = require('axios')
const CronJob = require('cron').CronJob;
const {updateOrders, initializeTables, rehydrateOrders, setLastError, initializeProducts} = require('./orders.js')
const {rehydrateCoupons, updateCoupons} = require('./coupons.js')
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

const job = new CronJob(config.fetch.orderCron, async () => {
  // lock api calls to disable concurrent calls
  if (locked) return
  locked = true

  try {
    const limit = 250
    const allData = await getPaginatedData(
      (page) => `orders?page=${page}&limit=${limit}&trainingsMode=${config.useTrainingData}`,
      'Couldn\'t get order data',
      limit)

    locked = false

    updateOrders(allData)
  } catch (exception) {
    locked = false

    setLastError(new Date(), 500, exception)
    winston.error('[synchronizer] Error getting orders', exception)
  }
})

const fetchProductsPeriodically = new CronJob(config.fetch.productsCron, async () => {
  await getProductInformation();
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
      const limit = 250
      const allData = await getPaginatedData(
        (page) => `products?page=${page}&limit=${limit}&includeProductGroup=true`,
        'Couldn\'t get product data',
        limit)

      initializeProducts(allData)

      resolve()
    } catch (error) {
      winston.error('[synchronizer] Error getting product information', error)
      reject(error)
    }
  })
}

const getPaginatedData = async (createUrlFromPagenumber, errorMessage, limit = 250) => {
  let allData = []
  let page = 1

  do {
    var {status, data} = await instance.get(createUrlFromPagenumber(page++))

    if (status !== 200) {
      winston.error(`[synchronizer] ${errorMessage}. Status: ${status}. Data:`, data)
      return
    }

    allData = [...allData, ...data]
  } while (data && data.length === limit)

  return allData
}

const getAllCoupons = () => {
  return new Promise(async function (resolve, reject) {
    try {
      const limit = 250
      const allData = await getPaginatedData(
        (page) => `coupons?page=${page}&limit=${limit}`,
        'Couldn\'t get product data',
        limit)

      updateCoupons(allData)

      resolve()
    } catch (error) {
      winston.error('[synchronizer] Error getting coupons', error)
      reject(error)
    }
  })
}

const startOrderSynchonization = () => {
  winston.info('[synchronizer] Staring order synchronization')
  rehydrateOrders()
  rehydrateCoupons()
  getTableInformation().then(() => {
    getProductInformation().then(
      () => {
        job.start()
        fetchProductsPeriodically.start();
      })
  })
}

module.exports = {
  startOrderSynchonization,
  getAllCoupons
}