mongoose = __non_webpack_require__('mongoose')
Schema = mongoose.Schema
LogSchema = new Schema
  browser: String
  browser_version: String
  device: String
  os: String
  ip: String
  type: String
  search: String
  client: String # angular2,vue2,react
  create:
    type: Date,
    default: Date.now

exports.Logs = mongoose.model 'log', LogSchema