mongoose = __non_webpack_require__('mongoose')
uniqueValidator = __non_webpack_require__('mongoose-unique-validator')
Schema = mongoose.Schema
UserSchema = new Schema
  email:
    type: String
    trim: true
    lowercase: true
    unique: true
    index: true,
    required: 'Email address is required'
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  fistlastname: String
  secondlastname: String
  username:
    type: String
    required: true
  password:
    type: String
    select: false
    required: true
  role: String
  create:
    type: Date,
    default: Date.now

UserSchema.plugin uniqueValidator, message: 'error_unique_{PATH}', type: 'mongoose-unique-validator'
exports.User = mongoose.model 'user', UserSchema