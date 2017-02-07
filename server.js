/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var app, bodyParser, config, db, ejs, express, http, ip, mongoose, morgan, oneYear, options, path, process, projectRoot, ref, start, uri;
	
	express = require('express');
	
	morgan = require('morgan');
	
	bodyParser = require('body-parser');
	
	ejs = require('ejs');
	
	mongoose = require('mongoose');
	
	http = require('http');
	
	path = require('path');
	
	ip = require('ip');
	
	config = __webpack_require__(1);
	
	process = global.process;
	
	projectRoot = __dirname || path.resolve(process.argv[1], '../');
	
	console.log(ip.address(), 'root -> ', projectRoot);
	
	ref = config.config.db, uri = ref.uri, options = ref.options;
	
	app = express();
	
	app.use(bodyParser.json({
	  limit: '50mb'
	}));
	
	app.use(bodyParser.urlencoded({
	  limit: '50mb',
	  extended: true,
	  parameterLimit: 50000
	}));
	
	app.set('views', projectRoot + "/views");
	
	app.engine('html', ejs.renderFile);
	
	app.set('view engine', 'html');
	
	oneYear = 365 * 86400000;
	
	app.use(express["static"](projectRoot + "/public", {
	  maxAge: oneYear
	}));
	
	__webpack_require__(2)(app, express);
	
	mongoose.connect(uri, options);
	
	db = mongoose.connection;
	
	start = function(done) {
	  var webServer;
	  webServer = http.createServer(app).listen(3311);
	  return webServer.on('listening', (function(_this) {
	    return function() {
	      return done();
	    };
	  })(this));
	};
	
	db.on('error', function(arg) {
	  var message, name;
	  name = arg.name, message = arg.message;
	  console.log('Failed to connect:', name);
	  return console.log(message);
	});
	
	db.once('open', function() {
	  console.log("we're connected! Let's get started\n");
	  return start(function() {
	    return console.log("server express run");
	  });
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	var config, process;
	
	process = global.process;
	
	config = {
	  db: {
	    uri: process.env.MONGO_URL || 'mongodb://127.0.0.1/ngexplorercoffee',
	    options: {
	      db: {
	        native_parser: true
	      },
	      server: {
	        poolSize: 5
	      }
	    }
	  },
	  proxy: process.env.SCRAPING_PROXY || 'http://127.0.0.1:3128',
	  useProxy: false,
	  esClient: {
	    useElastic: true,
	    indexName: 'gustayo',
	    type: 'file',
	    config: {
	      host: '127.0.0.1:9200'
	    }
	  }
	};
	
	exports.config = config;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (function(_this) {
	  return function(app, express) {
	    app.route('/').get(function(req, res) {
	      return res.render('vue');
	    });
	    app.all('*', function(req, res, next) {
	      res.header("Access-Control-Allow-Origin", "*");
	      res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
	      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
	      if ('OPTIONS' === req.method) {
	        return res.sendStatus(200);
	      }
	      return next();
	    });
	    __webpack_require__(3)(app, express);
	    return __webpack_require__(14)(app, express);
	  };
	})(this);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (function(_this) {
	  return function(app, express) {
	    var FtpCtr, ftpController, ftpRouter;
	    FtpCtr = __webpack_require__(4).FtpCtr;
	    ftpController = new FtpCtr();
	    ftpRouter = express.Router();
	    ftpRouter.route('/provider').post(ftpController.addFtp).put(ftpController.updateFtp);
	    ftpRouter.route('/files').post(ftpController.findProviderFile).get(ftpController.getSizeFolder);
	    ftpRouter.route('/filescount').post(ftpController.countFtpFiles).get(ftpController.getSizeFolder).put(ftpController.getChartStadist);
	    ftpRouter.route('/provider/:parms').get(ftpController.getProviders)["delete"](ftpController.deleteProvider).post(ftpController.scannerProvider);
	    return app.use('/prov', ftpRouter);
	  };
	})(this);


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var ElasticClient, FactoryProvider, File, Ftp, FtpCtr, Logs, Providers, async, config, moment, path, ref,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	
	Providers = __webpack_require__(5).Providers;
	
	FactoryProvider = __webpack_require__(6).FactoryProvider;
	
	ElasticClient = __webpack_require__(11).ElasticClient;
	
	ref = __webpack_require__(12), Ftp = ref.Ftp, File = ref.File;
	
	Logs = __webpack_require__(13).Logs;
	
	config = __webpack_require__(1).config;
	
	async = require('async');
	
	moment = require('moment');
	
	path = require('path');
	
	FtpCtr = (function() {
	  function FtpCtr() {
	    this.getChartStadist = bind(this.getChartStadist, this);
	    this.calcCharts = bind(this.calcCharts, this);
	    this.findProviderFile = bind(this.findProviderFile, this);
	    this.deleteProvider = bind(this.deleteProvider, this);
	    this.updateFtp = bind(this.updateFtp, this);
	    this.addFtp = bind(this.addFtp, this);
	    this.getProviders = bind(this.getProviders, this);
	    this.removeFilesMongo = bind(this.removeFilesMongo, this);
	    this.removeFilesEsClient = bind(this.removeFilesEsClient, this);
	    this.syncronizeCollection = bind(this.syncronizeCollection, this);
	    this.scannerProvider = bind(this.scannerProvider, this);
	    this.providerScanner = bind(this.providerScanner, this);
	    this.testProvider = bind(this.testProvider, this);
	    var ftpTEST, httpTEST, localTEST, parms, smbTEST;
	    this.esClient = new ElasticClient(config.esClient.config);
	    this.useElastic = false;
	    this.charResult = {
	      time: moment(moment().startOf('day')).add(1, 'days'),
	      result: false
	    };
	    localTEST = {
	      type: 'local',
	      _id: 'providerLocalDirectories',
	      name: 'providerLocalDirectories',
	      rootdir: '/',
	      ignore: []
	    };
	    ftpTEST = {
	      type: 'ftp',
	      _id: 'providerFtp',
	      name: 'providerFtp',
	      rootdir: '/',
	      uri: 'ftp.xetid.cu',
	      ignore: [],
	      thread: 3
	    };
	    httpTEST = {
	      type: 'http',
	      _id: 'providerHttpStore',
	      name: 'providerHttpStore',
	      rootdir: '/',
	      uri: 'http://localhost:8000',
	      ignore: [],
	      thread: 4,
	      queryName: 'a'
	    };
	    smbTEST = {
	      type: 'smb',
	      _id: 'smb',
	      name: 'SharedFolder',
	      rootdir: '\\node_modules',
	      uri: '\\\\192.168.1.6\\media',
	      ignore: []
	    };
	    parms = {
	      prov: localTEST._id,
	      dir: __dirname + '/src'
	    };
	    this.testProvider(localTEST, parms);
	  }
	
	  FtpCtr.prototype.testProvider = function(provider, parms) {
	    var prov, timeTimeout;
	    prov = new FactoryProvider(provider).factory();
	    return timeTimeout = setTimeout((function(_this) {
	      return function() {
	        return _this.scannerProvider(parms, prov, function() {
	          return console.log('termine');
	        });
	      };
	    })(this), 5000);
	  };
	
	  FtpCtr.prototype.providerScanner = function(req, res) {
	    var data, provider, wait;
	    data = req.body;
	    provider = new FactoryProvider(data).factory();
	    wait = 1;
	    return this.removeFilesMongo({
	      prov: data.prov
	    }, (function(_this) {
	      return function() {
	        wait = setTimeout(function() {
	          return res.status(200).jsonp('ok');
	        }, 8000);
	        return provider.scraperDir(data.rootdir, function(files, err) {
	          if (!files) {
	            console.log('error', err);
	            clearTimeout(wait);
	            return res.status(500).jsonp(err.message);
	          } else {
	            return _this.removeFilesEsClient({
	              prov: parms.prov
	            }, function() {
	              return _this.syncronizeCollection({
	                prov: parms.prov
	              }, function() {
	                return console.log('Finished indexing');
	              });
	            });
	          }
	        });
	      };
	    })(this));
	  };
	
	  FtpCtr.prototype.scannerProvider = function(parms, prov, next) {
	    return this.removeFilesMongo({
	      prov: parms.prov
	    }, (function(_this) {
	      return function() {
	        return prov.scraperDir(parms.dir, function(files, err) {
	          if (!files) {
	            console.log('error', err);
	            return next(err);
	          } else {
	            if (config.esClient.useElastic) {
	              return _this.removeFilesEsClient({
	                prov: parms.prov
	              }, function() {
	                return _this.syncronizeCollection({
	                  prov: parms.prov
	                }, function() {
	                  console.log('Finished indexing');
	                  return next();
	                });
	              });
	            } else {
	              return next();
	            }
	          }
	        });
	      };
	    })(this));
	  };
	
	  FtpCtr.prototype.syncronizeCollection = function(query, next) {
	    return this.esClient.synchronize(query, File, 30000, config.esClient.indexName, config.esClient.type, next);
	  };
	
	  FtpCtr.prototype.removeFilesEsClient = function(query, next) {
	    return this.esClient.deleteFilesIndex(query, config.esClient.indexName, config.esClient.type, next);
	  };
	
	  FtpCtr.prototype.removeFilesMongo = function(parms, next) {
	    console.log("borrando archivos de mongoDB");
	    return File.remove(parms, (function(_this) {
	      return function(err) {
	        return next();
	      };
	    })(this));
	  };
	
	  FtpCtr.prototype.returnRes = function(res, err, resp) {
	    if (err) {
	      return res.status(500).jsonp(err.message);
	    } else {
	      return res.status(200).jsonp(resp);
	    }
	  };
	
	  FtpCtr.prototype.getProviders = function(req, res) {
	    var parms;
	    parms = req.params.parms;
	    if (parms === 'all') {
	      return Ftp.find((function(_this) {
	        return function(err, providers) {
	          return _this.returnRes(res, err, providers);
	        };
	      })(this));
	    } else {
	      return Ftp.findOne({
	        _id: parms
	      }, (function(_this) {
	        return function(err, someProvider) {
	          return _this.returnRes(res, err, someProvider);
	        };
	      })(this));
	    }
	  };
	
	  FtpCtr.prototype.addFtp = function(req, res) {
	    var data, ftp;
	    data = req.body;
	    ftp = new Ftp(data);
	    return ftp.save((function(_this) {
	      return function(err, newftp) {
	        return _this.returnRes(res, err, newftp);
	      };
	    })(this));
	  };
	
	  FtpCtr.prototype.updateFtp = function(req, res) {
	    var data, id;
	    data = req.body;
	    id = data._id;
	    delete data['_id'];
	    return Ftp.update({
	      _id: id
	    }, {
	      $set: data
	    }, (function(_this) {
	      return function(err) {
	        return _this.returnRes(res, err, 'ok');
	      };
	    })(this));
	  };
	
	  FtpCtr.prototype.deleteProvider = function(req, res) {
	    var ids, useElastic;
	    useElastic = false;
	    ids = JSON.parse(req.params.parms);
	    return Ftp.remove({
	      _id: {
	        $in: ids
	      }
	    }, (function(_this) {
	      return function(error) {
	        if (error) {
	          return res.status(500).jsonp(err.message);
	        } else {
	          return File.remove({
	            prov: {
	              $in: ids
	            }
	          }, function(error) {
	            if (error) {
	              return res.status(500).jsonp(err.message);
	            } else {
	
	            }
	            if (useElastic) {
	              async.mapLimit(ids, 1, function(server, next) {
	                return _this.esClient.deleteFilesIndex(ids, 'gustaaaa', 'file', next());
	              }, function() {
	                return console.log("eliminado todos lo dos en el servidor elastic");
	              });
	            }
	            return res.status(200).jsonp('ok');
	          });
	        }
	      };
	    })(this));
	  };
	
	  FtpCtr.prototype.findProviderFile = function(req, res) {
	    var data;
	    data = req.body;
	    if (data.type) {
	      return this.searchFilter(data, res);
	    } else {
	      return this.listDirectoryProvider(data, res);
	    }
	  };
	
	  FtpCtr.prototype.searchFilter = function(parms, res) {
	    var query;
	    parms.name = parms.name || "";
	    if (parms.useElastic) {
	      return console.log('use elasticClient');
	    } else {
	      query = {
	        name: new RegExp(encodeURIComponent(parms.name), "i"),
	        "prov": {
	          $in: parms.provs
	        }
	      };
	      if (parms.extname && parms.extname === !'') {
	        query.extname = new RegExp(parms.extname, "i");
	      }
	      return File.find(query).limit(50).exec(function(err, filesFound) {
	        if (err) {
	          return res.status(500).send(err);
	        } else {
	          return res.status(200).send(filesFound);
	        }
	      });
	    }
	  };
	
	  FtpCtr.prototype.listDirectoryProvider = function(parms, res) {
	    if (data.useElastic) {
	      return console.log('use elastic');
	    } else {
	      return FtpFiles.find(parms).sort({
	        name: -1
	      }).exec(function(err, filesFound) {
	        if (err) {
	          return res.status(500).send(err);
	        } else {
	          return res.status(200).send(filesFound);
	        }
	      });
	    }
	  };
	
	  FtpCtr.prototype.countFtpFiles = function(req, res) {
	    return res.status(200).send('ok');
	  };
	
	  FtpCtr.prototype.getSizeFolder = function(req, res) {
	    var join, parms, query;
	    parms = req.query;
	    if (parms.useElastic) {
	      console.log('calculo usuando elastic');
	    } else {
	
	    }
	    join = parms.directory === '/' ? '' : '/';
	    query = {
	      prov: parms.prov,
	      dir: new RegExp('^' + parms.dir + join + parms.name + '.*$', "i"),
	      extname: {
	        $exists: true
	      }
	    };
	    return File.find(query, {
	      size: 1,
	      extname: 1,
	      time: 1
	    }).sort({
	      time: -1
	    }).exec(function(err, files) {
	      var f, i, lastUpdate, len, num, size;
	      lastUpdate = "";
	      size = 0;
	      if (files.length > 0) {
	        lastUpdate = files[0].time;
	      }
	      for (i = 0, len = files.length; i < len; i++) {
	        f = files[i];
	        num = isNaN(parseInt(f.size)) ? 0 : parseInt(f.size);
	        size += num;
	      }
	      return File.update({
	        _id: parms._id
	      }, {
	        $set: {
	          size: size,
	          time: lastUpdate
	        }
	      }, function(err) {
	        return res.status(200).send(size);
	      });
	    });
	  };
	
	  FtpCtr.prototype.saveLog = function(log) {
	    var now, past, query, tm;
	    tm = 15;
	    now = moment();
	    past = moment(now).subtract(tm, 'm');
	    query = {
	      ip: log.ip,
	      created: {
	        $gte: past.toDate(),
	        $lt: now.toDate()
	      },
	      type: log.type
	    };
	    if (log.type === 'f') {
	      query.search = log.search;
	    }
	    return Logs.count(query, function(err, count) {
	      var logModel;
	      if (count === 0) {
	        logModel = new Logs(log);
	        return logModel.save();
	      } else {
	
	      }
	    });
	  };
	
	  FtpCtr.prototype.countAuxVisit = function(today, tomorrow, next) {
	    return async.parallel({
	      vunique: function(callback) {
	        return Logs.collection.distinct("ip", {
	          type: 'v',
	          created: {
	            $gte: today.toDate(),
	            $lt: tomorrow.toDate()
	          }
	        }, function(error, results) {
	          return callback(null, results.length);
	        });
	      },
	      vtotal: function(callback) {
	        return Logs.count({
	          type: 'v',
	          created: {
	            $gte: today.toDate(),
	            $lt: tomorrow.toDate()
	          }
	        }, function(err, count) {
	          return callback(null, count);
	        });
	      },
	      funique: function(callback) {
	        return Logs.collection.distinct("search", {
	          type: 'f',
	          created: {
	            $gte: today.toDate(),
	            $lt: tomorrow.toDate()
	          }
	        }, function(error, results) {
	          return callback(null, results.length);
	        });
	      },
	      vtotal: function(callback) {
	        return Logs.count({
	          type: 'f',
	          created: {
	            $gte: today.toDate(),
	            $lt: tomorrow.toDate()
	          }
	        }, function(err, count) {
	          return callback(null, count);
	        });
	      },
	      date: function(callback) {
	        return callback(null, today.format());
	      }
	    }, next);
	  };
	
	  FtpCtr.prototype.calcCharts = function(numdays, next) {
	    var ahora, chartLog;
	    chartLog = [];
	    ahora = moment().startOf('day');
	    if (this.charResult.result) {
	      if (moment.min(this.charResult.time, ahora === ahora)) {
	        console.log("ya esta");
	        return next(this.charResult.result);
	      } else {
	        charResult.time = moment(moment().startOf('day')).add(1, 'days');
	      }
	    }
	    return Logs.findOne().exec((function(_this) {
	      return function(err, firtsLog) {
	        var _today, _tomorrow, created, recurStadist;
	        created = moment(firtsLog.created);
	        _today = moment(firtsLog.created).startOf('day');
	        _tomorrow = moment(_today).add(numdays, 'days');
	        console.log("primer log", created.toDate(), _today.toDate(), _tomorrow.toDate());
	        recurStadist = function(today, tomorrow, numdays) {
	          return _this.countAuxVisit(today, tomorrow, function(err, results) {
	            chartLog.push(results);
	            today = tomorrow;
	            if (moment.max(tomorrow, ahora === ahora)) {
	              tomorrow = moment(today).add(numdays, 'days');
	              return recurStadist(today, tomorrow, numdays);
	            } else {
	              charResult.result = chartLog;
	              return next(chartLog);
	            }
	          });
	        };
	        return recurStadist(_today, _tomorrow, numdays);
	      };
	    })(this));
	  };
	
	  FtpCtr.prototype.getChartStadist = function(req, res) {
	    var parms;
	    parms = req.body;
	    return this.calcCharts(parms.numdays, function(chartLog) {
	      return res.status(200).send(chartLog);
	    });
	  };
	
	  FtpCtr.prototype.deleteFilesLost = function() {
	    return Ftp.find(function(err, ftps) {
	      var ids;
	      ids = [];
	      ids = ftps.map(function(p) {
	        return p._id;
	      });
	      return FtpFiles.remove({
	        ftp: {
	          $nin: ids
	        }
	      }, function(error) {
	        return console.log("eliminados Files que no pertenecen a nadie");
	      });
	    });
	  };
	
	  FtpCtr.prototype.convertToKB = function(size) {
	    var megas, num, toBytes;
	    size = size.trim();
	    if (isNaN(size)) {
	      toBytes = 1024 * 1024;
	      if (size[size.length - 1] === 'G' || size[size.length - 2] === 'G') {
	        toBytes = toBytes * 1024;
	      }
	      if (size[size.length - 1] === 'K' || size[size.length - 2] === 'K') {
	        toBytes = 1024;
	      }
	      megas = size.substring(0, size.length - 1);
	      num = isNaN(parseFloat(megas)) ? 0 : parseFloat(megas);
	      size = num * toBytes;
	    }
	    return size;
	  };
	
	  return FtpCtr;
	
	})();
	
	exports.FtpCtr = FtpCtr;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Provider, async, fs, mongoose,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	
	async = require('async');
	
	fs = require('fs');
	
	mongoose = require('mongoose');
	
	Provider = (function() {
	  function Provider(prover) {
	    this.prover = prover != null ? prover : null;
	    this.insertMultilpleDB = bind(this.insertMultilpleDB, this);
	    this.ignoreDir = bind(this.ignoreDir, this);
	    this.scraperDir = bind(this.scraperDir, this);
	    this.totalFilesFound = 0;
	    this.isReady = false;
	    this.FileModel = mongoose.model('file');
	  }
	
	  Provider.prototype.connectToServer = function(next) {
	    return next();
	  };
	
	  Provider.prototype.closeConnection = function() {
	    return console.log('terminado');
	  };
	
	  Provider.prototype.scraperDir = function(dirScann, next) {
	    return this.connectToServer((function(_this) {
	      return function() {
	        var filesFound, foldersFound, intents, q, timeConsult;
	        console.log('iniciando scanner ', _this.prover.name, dirScann);
	        timeConsult = new Date().getTime();
	        filesFound = 0;
	        foldersFound = [];
	        intents = [];
	        q = async.queue(function(dir, callback) {
	          return _this.readPath(dir, function(filesF, foldersFound) {
	            var post;
	            if (!filesF && !_this.isReady) {
	              return next(false, foldersFound);
	            } else {
	              if (!filesF) {
	                post = intents.indexOf(dir);
	                if (post === -1) {
	                  intents.push(dir);
	                  q.push(dir, function(err) {
	                    return console.log('intento de conexion', dir);
	                  });
	                  return callback();
	                } else {
	                  return callback();
	                }
	              } else {
	                post = intents.indexOf(dir);
	                if (post === -1) {
	                  intents.splice(post, 1);
	                }
	                _this.isReady = true;
	                filesFound += filesF.length;
	                _this.insertMultilpleDB(filesF, function() {});
	                q.push(foldersFound, function(err) {});
	                return callback();
	              }
	            }
	          });
	        }, _this.prover.thread || 3);
	        q.drain = function() {
	          var demoro;
	          _this.closeConnection();
	          next(filesFound);
	          filesFound = 0;
	          demoro = new Date().getTime() - timeConsult;
	          demoro = demoro / 1000;
	          return console.log('escaneado en ', demoro);
	        };
	        return q.unshift(dirScann, function(err) {
	          return console.log('Inciando->', dirScann);
	        });
	      };
	    })(this));
	  };
	
	  Provider.prototype.ignoreDir = function(dir) {
	    var post;
	    post = this.prover.ignore.indexOf(dir);
	    return post === -1;
	  };
	
	  Provider.prototype.concatArray = function(a, b) {
	    var i, len, n;
	    for (i = 0, len = b.length; i < len; i++) {
	      n = b[i];
	      a.push(n);
	    }
	    return a;
	  };
	
	  Provider.prototype.insertMultilpleDB = function(files, next) {
	    return this.FileModel.collection.insert(files, (function(_this) {
	      return function(err) {
	        return next();
	      };
	    })(this));
	  };
	
	  Provider.prototype.extnameFile = function(name) {
	    var extname;
	    extname = name.split('.');
	    return extname[extname.length - 1];
	  };
	
	  return Provider;
	
	})();
	
	exports.Provider = Provider;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var FTPProvider, FactoryProvider, HTTPProvider, LOCALProvider, SMBProvider,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	
	FTPProvider = __webpack_require__(7).FTPProvider;
	
	LOCALProvider = __webpack_require__(8).LOCALProvider;
	
	SMBProvider = __webpack_require__(9).SMBProvider;
	
	HTTPProvider = __webpack_require__(10).HTTPProvider;
	
	FactoryProvider = (function() {
	  function FactoryProvider(prove) {
	    this.prove = prove != null ? prove : null;
	    this.factory = bind(this.factory, this);
	    console.log('loading provider');
	  }
	
	  FactoryProvider.prototype.factory = function() {
	    if (this.prove.type === 'ftp') {
	      return new FTPProvider(this.prove);
	    }
	    if (this.prove.type === 'local') {
	      return new LOCALProvider(this.prove);
	    }
	    if (this.prove.type === 'smb') {
	      return new SMBProvider(this.prove);
	    }
	    if (this.prove.type === 'http') {
	      return new HTTPProvider(this.prove);
	    }
	  };
	
	  return FactoryProvider;
	
	})();
	
	exports.FactoryProvider = FactoryProvider;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var FTPProvider, FtpClient, Provider, path,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	Provider = __webpack_require__(5).Provider;
	
	FtpClient = require('ftp');
	
	path = require('path');
	
	FTPProvider = (function(superClass) {
	  extend(FTPProvider, superClass);
	
	  function FTPProvider() {
	    this.readPath = bind(this.readPath, this);
	    this.connectToServer = bind(this.connectToServer, this);
	    FTPProvider.__super__.constructor.apply(this, arguments);
	    this.clientFtp = new FtpClient();
	  }
	
	  FTPProvider.prototype.connectToServer = function(next) {
	    var config, error;
	    try {
	      config = {
	        host: this.prover.uri,
	        port: this.prover.port ? this.prover.port : '',
	        user: this.prover.user ? this.prover.user : '',
	        password: this.prover.password ? this.prover.password : ''
	      };
	      this.clientFtp.connect(config);
	      return this.clientFtp.on('ready', (function(_this) {
	        return function() {
	          console.log('ftp is redy');
	          return next();
	        };
	      })(this));
	    } catch (error1) {
	      error = error1;
	      console.log('fsdfdsf', error);
	      return 'nea';
	    }
	  };
	
	  FTPProvider.prototype.closeConnection = function() {
	    console.log('cerrada la conexion');
	    return this.clientFtp.end();
	  };
	
	  FTPProvider.prototype.readPath = function(path, next) {
	    var files, folders;
	    files = [];
	    folders = [];
	    path = path.replace('//', '/');
	    console.log(path);
	    return this.clientFtp.list(path, (function(_this) {
	      return function(err, list) {
	        if (err) {
	          console.log(err);
	        } else {
	          list.forEach(function(file) {
	            var error, folder, join, name, newPaht;
	            name = file.name;
	            try {
	              name = decodeURIComponent(escape(file.name));
	            } catch (error1) {
	              error = error1;
	            }
	            if (file.type === 'd') {
	              join = "/";
	              if (path === '/') {
	                join = '';
	              }
	              newPaht = path + join + name;
	              if (_this.ignoreDir(newPaht)) {
	                folder = {
	                  dir: path,
	                  name: name,
	                  provider: _this.prover._id
	                };
	                files.push(folder);
	                return folders.push(newPaht);
	              }
	            } else {
	              file = {
	                provider: _this.prover._id,
	                name: file.name,
	                extname: _this.extnameFile(file.name),
	                dir: path,
	                size: file.size,
	                atime: new Date(file.date).getTime(),
	                file: true
	              };
	              return files.push(file);
	            }
	          });
	        }
	        return next(files, folders);
	      };
	    })(this));
	  };
	
	  return FTPProvider;
	
	})(Provider);
	
	exports.FTPProvider = FTPProvider;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var LOCALProvider, Provider, async, fs,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	Provider = __webpack_require__(5).Provider;
	
	fs = require('fs');
	
	async = require('async');
	
	LOCALProvider = (function(superClass) {
	  extend(LOCALProvider, superClass);
	
	  function LOCALProvider() {
	    this.statFiles = bind(this.statFiles, this);
	    this.readPath = bind(this.readPath, this);
	    LOCALProvider.__super__.constructor.apply(this, arguments);
	  }
	
	  LOCALProvider.prototype.readPath = function(path, next) {
	    return fs.readdir(path, (function(_this) {
	      return function(err, files) {
	        if (err) {
	          console.log('hubo algun error al leer el directorio', path);
	          return next([], []);
	        } else {
	          return _this.statFiles(path, files, function(filesFound, foldersFound) {
	            return next(filesFound, foldersFound);
	          });
	        }
	      };
	    })(this));
	  };
	
	  LOCALProvider.prototype.statFiles = function(path, files, next) {
	    var asd, filesR, folders, prover;
	    console.log(path);
	    folders = [];
	    filesR = [];
	    prover = this.prover;
	    asd = async.queue((function(_this) {
	      return function(file, callback) {
	        var newPath;
	        newPath = path + '/' + file;
	        return fs.stat(newPath, function(err, stat) {
	          var folder, newFile;
	          if (err) {
	            console.log('errorr');
	            return callback();
	          } else {
	            if (stat.isFile()) {
	              newFile = {
	                prov: prover._id,
	                name: file,
	                dir: path,
	                atime: stat.atime,
	                file: true
	              };
	              filesR.push(newFile);
	              return callback();
	            } else if (stat.isDirectory()) {
	              if (_this.ignoreDir(path + '/' + file)) {
	                folder = {
	                  dir: path,
	                  name: file,
	                  prov: prover._id,
	                  file: false
	                };
	                filesR.push(folder);
	                folders.push(path + '/' + file);
	              }
	              return callback();
	            }
	          }
	        });
	      };
	    })(this), 8);
	    asd.drain = (function(_this) {
	      return function() {
	        return next(filesR, folders);
	      };
	    })(this);
	    return asd.unshift(files, function(err) {});
	  };
	
	  return LOCALProvider;
	
	})(Provider);
	
	exports.LOCALProvider = LOCALProvider;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Provider, SMB2, SMBProvider, path,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	Provider = __webpack_require__(5).Provider;
	
	SMB2 = require('@marsaud/smb2');
	
	path = require('path');
	
	SMBProvider = (function(superClass) {
	  extend(SMBProvider, superClass);
	
	  function SMBProvider() {
	    this.readPath = bind(this.readPath, this);
	    this.connectToServer = bind(this.connectToServer, this);
	    SMBProvider.__super__.constructor.apply(this, arguments);
	    this.smb2Client = {};
	  }
	
	  SMBProvider.prototype.connectToServer = function(next) {
	    var config, error;
	    try {
	      config = {
	        share: '\\\\10.8.75.202\\coffeeExplorer',
	        domain: 'WORKGROUP',
	        username: 'copi',
	        password: '123456',
	        debug: true,
	        autoCloseTimeout: 0
	      };
	      this.smb2Client = new SMB2(config);
	      return next();
	    } catch (error1) {
	      error = error1;
	      console.log('ERROR', error);
	      return next();
	    }
	  };
	
	  SMBProvider.prototype.readPath = function(path, next) {
	    var files, folders;
	    files = [];
	    folders = [];
	    console.log(path);
	    this.smb2Client.readdir('\\node_modules', (function(_this) {
	      return function(err, fils) {
	        console.log(path);
	        if (err) {
	          console.log('error----', err);
	        }
	        return console.log('filesss', fils);
	      };
	    })(this));
	    return next(files, folders);
	  };
	
	  return SMBProvider;
	
	})(Provider);
	
	exports.SMBProvider = SMBProvider;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var HTTPProvider, Provider, cheerio, config, request,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;
	
	Provider = __webpack_require__(5).Provider;
	
	config = __webpack_require__(1).config;
	
	request = require('request');
	
	cheerio = require('cheerio');
	
	HTTPProvider = (function(superClass) {
	  extend(HTTPProvider, superClass);
	
	  function HTTPProvider() {
	    this.parseBodyProvider = bind(this.parseBodyProvider, this);
	    this.dirIsValid = bind(this.dirIsValid, this);
	    this.readPath = bind(this.readPath, this);
	    HTTPProvider.__super__.constructor.apply(this, arguments);
	  }
	
	  HTTPProvider.prototype.makeRequest = function(url, callback) {
	    var params;
	    params = {
	      url: url,
	      pool: {
	        maxSockets: 2
	      },
	      headers: {
	        'Accept': 'text/plain'
	      },
	      proxy: config.useProxy ? config.proxy : null
	    };
	    return request(params, callback);
	  };
	
	  HTTPProvider.prototype.endConnection = function(req) {
	    if (req) {
	      req.abort();
	      return req.destroy();
	    }
	  };
	
	  HTTPProvider.prototype.readPath = function(path, next) {
	    var reqObj, url;
	    console.log(path);
	    path = path.replace('//', '/');
	    url = this.prover.uri + path + '/';
	    return reqObj = this.makeRequest(url, (function(_this) {
	      return function(error, response, body) {
	        var filesFolders;
	        if (!error && response.statusCode === 200) {
	          filesFolders = _this.parseBodyProvider(path, _this.prover, body);
	          _this.endConnection(reqObj);
	          return next(filesFolders.files, filesFolders.folders);
	        } else {
	          _this.endConnection(reqObj);
	          if (_this.isReady) {
	            return next(false, []);
	          } else {
	            return next(false, error);
	          }
	        }
	      };
	    })(this));
	  };
	
	  HTTPProvider.prototype.dirIsValid = function(dir) {
	    var index;
	    if (dir) {
	      index = ['../', '..', '?C=N;O=A', '?C=M;O=A', '?C=S;O=A', '?=D;O=A', '?C=N;O=D', '?C=D;O=A', '#'].indexOf(dir);
	      if (index === -1) {
	        if (dir.substring(dir.length - 3, dir.length - 1) === '//') {
	          console.log('infinito');
	          return false;
	        }
	        return true;
	      } else {
	        return false;
	      }
	    }
	  };
	
	  HTTPProvider.prototype.validURL = function(link) {
	    var regex;
	    regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
	    return regex.test(str);
	  };
	
	  HTTPProvider.prototype.parseBodyProvider = function(path, prov, body) {
	    var dom, files, folders, prover, valid;
	    console.log(path);
	    files = [];
	    folders = [];
	    prover = this.prover;
	    valid = this.dirIsValid;
	    dom = cheerio.load(body);
	    dom(prov.queryName).each(function() {
	      var ele, error, fecha, file, folder, foundSpace, href, name, numnext, query, resultText, size, text;
	      href = dom(this).attr('href');
	      try {
	        href = href.replace(prov.uri, "");
	      } catch (error1) {
	        error = error1;
	      }
	      if (valid(href)) {
	        if (dom(this).text() === "Parent Directory") {
	          return console.log('nop');
	        } else {
	          if (href[href.length - 1] === '/') {
	            name = href.substring(0, href.length - 1);
	            if (this.ignoreDir(path + '/' + name)) {
	              folder = {
	                dir: path,
	                name: name,
	                prov: prover._id,
	                file: false
	              };
	              files.push(folder);
	              return folders.push(folder.dir + '/' + folder.name);
	            }
	          } else {
	            size = "";
	            fecha = "";
	            if (!prov.queryDate || prov.queryDate === '') {
	              try {
	                text = dom(this)[0].nextSibling.nodeValue.trim();
	                resultText = "";
	                foundSpace = false;
	                text = text.split(' ');
	                size = text[text.length - 1];
	                fecha = Date.parse(text[0] + ' ' + text[1]);
	              } catch (error1) {
	                error = error1;
	                console.log(error);
	              }
	            } else {
	              if (prov.queryDate) {
	                query = prov.queryDate.split(':');
	                ele = query[0];
	                numnext = query[1];
	                if (numnext === 'first') {
	                  fecha = dom(this).parent().next(ele).text();
	                } else {
	                  if (numnext === 'second') {
	                    fecha = dom(this).parent().next(ele).next(ele).text();
	                  }
	                }
	                fecha = Date.parse(fecha);
	              }
	              if (prov.querySize) {
	                query = prov.querySize.split(':');
	                ele = query[0];
	                numnext = query[1];
	                if (numnext === 'first') {
	                  size = dom(this).parent().next(ele).text();
	                } else {
	                  if (numnext === 'second') {
	                    size = dom(this).parent().next(ele).next(ele).text();
	                  }
	                }
	                size = size.trim();
	              }
	            }
	            file = {
	              prov: prover._id,
	              name: href,
	              dir: path,
	              atime: fecha,
	              file: true,
	              size: size
	            };
	            return files.push(file);
	          }
	        }
	      }
	    });
	    return {
	      files: files,
	      folders: folders
	    };
	  };
	
	  return HTTPProvider;
	
	})(Provider);
	
	exports.HTTPProvider = HTTPProvider;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var ElasticClient, config, elasticsearch,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	
	elasticsearch = require('elasticsearch');
	
	config = __webpack_require__(1).config;
	
	ElasticClient = (function() {
	  function ElasticClient(config1) {
	    this.config = config1 != null ? config1 : null;
	    this.deleteAllFilesProv = bind(this.deleteAllFilesProv, this);
	    this.findFilesProv = bind(this.findFilesProv, this);
	    this.deleteFilesIndex = bind(this.deleteFilesIndex, this);
	    this.foundInitIndex = bind(this.foundInitIndex, this);
	    this.elasticCount = bind(this.elasticCount, this);
	    this.initMapping = bind(this.initMapping, this);
	    this.deleteIndex = bind(this.deleteIndex, this);
	    this.deleteAllIndexs = bind(this.deleteAllIndexs, this);
	    this.indexExists = bind(this.indexExists, this);
	    this.initIndex = bind(this.initIndex, this);
	    this.findFiles = bind(this.findFiles, this);
	    this.synchronize = bind(this.synchronize, this);
	    this.freeEsClient = bind(this.freeEsClient, this);
	    this.bulkDelete = bind(this.bulkDelete, this);
	    this.bulkAdd = bind(this.bulkAdd, this);
	    this.bulkFlush = bind(this.bulkFlush, this);
	    this.getClient = bind(this.getClient, this);
	    this.ping = bind(this.ping, this);
	    this.clientelastic = new elasticsearch.Client(this.config || {
	      host: '127.0.0.1:9200'
	    });
	    this.ping();
	    this.timeTimeout = 1;
	    this.lastCount = 0;
	    this.settings = {
	      "index": {
	        "analysis": {
	          "filter": {
	            "myNGramFilter": {
	              "type": "edgeNGram",
	              "min_gram": 1,
	              "max_gram": 40
	            }
	          },
	          "analyzer": {
	            "myNGramAnalyzer": {
	              "type": "custom",
	              "tokenizer": "standard",
	              "filter": ["lowercase", "myNGramFilter"]
	            }
	          }
	        },
	        "mappings": {
	          "file": {
	            "properties": {
	              "name": {
	                "type": "string",
	                "index_analyzer": "myNGramAnalyzer",
	                "search_analyzer": "standard"
	              }
	            }
	          }
	        }
	      }
	    };
	    this.body = {
	      properties: {
	        dir: {
	          "type": "string",
	          "index": "not_analyzed"
	        }
	      }
	    };
	    this.indexName = config.esClient.indexName;
	    this.type = config.esClient.type;
	  }
	
	  ElasticClient.prototype.ping = function() {
	    return this.clientelastic.ping({
	      requestTimeout: 2e308,
	      hello: "elasticsearch!"
	    }, (function(_this) {
	      return function(error) {
	        if (error) {
	          return console.trace('elasticsearch cluster is down!');
	        } else {
	          return console.log('elasticsearch is well');
	        }
	      };
	    })(this));
	  };
	
	  ElasticClient.prototype.getClient = function() {
	    return this.clientelastic;
	  };
	
	  ElasticClient.prototype.bulkFlush = function(files, next) {
	    return this.clientelastic.bulk({
	      body: files
	    }, next);
	  };
	
	  ElasticClient.prototype.bulkAdd = function(br, filesToIndex, indexElasticName, type) {
	    var f, i, len;
	    for (i = 0, len = filesToIndex.length; i < len; i++) {
	      f = filesToIndex[i];
	      br.push({
	        index: {
	          _index: indexElasticName,
	          _type: type
	        }
	      });
	      br.push(f);
	    }
	    return br;
	  };
	
	  ElasticClient.prototype.bulkDelete = function(br, filesToDelete, indexElasticName, type) {
	    var f, i, len;
	    for (i = 0, len = filesToDelete.length; i < len; i++) {
	      f = filesToDelete[i];
	      br.push({
	        "delete": {
	          _index: indexElasticName,
	          _type: type,
	          _id: f._id
	        }
	      });
	    }
	    return br;
	  };
	
	  ElasticClient.prototype.freeEsClient = function(next) {
	    var isEsClientFree, timeTimeout;
	    timeTimeout = 1;
	    isEsClientFree = (function(_this) {
	      return function() {
	        clearTimeout(timeTimeout);
	        return _this.elasticCount(function(num) {
	          if (num === _this.lastCount) {
	            return next();
	          } else {
	            _this.lastCount = num;
	            console.log(num, 'espera');
	            return timeTimeout = setTimeout(function() {
	              return isEsClientFree();
	            }, 2000);
	          }
	        });
	      };
	    })(this);
	    return isEsClientFree();
	  };
	
	  ElasticClient.prototype.synchronize = function(query, MongoDbModel, perPage, indexElasticName, type, next) {
	    var allTotalFilesToInsert, page, skip;
	    allTotalFilesToInsert = 0;
	    skip = 0;
	    page = 1;
	    return MongoDbModel.count(query, (function(_this) {
	      return function(err, count) {
	        var recurInsertBulk;
	        allTotalFilesToInsert = count;
	        console.log("sincronizando", allTotalFilesToInsert, 'documentos');
	        recurInsertBulk = function() {
	          return _this.freeEsClient(function() {
	            return _this.findFiles(query, MongoDbModel, skip, perPage, function(err, files) {
	              var create_bulk;
	              if (files.length === 0) {
	                console.log('terminada synchronize');
	                return next();
	              } else {
	                create_bulk = _this.bulkAdd([], files, indexElasticName, type);
	                return _this.bulkFlush(create_bulk, function(err, resp) {
	                  create_bulk = [];
	                  skip = skip + perPage;
	                  console.log("iteracion", page, "/", parseInt(allTotalFilesToInsert / perPage) + 1);
	                  page += 1;
	                  return recurInsertBulk();
	                });
	              }
	            });
	          });
	        };
	        return recurInsertBulk();
	      };
	    })(this));
	  };
	
	  ElasticClient.prototype.findFiles = function(query, MongoDbModel, skip, perPage, next) {
	    return MongoDbModel.find(query).select('-_id').limit(perPage).skip(skip).exec(next);
	  };
	
	  ElasticClient.prototype.initIndex = function(indexName, settings) {
	    return this.clientelastic.indices.create({
	      index: indexName,
	      body: {
	        settings: settings
	      }
	    });
	  };
	
	  ElasticClient.prototype.indexExists = function(indexElasticName) {
	    return this.clientelastic.indices.exists({
	      index: indexElasticName
	    });
	  };
	
	  ElasticClient.prototype.deleteAllIndexs = function() {
	    return this.clientelastic.indices["delete"]({
	      index: "_all"
	    });
	  };
	
	  ElasticClient.prototype.deleteIndex = function(indexElasticName) {
	    return this.clientelastic.indices["delete"]({
	      index: indexElasticName
	    });
	  };
	
	  ElasticClient.prototype.initMapping = function(indexElasticName, body, type) {
	    return this.clientelastic.indices.putMapping({
	      index: indexElasticName,
	      type: type,
	      body: body
	    });
	  };
	
	  ElasticClient.prototype.elasticCount = function(next) {
	    return this.clientelastic.count((function(_this) {
	      return function(error, response, status) {
	        return next(response.count);
	      };
	    })(this));
	  };
	
	  ElasticClient.prototype.foundInitIndex = function(indexName, settings, body, type, next) {
	    return this.indexExists(indexName).then((function(_this) {
	      return function(exists) {
	        if (exists) {
	          console.log('Everything looks good');
	          return next();
	        } else {
	          return _this.initIndex(indexName, settings).then(function() {
	            return _this.initMapping(indexName, body, type).then(function() {
	              return next();
	            });
	          });
	        }
	      };
	    })(this));
	  };
	
	  ElasticClient.prototype.deleteFilesIndex = function(parm, indexElasticName, type, next) {
	    return this.foundInitIndex(indexElasticName, this.settings, this.body, type, (function(_this) {
	      return function() {
	        var timeTimeout;
	        return timeTimeout = setTimeout(function() {
	          return _this.deleteAllFilesProv(indexElasticName, parm, function(numFound) {
	            return next();
	          });
	        }, 200);
	      };
	    })(this));
	  };
	
	  ElasticClient.prototype.findFilesProv = function(parms, indexName, next) {
	    return this.clientelastic.search({
	      index: indexName,
	      type: this.type,
	      from: 0,
	      size: 1000,
	      body: {
	        query: {
	          match: parms
	        }
	      }
	    }).then((function(_this) {
	      return function(resp) {
	        return next(null, resp.hits.hits);
	      };
	    })(this), (function(_this) {
	      return function(err) {
	        return next(err);
	      };
	    })(this));
	  };
	
	  ElasticClient.prototype.deleteAllFilesProv = function(indexName, parms, next) {
	    var allRecords, count, getMoreUntilDone;
	    allRecords = [];
	    count = 0;
	    return this.clientelastic.search({
	      index: indexName,
	      type: 'file',
	      scroll: '10s',
	      body: {
	        query: {
	          term: parms
	        }
	      }
	    }, getMoreUntilDone = (function(_this) {
	      return function(error, response) {
	        var create_bulk;
	        count += response.hits.hits.length;
	        response.hits.hits.map(function(hit) {
	          return allRecords.push(hit);
	        });
	        if (count % 15000 === 0) {
	          console.log('found->', count);
	        }
	        if (response.hits.total === count) {
	          create_bulk = _this.bulkDelete([], allRecords, indexName, 'file');
	          return _this.freeEsClient(function() {
	            return _this.bulkFlush(create_bulk, function(err, resp) {
	              create_bulk = [];
	              allRecords = [];
	              return _this.freeEsClient(function() {
	                return next(count);
	              });
	            });
	          });
	        } else {
	          return _this.clientelastic.scroll({
	            scrollId: response._scroll_id,
	            scroll: '10s'
	          }, getMoreUntilDone);
	        }
	      };
	    })(this));
	  };
	
	  return ElasticClient;
	
	})();
	
	exports.ElasticClient = ElasticClient;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var FileSchema, ProviderSchema, Schema, mongoosastic, mongoose;
	
	mongoose = require('mongoose');
	
	mongoosastic = require('mongoosastic');
	
	Schema = mongoose.Schema;
	
	ProviderSchema = new Schema({
	  name: {
	    type: String,
	    required: 'Name is required',
	    trim: true
	  },
	  user: String,
	  pass: String,
	  uri: String,
	  rootdir: String,
	  port: String,
	  type: String,
	  queryName: String,
	  queryDate: String,
	  querySize: String,
	  ignore: Array,
	  thread: Number,
	  update: {
	    type: Date,
	    "default": Date.now
	  },
	  create: {
	    type: Date,
	    "default": Date.now
	  }
	});
	
	FileSchema = new Schema({
	  name: {
	    type: String,
	    sparse: true
	  },
	  extname: String,
	  directory: String,
	  size: String,
	  time: String,
	  prov: String
	});
	
	exports.Ftp = mongoose.model('provider', ProviderSchema);
	
	exports.File = mongoose.model('file', FileSchema);


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var LogSchema, Schema, mongoose;
	
	mongoose = require('mongoose');
	
	Schema = mongoose.Schema;
	
	LogSchema = new Schema({
	  browser: String,
	  browser_version: String,
	  device: String,
	  os: String,
	  ip: String,
	  type: String,
	  search: String,
	  client: String,
	  create: {
	    type: Date,
	    "default": Date.now
	  }
	});
	
	exports.Logs = mongoose.model('log', LogSchema);


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = (function(_this) {
	  return function(app, express) {
	    return app.route('/react').get(function(req, res) {
	      return res.render('vue');
	    });
	  };
	})(this);


/***/ }
/******/ ]);
//# sourceMappingURL=server.js.map