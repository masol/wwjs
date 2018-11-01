
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

    editors,

    // Will be replaced on build
    version: '<# VERSION #>',

    cfg: require('./test.js'),

    defaultConfig
  }
})()
