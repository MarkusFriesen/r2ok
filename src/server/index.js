const express = require('express')
const startOrderSynchonization = require('./synchronizer.js')
const app = express()
const routes = require('./routes')
const config = require('./config')
const path = require('path')

routes(app)

app.use(express.static(path.join(__dirname + '/public')))

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(config.port, () => {
  console.log(`App listening at http://localhost:${config.port}`)
})

startOrderSynchonization()