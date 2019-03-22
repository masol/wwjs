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
// Created At : 2019-03-22T17:33:35.744Z by lizhutang (lizhutang@spolo.org)

'use strict'

/**
对(ky)[https://github.com/sindresorhus/ky]的一个封装，由于ky基于fetch，wwjs会在不支持的浏览器上异步补丁fetch。而ky引入时直接初始化fetch，因此这里做一个简单封装。
@module utils/ky
*/

let kyInstance
function get () {
  if (!kyInstance) {
    kyInstance = require('ky').default
  }
  return kyInstance
}

export default get
