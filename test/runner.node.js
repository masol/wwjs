// / //////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// / //////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-01T13:45:54.410Z by masol (masol.li@gmail.com)

'use strict'

const httpServer = require('http-server')
const opn = require('opn')
let isPhantom = false

let i
for (i in process.argv) {
  if (String(process.argv[i]).toLowerCase() === '-phantom') {
    isPhantom = true
  }
}

var server = httpServer.createServer({
  robots: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true'
  }
})
server.listen(9999)
server.server.on('listening', function () {
  // Opens the url in the default browser
  if (!isPhantom) {
    opn('http://localhost:9999/test/runner.html').then(() => {
      console.log('页面已打开，测试完毕之后，请按Ctrl+C关闭测试程序。')
    }).catch(function (err) {
      console.error(`执行测试时发生错误:${require('util').inspect(err)}`)
      process.exit(1)
    })
  } else {
    const shelljs = require('shelljs')
    var child = shelljs.exec('phantomjs test/runner.phantom.js')//, { async: true })
    console.log(child.stderr)
    console.log(child.stdout)
    process.exit(child.code)
  }
})

server.server.on('error', function (err) {
  console.error(`无法启动mini server，请检查是否已有测试运行中(包括webpack的live update server)${require('util').inspect(err)}`)
  process.exit(2)
})
