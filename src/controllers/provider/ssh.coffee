# sudo apt-get install lftp
{Provider} = require './base.coffee'
path = __non_webpack_require__ 'path'
Client_ = __non_webpack_require__ 'ssh2'
Client = Client_.Client

class SSHProvider extends Provider
  constructor: ->
    super
    @sshClient = new Client()
    @sftp = null
    @config =
      host: @prover.uri
      username: @prover.user
      password: @prover.password
      port: 22

  connectToServer: (next) =>
    try
      @sshClient.connect @config
      @sshClient.on 'ready', () =>
        @sshClient.sftp (err, sftp) =>
          @sftp = sftp
          console.log 'ssh is redy'
          return next()
    catch error
      console.log 'ERROR', error
      return next()

  closeConnection: () ->
    console.log ('cerrada la conexion')
    @sshClient.end()

  readPath: (path, next) =>
    files = []
    folders = []
    path = path.replace '//', '/'
    @sftp.readdir path, (err, list) =>
      list.forEach (file) =>
        if file.longname[0] is 'd'
          join = "/";
          if path is '/'
            join = ''
          newPaht = path + join + file.filename
          if @ignoreDir newPaht, file.filename
            folder =
              dir: path
              name: file.filename
              provider: @prover._id
            files.push folder
            folders.push newPaht
        else
          stats = JSON.parse(JSON.stringify(file.attrs))
          file =
            provider: @prover._id
            name: file.filename
            extname: @extnameFile file.filename
            dir: path
            size: stats.size
            atime: stats.atime
            file: true
          files.push file
      next files, folders


exports.SSHProvider = SSHProvider