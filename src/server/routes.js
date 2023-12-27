const {getCoupons} = require('./coupons')
const {toggleOrder, getTablesWithOrders, getLastError, getProductsToProductGroup, getProducts} = require('./orders')
const {getAllCoupons} = require('./synchronizer.js')

module.exports = function (app) {
  app.get('/api/orders', (_, res) => {
    res.send(getTablesWithOrders())
  })

  app.post('/api/orders/:orderId/toggleStatus', (req, res) => {
    const {orderId} = req.params

    if (!toggleOrder(orderId)) {
      res.status(404).send()
      return
    }

    res.status(200).send()
  })

  app.get('/api/productsToProductGroup', (_, res) => {
    res.send(getProductsToProductGroup())
  })

  app.get('/api/products', (_, res) => {
    res.send(getProducts())
  })

  app.get('/api/lasterror', (_, res) => {
    res.send(getLastError())
  })

  app.get('/api/coupons', (_, res) => {
    res.send(getCoupons())
  })

  app.post('/api/coupons/refresh', async (_, res) => {
    await getAllCoupons()
    res.status(200).send()
  })
}