{Provider} = require './base.coffee'
{config} = require '../../config.coffee'
request = __non_webpack_require__ 'request'
cheerio = __non_webpack_require__ 'cheerio'
class HTTPProvider extends Provider
  constructor: ->
    super

  promisify: (url) =>
    params =
      url: url,
      pool:
        maxSockets: 2
      headers:
        'Accept': 'text/plain'
      proxy: if config.useProxy then config.proxy else null
    return new Promise (resolve, reject) ->
      request params, (error, response, body) ->
        if not error and response.statusCode is 200
          resolve body
        else
          reject error

  makeRequest: (url, callback) ->

    params =
      url: url,
      pool:
        maxSockets: 2
      headers:
        'Accept': 'text/plain'
      proxy: if config.useProxy then config.proxy else null

    request params, callback

  endConnection: (req) ->
    if req
      req.abort()
      req.destroy()


  readPath: (path, next)=>
    path = path.replace('//', '/')
    #console.log path
    url = @prover.uri + path + '/'
    reqObj = @makeRequest url, (error, response, body) =>
      if not error and response.statusCode is 200
        filesFolders = @parseBodyProvider(path, @prover, body)
        @endConnection reqObj
        next filesFolders.files, filesFolders.folders
      else
        @endConnection reqObj
        if @isReady
          next false, []
        else
          next false, error

  dirIsValid: (dir) =>
    if dir
      index = ['../', '..', '?C=N;O=A', '?C=M;O=A', '?C=S;O=A', '?=D;O=A', '?C=N;O=D', '?C=D;O=A', '#'].indexOf(dir)
      if index is -1
# elimina ciclos infinitos
        if dir.substring(dir.length - 3, dir.length - 1) is '//'
          console.log 'infinito'
          return false
        return true
      else
        return false

  validURL: (link) ->
    regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/
    return regex.test(str)


  parseBodyProvider: (path, prov, body) =>
    #console.log path
    files = []
    folders = []
    prover = @prover
    ignoreDir = @ignoreDir
    valid = @dirIsValid
    dom = cheerio.load(body)
    dom(prov.queryName)
    .each () ->
      href = dom(this).attr('href')
      try
        href = href.replace prov.uri, ""
      catch error
# no se puedo reemplazar
      if valid href
        if dom(this).text() is "Parent Directory"
          console.log 'nop'
        else
          if href[href.length - 1] is '/'
            name = href.substring 0, href.length - 1
            if ignoreDir path + '/' + name
              folder =
                dir: path
                name: name
                prov: prover._id
                file: false
              files.push folder
              folders.push folder.dir + '/' + folder.name
          else
            size = ""
            fecha = ""
            if not prov.queryDate or prov.queryDate is ''
              try
                text = dom(this)[0].nextSibling.nodeValue.trim()
                resultText = ""
                foundSpace = false
                text = text.split(' ')
                size = text[text.length - 1]
                fecha = Date.parse(text[0] + ' ' + text[1])
              catch error
                console.log 'error'
            else
              if prov.queryDate
                query = prov.queryDate.split(':')
                ele = query[0]
                numnext = query[1]
                if numnext is 'first'
                  fecha = dom(this).parent().next(ele).text()
                else
                  if numnext is 'second'
                    fecha = dom(this).parent().next(ele).next(ele).text()
                fecha = Date.parse(fecha)
              if prov.querySize
                query = prov.querySize.split(':')
                ele = query[0]
                numnext = query[1]
                if numnext is 'first'
                  size = dom(this).parent().next(ele).text()
                else
                  if numnext is 'second'
                    size = dom(this).parent().next(ele).next(ele).text()
                size = size.trim()
            file =
              prov: prover._id
              name: href
              dir: path
              atime: fecha
              file: true
              size: size
            files.push file
    return {files, folders}


exports.HTTPProvider = HTTPProvider