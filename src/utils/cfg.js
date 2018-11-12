/// ///////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
/// ///////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-12T11:50:50.884Z by masol (masol.li@gmail.com)

'use strict'

/**
本模块检查全局的window.wwcfg配置。如果未配置，则给出默认设置
@module utils/cfg
*/

let cfg = {}

cfg.libbase = '//libs.wware.org'
cfg.debug = false
if ((typeof window.wwcfg === 'object')) {
  if (window.$.isString(window.wwcfg.libbase)) {
    cfg.libbase = (window.wwcfg.libbase[window.wwcfg.libbase.length - 1] === '/')
      ? window.wwcfg.libbase.substr(0, window.wwcfg.libbase.length - 1) : window.wwcfg.libbase
  }
  if (window.wwcfg.debug) cfg = true
}

export default cfg
