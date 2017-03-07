# sudo apt-get install lftp
{Provider} = require './base.coffee'
lftp = __non_webpack_require__ 'ftps'
path = __non_webpack_require__ 'path'
class SSHProvider extends Provider
  constructor: ->
    super
    @sshClient = {}

  connectToServer: (next) =>
    try
      config =
        host: @prover.uri
        username: @prover.user
        password: @prover.password
        protocol: 'sftp'
        port: 22
        escape: true
        retries: 2
        timeout: 10
        retryInterval: 5
        retryMultiplier: 1
        requiresPassword: true
        additionalLftpCommands: ''
      @sshClient = new lftp(config)
      return next()
    catch error
      console.log 'ERROR', error
      return next()

  readPath: (path, next)=>
    files = []
    folders = []
    @sshClient.cd(path)
    .raw('ls')
    .exec (err, res) =>
      @statFiles path, res.data, (filesFound, foldersFound)->
        next filesFound, foldersFound

  statFiles: (path, files, next) ->
    listReturn = []
    list = files.split "\n"
    folders = []
    list.map (line) =>
      isFile = "#{line[0]}#{line[1]}" is 'dr'
      file =
        prov: 'some'
        name: 'some'
        dir: path
        atime: 'some'
        file: not isFile
        size: 'some'
      dd = line.split ':'
      if [''].indexOf(dd) is -1
        if dd[1]
          name = dd[1].substr(3, dd[1].length - 1)
          if ['.', '..'].indexOf(name) is -1
            aa = dd[1].substr 0, 2
            file.name = name
            dd = dd[0].split ' '
            dd = dd.slice dd.length - 4, dd.length
            file.size = dd[0]
            date = dd.slice 1, 4
            date = date[0] + ' ' + date[1] + ' ' + date[2] + ':' + aa
            file.atime = Date.parse date
            listReturn.push file
            if not file.file
# is folder
              newPath = "#{path}/#{file.name}"
              if @ignoreDir newPath, file.name
                console.log newPath
                folders.push newPath

    next listReturn, folders

exports.SSHProvider = SSHProvider