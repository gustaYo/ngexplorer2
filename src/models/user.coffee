mongoose = __non_webpack_require__('mongoose')
Schema = mongoose.Schema
UserSchema = new Schema
  email: String
  name: String
  fistlastname: String
  secondlastname: String
  username: String
  password: String
  role: String
  create:
    type: Date,
    default: Date.now

exports.File = mongoose.model 'user', UserSchema