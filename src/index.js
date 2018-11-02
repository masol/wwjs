
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

import loadjs from 'loadjs'

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
loadjs(['/libs/promise-polyfill/polyfill.min.js'], {
  success: function (polifill) {
    console.log('after load : window.Promise=', window.Promise)
    console.log('success loaed:', arguments)
  },
  error: function () {
    console.log('error:', arguments)
  }
})

window.$ = window.jQuery = $

console.log($)

if (process.env.NODE_ENV === 'development') {
  console.warn('This warning will dissapear on production build!')
}

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
    loader: loadjs,
    utils,
    $,

    editors,

    // Will be replaced on build
    version: '<# VERSION #>',

    cfg: require('./test.js'),

    defaultConfig
  }
})()
