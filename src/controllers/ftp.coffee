{Providers} = require './provider/base.coffee'
{FactoryProvider} = require './provider/factory.coffee'
{ElasticClient} = require './elasticClient.coffee'
{Ftp, File} = require '../models/provider.coffee'
{Logs} = require '../models/logs.coffee'
{config} = require '../config.coffee'
async = __non_webpack_require__ 'async'
moment = __non_webpack_require__ 'moment'
path = __non_webpack_require__ 'path'

class FtpCtr
  constructor: () ->
    @esClient = new ElasticClient(config.esClient.config)
    @useElastic = false
    @charResult =
      time: moment(moment().startOf 'day').add 1, 'days'
      result: false

    # providers examples  
    localTEST =
      type: 'local'
      _id: 'providerLocalDirectories'
      name: 'providerLocalDirectories'
      rootdir: '/'
      ignore: ["#{__dirname}/node_modules"]

    ftpTEST =
      type: 'ftp'
      _id: 'providerFtp'
      name: 'providerFtp'
      rootdir: '/'
      uri: 'ftp.asd.cu'
      ignore: []
      thread: 3

    httpTEST =
      type: 'http'
      _id: 'providerHttpStore'
      name: 'providerHttpStore'
      rootdir: '/',
      uri: 'http://store.asd.cu'
      ignore: []
      thread: 4,
      queryName: 'a'

    smbTEST =
      type: 'smb'
      _id: 'smb'
      name: 'SharedFolder'
      rootdir: '\\node_modules'
      uri: '\\\\192.168.1.6\\media'
      ignore: []

    # some example
    parms =
      prov: ftpTEST._id
      dir: '/ISOS'
    #@runScannerPrivider ftpTEST,parms
    parms =
      prov: httpTEST._id
      dir: '/'
    @runScannerPrivider httpTEST,parms
    parms =
      prov: localTEST._id
      dir: __dirname
    @runScannerPrivider localTEST,parms


  runScannerPrivider: (provi,parms)=>
    prov = new FactoryProvider(provi).factory()
    timeTimeout = setTimeout () =>
      @scannerProvider parms, prov, (err)=>
        if err
          console.log err
        prov = null
    , 1000


  providerScanner: (req, res) =>
    data = req.body
    provider = new FactoryProvider(data).factory()
    wait = 1
    @removeFilesMongo prov: data.prov, () =>
      wait = setTimeout () =>
        return res.status(200).jsonp('ok')
      , 8000
      provider.scraperDir data.rootdir, (files, err) =>
        if not files
          console.log 'error', err
          clearTimeout wait
          return res.status(500).jsonp(err.message)
        else
          @removeFilesEsClient prov: parms.prov, () =>
            @syncronizeCollection prov: parms.prov, ()=>
              console.log 'Finished indexing'


  scannerProvider: (parms,prov, next) =>
    @removeFilesMongo prov: parms.prov, () =>
      prov.scraperDir parms.dir, (files, err) =>
        if not files
          console.log 'error', err
          next err
        else
          if config.esClient.useElastic
            @removeFilesEsClient prov: parms.prov, () =>
              @syncronizeCollection prov: parms.prov, ()=>
                console.log 'Finished indexing'
                next()
          else
            next()

  syncronizeCollection: (query, next) =>
    @esClient.synchronize query, File, 30000, config.esClient.indexName, config.esClient.type, next

  removeFilesEsClient: (query, next) =>
    @esClient.deleteFilesIndex query, config.esClient.indexName, config.esClient.type, next

  removeFilesMongo: (parms, next) =>
    console.log "borrando archivos de mongoDB"
    File.remove parms, (err) =>
      next()

  returnRes: (res, err, resp) ->
    if err
      return res.status(500).jsonp(err.message)
    else
      return res.status(200).jsonp(resp)

# obtener proveedor(es) registrados
  getProviders: (req, res) =>
    parms = req.params.parms
    if parms is 'all'
      Ftp.find (err, providers) =>
        @returnRes res, err, providers
    else
      Ftp.findOne _id: parms, (err, someProvider) =>
        @returnRes res, err, someProvider


  addFtp: (req, res) =>
    data = req.body
    ftp = new Ftp(data)
    ftp.save (err, newftp) =>
      @returnRes res, err, newftp

  updateFtp: (req, res) =>
    data = req.body
    id = data._id
    delete data['_id']
    Ftp.update {_id: id}, {$set: data}, (err) =>
      @returnRes res, err, 'ok'


