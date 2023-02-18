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
    couponPath: './data/couponStorage.json'
  },
  useTrainingData: false,
  fetch: {
    //Fetch the latest products on Thrusday, Friday and Saturday at 6:30pm
    productsCron: '30 18 * * 4,5,6',
    // Fetch all orders every 15 seconds
    orderCron: '*/15 * * * * *'
  }
}
module.exports = config