elasticsearch = __non_webpack_require__('elasticsearch')
{config} = require '../config.coffee'
class ElasticClient
  constructor: (@config = null)->
    @clientelastic = new elasticsearch.Client @config or (host: '127.0.0.1:9200')
    @ping (error)->
      if error
        console.log error
      else
        console.log 'elasticsearch is well'
    @timeTimeout = 1
    @lastCount = 0
    @settings =
      "index":
        "analysis":
          "filter":
            "myNGramFilter":
              "type": "edgeNGram"
              "min_gram": 1
              "max_gram": 40
          "analyzer":
            "myNGramAnalyzer":
              "type": "custom"
              "tokenizer": "standard"
              "filter": ["lowercase", "myNGramFilter"]
        "mappings":
          "file":
            "properties":
              "name":
                "type": "string"
                "index_analyzer": "myNGramAnalyzer"
                "search_analyzer": "standard"

    @body =
      properties:
        dir:
          "type": "string", "index": "not_analyzed"
    @indexName = config.esClient.indexName
    @type = config.esClient.type


  ping: (next) =>
    if config.esClient.useElastic
      @clientelastic.ping requestTimeout: Infinity, hello: "elasticsearch!", (error) =>
        if error
            console.log 'The elasticsearch server in the configuration is activated but now it is down so I can not synchronize anything.'
            config.esClient.useElastic = false
            next('elasticsearch cluster is down!')
        else
          config.esClient.useElastic = true
          #@deleteAllIndexs().then () => console.log 'delete all'
          next()



  getClient: () =>
    return @clientelastic

  bulkFlush: (files, next) =>
    @clientelastic.bulk body: files, next

  bulkAdd: (br, filesToIndex, indexElasticName, type) =>
    for f in filesToIndex
      br.push index:
        _index: indexElasticName, _type: type
      br.push f
    return br

  bulkDelete: (br, filesToDelete, indexElasticName, type) =>
    for f in filesToDelete
      br.push delete:
        _index: indexElasticName, _type: type, _id: f._id
    return br

# verifica que no haya otra opcion de insertar o eliminar al determinar en el tiempo si hay variacion de la cantidad de archivos en la base de datos de elasticsearch
  freeEsClient: (next) =>
    timeTimeout = 1
    isEsClientFree = () =>
      clearTimeout timeTimeout
      @elasticCount (num) =>
        if num is @lastCount
          next()
        else
          @lastCount = num
          console.log num, 'espera'
          timeTimeout = setTimeout () =>
            isEsClientFree()
          , 2000
    isEsClientFree()

  synchronize: (query, MongoDbModel, perPage, indexElasticName, type, next) =>
    allTotalFilesToInsert = 0
    skip = 0
    page = 1
    MongoDbModel.count query, (err, count) =>
      allTotalFilesToInsert = count
      console.log "sincronizando", allTotalFilesToInsert, 'documentos'
      recurInsertBulk = () =>
        @freeEsClient () =>
          @findFiles query, MongoDbModel, skip, perPage, (err, files) =>
            if files.length is 0
              next()
            else
              create_bulk = @bulkAdd [], files, indexElasticName, type
              @bulkFlush create_bulk, (err, resp) =>
                create_bulk = []
                skip = skip + perPage
                console.log "iteracion", page, "/", parseInt(allTotalFilesToInsert / perPage) + 1
                page += 1
                recurInsertBulk()
      recurInsertBulk()


  findFiles: (query, MongoDbModel, skip, perPage, next) =>
    MongoDbModel.find query
    .select '-_id'
    .limit perPage
    .skip(skip)
    .exec next

  initIndex: (indexName, settings) =>
    @clientelastic.indices.create
      index: indexName
      body:
        settings: settings

  indexExists: (indexElasticName) =>
    @clientelastic.indices.exists index: indexElasticName

  deleteAllIndexs: () =>
    @clientelastic.indices.delete index: "_all"

  deleteIndex: (indexElasticName)=>
    @clientelastic.indices.delete index: indexElasticName

  initMapping: (indexElasticName, body, type) =>
    @clientelastic.indices.putMapping
      index: indexElasticName,
      type: type,
      body: body

  elasticCount: (next)=>
    @clientelastic.count index: @indexName, (error, response) =>
      next(response.count)

  foundInitIndex: (indexName, settings, body, type, next) =>
    @indexExists(indexName).then (exists) =>
      if exists
        console.log 'Everything looks good'
        next()
      else
        @initIndex(indexName, settings).then () =>
          @initMapping(indexName, body, type).then () =>
            next()

  deleteFilesIndex: (parm, indexElasticName, type, next) =>
    console.log parm
    @foundInitIndex indexElasticName, @settings, @body, type, () =>
      timeTimeout = setTimeout () =>
        @deleteAllFilesProv indexElasticName,parm,type, (numFound) =>
          next()
      , 200

  findFilesDir: (parms, next)=>
    searchParams=
      index: @indexName
      size: 500
      body:
        query:
          match:
            dir: parms.dir
        filter:
          and:
            [
              term: 
                prov: parms.prov or 'prueba'
            ]
    @clientelastic.search searchParams, next      

  findFilesProv: (parms, next) =>
    extname =
      regexp:
        name: ".*" + '' + ".*"
    if parms.extname
      extname.regexp.name = ".*" + parms.extname + ".*"
    searchParams =
      index: @indexName
      from: 0
      size: 100
      body:
        query:
          match_phrase_prefix:
            name: encodeURIComponent(parms.name.toLowerCase())
        filter:
         and:
           [
             terms:
               prov: parms.provs.split ','
             extname
           ]

    @clientelastic.search searchParams, next


  deleteAllFilesProv: (indexName, parms, type, next) =>
    allRecords = []
    count = 0
    @clientelastic.search
      index: indexName
      type: type
      scroll: '30s'
      search_type: 'scan'
      fields: ['name']
      q: 'prov:' + parms.prov
    ,getMoreUntilDone =(error, response) =>
      if response.hits
        count += response.hits.hits.length
        response.hits.hits.map (hit) -> allRecords.push hit
        if count%15000 is 0
          console.log 'hit count->',count
        if response.hits.total is count
          create_bulk = @bulkDelete [], allRecords, indexName, 'file'
          @freeEsClient () =>
            @bulkFlush create_bulk, (err, resp) =>
              create_bulk = []
              allRecords = []
              @freeEsClient () =>
                next count
        else
          @clientelastic.scroll
            scrollId: response._scroll_id,
            scroll: '10s'
          ,getMoreUntilDone
      else
        console.log 'not found files to delete'
        next(0)


exports.ElasticClient = ElasticClient