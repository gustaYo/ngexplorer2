{User} = require '../models/user.coffee'
path = __non_webpack_require__ 'path'
async = __non_webpack_require__ 'async'
moment = __non_webpack_require__ 'moment'
fs = __non_webpack_require__ 'fs'
{config} = require '../config.coffee'
jwt = __non_webpack_require__ 'jsonwebtoken'
useragent = __non_webpack_require__ 'express-useragent'
requestIp = __non_webpack_require__ 'request-ip'
bcrypt = __non_webpack_require__('bcrypt')

{process} = global

class UserCtr
  constructor: () ->

  signup: (req, res) =>
    newUser = new User req.body
    newUser.password = bcrypt.hashSync req.body.password, bcrypt.genSaltSync 10 
    newUser.save (err) =>
      if err
        console.log err
        return res.status(401).json { success: false, msg: 'user_already_exists' }
      return res.status(200).json { success: true, msg: 'user_created_successfully' }

  authenticate: (req, res) =>
    User.findOne username: req.body.username, '+password', (err, userFound) =>
      if err
        throw err
      if not userFound
        res.status(401).json { success: false, msg: 'user_not_found' }
      else
        if bcrypt.compareSync req.body.password, userFound.password
          userFound.password = null
          token = @generateToken userFound._id, req, (token) ->
            res.status(200).json { success: true, data: user: userFound , token: 'JWT ' + token }
        else
          res.status(401).send { success: false, msg: 'wrong_password' }

  generateToken: (userId, req, next) =>
    jwt.sign userId: userId, expiresIn: '2 days', config.secret , (err, token) ->
      return next (token)

  verifyToken: (token) =>
    try
      decoded = jwt.verify(token, config.secret);
      console.log decoded
    catch err
      console.log err

  getUser: (req, res) =>
    queryParms = req.query
    username = queryParms.username
    User.findOne username: queryParms.username, (err, userFound) =>
      if err
        throw err
      if not userFound
        res.status(401).json { success: false, msg: 'user_not_found' }
      else
        res.status(200).json { success: true, data: user: userFound }



exports.UserCtr = UserCtr    