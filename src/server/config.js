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
  useTrainingData: false
}
module.exports = config