#DELETE
#/prov/provider/%5B%58978625a413221e5cb8a37f%22%5D

  deleteProvider: (req, res) =>
    useElastic = false
    ids = JSON.parse req.params.parms
    Ftp.remove
      _id:
        $in: ids
    , (error) =>
      if error
        return res.status(500).jsonp err.message
      else
        File.remove
          prov:
            $in: ids
        , (error) =>
          if (error)
            return res.status(500).jsonp err.message
          else
          if useElastic
            async.mapLimit ids, 1
            , (server, next) =>
              @esClient.deleteFilesIndex prov: server, 'gustaaaa', 'file', next()
            , () ->
              console.log("eliminado todos lo dos en el servidor elastic")
          return res.status(200).jsonp('ok')

  findProviderFile: (req, res) =>
    data = req.body
    if data.type
      @searchFilter data, res
    else
      @listDirectoryProvider data, res

  searchFilter: (parms, res) ->
    parms.name = parms.name or ""
    if parms.useElastic
      console.log 'use elasticClient'
    else
      query = name: new RegExp(encodeURIComponent(parms.name), "i"), "prov":
        $in: parms.provs
      if parms.extname and parms.extname is not ''
        query.extname = new RegExp parms.extname, "i"
      File.find query
      .limit 50
      .exec (err, filesFound) ->
        if err
          res.status 500
          .send err
        else
          res.status 200
          .send filesFound

  listDirectoryProvider: (parms, res) ->
    if data.useElastic
      console.log 'use elastic'
    else
      FtpFiles.find parms
      .sort name: -1
      .exec (err, filesFound) ->
        if err
          res.status 500
          .send err
        else
          res.status 200
          .send filesFound

  countFtpFiles: (req, res) ->
    res.status 200
    .send 'ok'

  getSizeFolder: (req, res) ->
    parms = req.query
    if parms.useElastic
      console.log 'calculo usuando elastic'
    else
    join = if parms.directory is '/' then '' else '/'
    query = prov: parms.prov, dir: new RegExp('^' + parms.dir + join + parms.name + '.*$', "i"), extname:
      $exists: true
    File.find query,
      size: 1
      extname: 1
      time: 1
    .sort time: -1
    .exec (err, files) ->
      lastUpdate = ""
      size = 0
      if files.length > 0
        lastUpdate = files[0].time
      for f in files
        num = if isNaN parseInt f.size then 0 else parseInt f.size
        size += num
      File.update _id: parms._id,
        $set:
          size: size,
          time: lastUpdate
      , (err) ->
        res.status 200
        .send size

  saveLog: (log) ->
    tm = 15
    now = moment()
    past = moment(now).subtract tm, 'm'
    query =
      ip: log.ip
      created:
        $gte: past.toDate()
        $lt: now.toDate()
      type: log.type

    if log.type is 'f'
      query.search = log.search
    Logs.count query, (err, count) ->
      if count is 0
        logModel = new Logs log
        logModel.save()
      else
# este usuario ya registro un log en menos de tm pasado

  countAuxVisit: (today, tomorrow, next) ->
    async.parallel
      vunique: (callback) ->
        Logs.collection.distinct "ip",
          type: 'v'
          created:
            $gte: today.toDate()
            $lt: tomorrow.toDate()
        , (error, results) ->
          callback null, results.length
      vtotal: (callback) ->
        Logs.count
          type: 'v'
          created:
            $gte: today.toDate()
            $lt: tomorrow.toDate()
        , (err, count) ->
          callback null, count
      funique: (callback) ->
        Logs.collection.distinct "search",
          type: 'f'
          created:
            $gte: today.toDate()
            $lt: tomorrow.toDate()
        , (error, results) ->
          callback null, results.length

      vtotal: (callback) ->
        Logs.count
          type: 'f'
          created:
            $gte: today.toDate()
            $lt: tomorrow.toDate()
        , (err, count) ->
          callback null, count
      date: (callback) ->
        callback null, today.format()
      next



  calcCharts: (numdays, next) =>
    chartLog = []
    ahora = moment().startOf 'day'
    if @charResult.result
      if moment.min @charResult.time, ahora is ahora
        console.log("ya esta")
        return next @charResult.result
      else
        charResult.time = moment(moment().startOf 'day').add 1, 'days'
    Logs.findOne().exec (err, firtsLog) =>
      created = moment firtsLog.created
      _today = moment(firtsLog.created).startOf 'day'
      _tomorrow = moment(_today).add numdays, 'days'
      console.log "primer log", created.toDate(), _today.toDate(), _tomorrow.toDate()
      recurStadist = (today, tomorrow, numdays) =>
        @countAuxVisit today, tomorrow, (err, results) =>
          chartLog.push results
          today = tomorrow
          if moment.max tomorrow, ahora is ahora
            tomorrow = moment(today).add numdays, 'days'
            recurStadist today, tomorrow, numdays
          else
            charResult.result = chartLog
            return next chartLog
      recurStadist _today, _tomorrow, numdays

  getChartStadist: (req, res) =>
    parms = req.body
    @calcCharts parms.numdays, (chartLog)->
      res.status(200).send(chartLog)

  deleteFilesLost: () ->
    Ftp.find (err, ftps) ->
      ids = []
      ids = ftps.map (p) ->
        return p._id
      FtpFiles.remove ftp:
        $nin: ids
      , (error) ->
        console.log("eliminados Files que no pertenecen a nadie")

  convertToKB: (size) ->
    size = size.trim()
    if isNaN size
      toBytes = 1024 * 1024
      if size[size.length - 1] is 'G' or size[size.length - 2] is 'G'
        toBytes = toBytes * 1024
      if size[size.length - 1] is 'K' or size[size.length - 2] is 'K'
        toBytes = 1024
      megas = size.substring 0, size.length - 1
      num = if isNaN parseFloat megas then 0 else parseFloat megas
      size = num * toBytes
    return size

exports.FtpCtr = FtpCtr
