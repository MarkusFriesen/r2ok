const config = {
  authorizationKey: '',
  port: 8080,
  logger:{
    filename: "combined.log",
    dirname: ".",
    maxsize: "5242880",
    maxFiles: 3
  },
  storage: {
    filePath: './data/orderStorage.json',
    couponPath: './data/couponStorage.json',
    togoPath: './data/togoStorage.json'
  },
  // Writes to the files above are batched, a hard crash loses at most this many seconds of changes.
  // A clean shutdown always flushes right away
  persistDelaySeconds: {
    orders: 30,
    togo: 30,
    coupons: 0
  },
  // To-go orders are invoiced right away, so they are read from the invoices.
  // Show the ones of the last 45 minutes, done ones disappear after that
  togoWindowMinutes: 45,
  useTrainingData: false,
  fetch: {
    //Fetch the latest products on Thrusday, Friday and Saturday at 6:30pm
    productsCron: '30 18 * * 4,5,6',
    // Fetch all orders every 15 seconds
    orderCron: '*/15 * * * * *'
  }
}
module.exports = config