async = __non_webpack_require__ 'async'
fs = __non_webpack_require__ 'fs'
mongoose = __non_webpack_require__('mongoose')
class Provider
  constructor: (@prover = null) ->
    @totalFilesFound = 0
    @isReady = false
    @FileModel = mongoose.model 'file'

  connectToServer: (next) ->
    next()
  closeConnection: ()  ->
    console.log 'terminado'

  scraperDir: (dirScann, next) =>
    @connectToServer () =>
      console.log 'iniciando scanner ', @prover.name, dirScann
      timeConsult = new Date().getTime()
      filesFound = 0
      foldersFound = []
      intents = []
      q = async.queue (dir, callback) =>
        @readPath dir, (filesF, foldersFound) =>
          if not filesF and not @isReady
            return next false, foldersFound
          else
            if not filesF
# darle N oportunidades
              post = intents.indexOf dir
              if post is -1
                intents.push dir
                q.push dir, (err) -> console.log 'intento de conexion', dir
                callback()
              else
                callback()
            else
              post = intents.indexOf dir
              if post is -1
                intents.splice post, 1
              @isReady = true
              filesFound += filesF.length
              @insertMultilpleDB filesF, () ->
# insert files
              q.push foldersFound, (err) -> # console.log '->', dir
              callback()
      , @prover.thread or 3
      q.drain = =>
        @closeConnection()
        next filesFound
        filesFound = 0
        demoro = new Date().getTime() - timeConsult
        demoro = demoro / 1000
        console.log 'escaneado en ', demoro


      q.unshift dirScann, (err) ->
        console.log 'Inciando->', dirScann

  ignoreDir: (dir) =>
# dir = decodeURIComponent(dir)
    post = @prover.ignore.indexOf(dir)
    return post is -1

  concatArray: (a, b) ->
    for n in b
      a.push n
    return a

  insertMultilpleDB: (files, next) =>
    @FileModel.collection.insert files, (err) =>
      next()

  extnameFile: (name) ->
    extname = name.split('.')
    return extname[extname.length - 1]
exports.Provider = Provider