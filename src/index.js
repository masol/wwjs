
// / ///////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// / ///////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-01T13:02:35.568Z by masol (masol.li@gmail.com)

'use strict'

import $ from 'jquery'
// import { isElement, isFunction } from 'underscore'
import utils from 'utils'

import loader from 'johnnydepp'

console.log(utils)

// const SystemJS = require('systemjs')

// let requirejs = require('requirejs')

// console.log(requirejs)

// if (typeof Promise === 'undefined') {
// //  console.log(core)
// }
// console.log(SystemJS)

console.log('before load : window.Promise=', window.Promise)
delete window.Promise

loader.define({
  'promise-polyfill': ['/libs/promise-polyfill/polyfill.min.js']
})

loader.require(['promise-polyfill'], function (polifill) {
  console.log('after load : window.Promise=', window.Promise)
  console.log('success loaed:', arguments)
},
function (file, err) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`无法加载文件${file},是不是忘记执行"npm run-script fetch:lib"了？`)
  }
  console.error('error:', arguments)
})

window.$ = window.jQuery = $

console.log($)

$(document).ready(function () {
  console.log('ready!!!')
})

module.exports = (() => {
  const editors = []
  const defaultConfig = {
    // If true renders editor on init
    autorender: 1,

    // Array of plugins to init
    plugins: [],

    // Custom options for plugins
    pluginsOpts: {}
  }

  return {
    loader: loader,
    utils,
    $,

    editors,

    // Will be replaced on build
    version: '<# VERSION #>',

    cfg: require('./test.js'),

    defaultConfig
  }
})()
