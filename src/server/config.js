const config = {
  authorizationKey: '',
  port: 8080,
  logger:{
    filename: "combined.log",
    dirname: ".",
    maxsize: "5242880",
    maxFiles: 3
  }
}
module.exports = config