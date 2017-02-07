{FTPProvider} = require './ftp.coffee'
{LOCALProvider} = require './local.coffee'
{SMBProvider} = require './smb.coffee'
{HTTPProvider} = require './http.coffee'

class FactoryProvider
  constructor: (@prove = null) ->
    console.log 'loading provider'

  factory: () =>
    if @prove.type is 'ftp'
      return new FTPProvider(@prove)
    if @prove.type is 'local'
      return new LOCALProvider(@prove)
    if @prove.type is 'smb'
      return new SMBProvider(@prove)
    if @prove.type is 'http'
      return new HTTPProvider(@prove)

exports.FactoryProvider = FactoryProvider