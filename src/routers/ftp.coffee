module.exports = (app, express) =>
  {FtpCtr}  = require '../controllers/ftp.coffee'
  ftpController = new FtpCtr()
  ftpRouter = express.Router()

  ftpRouter.route('/provider')
  .post ftpController.addFtp
  .put ftpController.updateFtp

  ftpRouter.route('/files')
  .post ftpController.findProviderFile
  .get ftpController.getSizeFolder

  ftpRouter.route('/filescount')
  .post ftpController.countFtpFiles
  .get ftpController.getSizeFolder
  .put ftpController.getChartStadist

  ftpRouter.route('/provider/:parms')
  .get ftpController.getProviders
  .delete ftpController.deleteProvider
  .post ftpController.scannerProvider

  app.use('/prov', ftpRouter)


