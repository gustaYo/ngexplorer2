module.exports = (app, express) =>
  {FtpCtr}  = require '../controllers/ftp.coffee'
  ftpController = new FtpCtr()
  ftpRouter = express.Router()

  ftpRouter.route('/provider')
  .post ftpController.addProvider
  .delete ftpController.deleteProvider
  .get ftpController.getProvider

  ftpRouter.route('/files')
  .post ftpController.findProviderFile
  .get ftpController.getFile

  ftpRouter.route('/filestatistics')
  .post ftpController.countFtpFiles
  .get ftpController.getChartStadist

  ftpRouter.route('/fileadmin')
  .post ftpController.scannerProvider
  .put ftpController.sincronize
  .get ftpController.testSincronize
  
  app.use('/prov', ftpRouter)


