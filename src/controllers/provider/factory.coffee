{FTPProvider} = require './ftp.coffee'
{LOCALProvider} = require './local.coffee'
{SMBProvider} = require './smb.coffee'
{HTTPProvider} = require './http.coffee'
{SSHProvider} = require './ssh.coffee'

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
    if @prove.type is 'ssh'
      return new SSHProvider(@prove)

exports.FactoryProvider = FactoryProvider