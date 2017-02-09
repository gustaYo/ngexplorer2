express = __non_webpack_require__ 'express'
morgan = __non_webpack_require__ 'morgan'
bodyParser = __non_webpack_require__ 'body-parser'
ejs = __non_webpack_require__ 'ejs'
mongoose = __non_webpack_require__ 'mongoose'
http = __non_webpack_require__ 'http'
path = __non_webpack_require__ 'path'
ip = __non_webpack_require__ 'ip'
config = require './src/config.coffee'
{ process } = global
projectRoot = __dirname or path.resolve(process.argv[1], '../')

console.log ip.address(),'root -> ',projectRoot

{ config: db: { uri, options } } = config
app = express()
app.use bodyParser.json {limit: '50mb'}
app.use bodyParser.urlencoded
  limit: '50mb',
  extended: true,
  parameterLimit:50000

app.set('views', "#{projectRoot}/views")
app.engine 'html', ejs.renderFile
app.set 'view engine', 'html' 
oneYear = 365 * 86400000
app.use express.static "#{projectRoot}/public", {maxAge: oneYear}

require('./src/routers/index.coffee') app, express
mongoose.connect uri, options
db = mongoose.connection
start = (done) ->
  webServer = http
    .createServer app
    .listen 3311
  webServer.on 'listening', () =>
    done()
db.on 'error', ({ name, message }) ->
  console.log 'Failed to connect:', name
  console.log message

db.once 'open', ->
  console.log "we're connected! Let's get started\n"
  start ->
    console.log "server express run"


    


