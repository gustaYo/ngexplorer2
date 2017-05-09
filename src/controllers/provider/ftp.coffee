{Provider} = require './base.coffee'
FtpClient = __non_webpack_require__ 'ftp'
path = __non_webpack_require__ 'path'
class FTPProvider extends Provider
  constructor: ->
    super
    @clientFtp = new FtpClient()

  connectToServer: (next) =>
    try
      config =
        host: @prover.uri
        port: if @prover.port then @prover.port else ''
        user: if @prover.user then @prover.user else ''
        password: if @prover.password then @prover.password else ''
      @clientFtp.connect config

      @clientFtp.on 'ready', () =>
        console.log 'ftp is redy'
        return next()

    catch error
      console.log 'fsdfdsf', error
      return 'nea'

  closeConnection: ()  ->
    console.log ('cerrada la conexion')
    @clientFtp.end()

  readPath: (path, next)=>
    files = []
    folders = []
    path = path.replace '//', '/'
    @clientFtp.list path, (err, list) =>
      if err
        console.log err
      else
        list.forEach (file) =>
          name = file.name
          try
            name = decodeURIComponent escape file.name
          catch error
# no se pudo escapar el name
          if file.type is 'd'
            join = "/";
            if path is '/'
              join = ''
            newPaht = path + join + name
            if @ignoreDir newPaht, name
              folder =
                dir: path
                name: name
                provider: @prover._id
              files.push folder
              folders.push newPaht
          else
            file =
              provider: @prover._id
              name: file.name
              extname: @extnameFile file.name
              dir: path
              size: file.size
              atime: new Date(file.date).getTime()
              file: true
            files.push file
      next files, folders

exports.FTPProvider = FTPProvider