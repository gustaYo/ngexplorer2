{Provider} = require './base.coffee'
#SMB2 = __non_webpack_require__ '@marsaud/smb2'
SMB2 = __non_webpack_require__ 'smb2'
path = __non_webpack_require__ 'path'
class SMBProvider extends Provider
  constructor: ->
    super
    @smb2Client = {}

  connectToServer: (next) =>
    try
      config =
# \\\\192.168.1.6\\media
        share: '\\\\10.12.36.35\\pruebaa'
        domain: 'WORKGROUP'
        username: 'copi'
        password: '123456'
        debug: true
        autoCloseTimeout: 0
      @smb2Client = new SMB2(config)
      return next()
    catch error
      console.log 'ERROR', error
      return next()

  readPath: (path, next)=>
    files = []
    folders = []
    console.log path

    @smb2Client.readdir '\\node_modules', (err, fils) =>
      console.log path
      if err
        console.log 'error----', err
      console.log 'filesss', fils
    next files, folders

exports.SMBProvider = SMBProvider