module.exports = (app, express) =>
  {UserCtr}  = require '../controllers/user.coffee'
  userController = new UserCtr()
  userR = express.Router()
  userR.route('/signup').post userController.signup
  userR.route('/login').post userController.authenticate
  userR.route('/get').get userController.getUser

  app.use('/user', userR);