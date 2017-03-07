{process} = global

config =
  db:
    uri: process.env.MONGO_URL or 'mongodb://127.0.0.1/ngexplorercoffee'
    options:
      db:
        native_parser: true
      server:
        poolSize: 5
  proxy: process.env.SCRAPING_PROXY or 'http://127.0.0.1:3128'
  useProxy: false
  debug: true
  esClient:
    useElastic: true
    indexName: 'gustayo'
    type: 'file'
    config:   
      host: '127.0.0.1:9200'
      #log: 'trace'

exports.config = config
