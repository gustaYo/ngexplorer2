module.exports = (app, express) =>
  app.route('/react').get (req, res) ->
    res.render('vue')