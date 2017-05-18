mongoose = __non_webpack_require__('mongoose')
mongoosastic = __non_webpack_require__('mongoosastic')
Schema = mongoose.Schema
ProviderSchema = new Schema
  name:
    type: String
    required: 'Name is required'
    unique: true
    trim: true
  user: String
  pass: String
  uri: String
  rootdir: String
  port: String
  type: String
  queryName: String
  queryDate: String
  querySize: String
  ignore: Array
  thread: Number
  update:
    type: Date,
    default: Date.now
  create:
    type: Date,
    default: Date.now


FileSchema = new Schema
  name:
    type: String
    sparse: true
  extname: String
  dir: String
  size: String
  time: String
  prov: String


# FileSchema.plugin(
#  mongoosastic,
#  bulk:
#    size: 2000
#    delay: 300
#    batch: 2000
#    esClient: esClient.getClient()
#  )

exports.Ftp = mongoose.model 'provider', ProviderSchema
exports.File = mongoose.model 'file', FileSchema