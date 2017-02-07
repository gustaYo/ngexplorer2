{Provider} = require './base.coffee'
fs = __non_webpack_require__ 'fs'
async = __non_webpack_require__ 'async'
class LOCALProvider extends Provider
  constructor: ->
    super

  readPath: (path, next)=>
    fs.readdir path, (err, files) =>
      if err
        console.log('hubo algun error al leer el directorio', path)
        next([], [])
      else
        @statFiles path, files, (filesFound, foldersFound) ->
          next filesFound, foldersFound

  statFiles: (path, files, next) =>
    console.log path
    folders = []
    filesR = []
    prover = @prover
    asd = async.queue (file, callback) =>
      newPath = path + '/' + file
      fs.stat newPath, (err, stat) =>
        if err
          console.log 'errorr'
          callback()
        else
          if stat.isFile()
            newFile =
              prov: prover._id
              name: file
              dir: path
              atime: stat.atime
              file: true
            filesR.push newFile
            callback()
          else if stat.isDirectory()
            if @ignoreDir path + '/' + file
              folder =
                dir: path
                name: file
                prov: prover._id
                file: false
              filesR.push folder
              folders.push(path + '/' + file)
            callback()
    , 8
    asd.drain = =>
      next filesR, folders

    asd.unshift files, (err) ->
# obteniendo datos de archivos en directorio


exports.LOCALProvider = LOCALProvider