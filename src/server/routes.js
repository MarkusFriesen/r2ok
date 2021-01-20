const orders = require('./orders')
module.exports = function (app) {
  app.get('/orders', (_, res) => {
    res.send(orders)
  })

  app.post('/orders/:tableId/:orderId/toggleMade', (req, res) => {
    const {tableId, orderId} = req.params

    if (!orders[tableId] || !orders[tableId].orders[orderId]) {
      res.status(404).send()
      return
    }

    orders[tableId].orders[orderId].made = !orders[tableId].orders[orderId].made
    res.status(200).send()
    return
  })
}