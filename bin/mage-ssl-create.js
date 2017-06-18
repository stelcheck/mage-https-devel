#!/usr/bin/env node

const fs = require('fs')
const cp = require('child_process')
const path = require('path')

const async = require('async')
const mkdirp = require('mkdirp')
const create = require('create-cert')

const CERTS_FOLDER = path.join(process.cwd(), 'certs')
const INSTALL_CMDS = {
  darwin: {
    exec: 'security',
    args: 'add-trusted-cert -d -r trustRoot certs/localhost.cer'.split(' ')
  },
  win32: {
    exec: 'certutil',
    args: 'add-trusted-cert -addstore -user Root certs\\localhost.cer'.split(' ')
  },
  linux: {
    // not supported
  }
}

function install(cert, callback) {
  const certPath = path.join(CERTS_FOLDER, cert)
  const {
    platform
   } = process
  const installCmd = INSTALL_CMDS[platform]

  if (!installCmd) {
    return callback(new Error('Platform not supported: ' + platform))
  }

  const cmd = cp.spawn(installCmd.exec, installCmd.args, { shell: true })
  cmd.stdout.pipe(process.stdout)
  cmd.stderr.pipe(process.stderr)
  cmd.on('close', (code) => callback(code === 0 ? null : new Error('install failed')))
}

function assert(error) {
  if (error) {
    throw error
  }
}

function write(filename, data) {
  return function (callback) {
    const filepath = path.join(CERTS_FOLDER, filename)
    fs.writeFile(filepath, data, callback)
  }
}

create({
  days: 365 * 100,
  commonName: 'localhost'
}).then(({ key, cert, caCert }) => {
  mkdirp(CERTS_FOLDER, function (error) {
    assert(error)

    async.parallel([
      write('localhost.key', key),
      write('localhost.cer', cert),
      write('ca.cert', caCert)
    ], function (error) {
      assert(error)
      install('localhost.cer', (error) => assert(error))
    })
  })
})
