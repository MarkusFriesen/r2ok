const {toggleOrder, getTablesWithOrders, getLastError, getProductsToProductGroup, getProducts } = require('./orders')
module.exports = function (app) {
  app.get('/orders', (_, res) => {
    res.send(getTablesWithOrders())
  })

  app.post('/orders/:orderId/toggleMade', (req, res) => {
    const {orderId} = req.params

    if (!toggleOrder(orderId)) {
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