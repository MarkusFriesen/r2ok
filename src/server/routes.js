const {toggleOrder, getOrders, getLastError, getProductsToProductGroup, getProducts } = require('./orders')
module.exports = function (app) {
  app.get('/orders', (_, res) => {
    res.send(getOrders())
  })

  app.post('/orders/:tableId/:orderId/toggleMade', (req, res) => {
    const {tableId, orderId} = req.params

    if (!toggleOrder(tableId, orderId)) {
      res.status(404).send()
      return
    }

    res.status(200).send()
  })

  app.get('/productsToProductGroup', (_, res) => {
    res.send(getProductsToProductGroup())
  })

  app.get('/products', (_, res) => {
    res.send(getProducts())
  })

  app.get('/lasterror', (_, res) => {
    res.send(getLastError())
  })
}