module.exports = (app, express) =>
  app.route('/').get (req, res) ->
    res.render('vue')
  app.all('*', (req, res, next) ->
    res.header "Access-Control-Allow-Origin", "*"
    res.header 'Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE'
    res.header "Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With"
    if 'OPTIONS' is req.method
      return res.sendStatus(200)
    next()
  )
  require('./ftp.coffee')(app, express)
  require('./user.coffee')(app, express)
  