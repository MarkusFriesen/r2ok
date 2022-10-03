const express = require('express')
const {startOrderSynchonization} = require('./synchronizer.js')
const app = express()
const routes = require('./routes')
const config = require('./config')
const path = require('path')
const winston = require('winston');
const {format, transports} = winston
const {combine, timestamp, simple, printf} = format;

const myFormat = printf(({level, message, timestamp}) => {
  return `${timestamp} ${level}: ${message}`;
});

winston.add(new transports.Console({
  format: simple()
}));

winston.add(new transports.File({
  ...config.logger,
  format: combine(
    timestamp(),
    myFormat
  )
}));

routes(app)

app.use(express.static(path.join(__dirname + '/public')))
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

function logErrors(err, req, res, next) {
  winston.error(`[${req.url}] API Error: ${err.stack}`, )
  next(err)
}
app.use(logErrors)

app.listen(config.port, () => {
  winston.info(`[index] App listening at http://localhost:${config.port}`)
})

startOrderSynchonization()