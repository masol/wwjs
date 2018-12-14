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
// Created At : 2018-12-14T06:51:23.775Z by masol (masol.li@gmail.com)

'use strict'

/**
对字符串处理的一些扩展。这里的扩展都与业务逻辑相关。
@module utils/str
*/

/**
给出类似npm包格式的字符串，拼接出完整的基于lib的url。拼接后的格式为:
`@/${prefix}/${name}/${version}/${fname}`
@exports utils/str
@method lib
@param {String} name  类似npm包格式的字符串。如果未指定版本号，默认为`latest`
@param {String} [prefix='@wwclass'] 包前缀，用于支持多个包类型。
@param {String} [fname='index.min.js'] 文件名。
@return {String} 拼接后的完整URL，带有`@`前缀。
**/
function lib (name, prefix, fname) {
  const nameParts = name.split('@')
  const version = nameParts[1] || false
  name = nameParts[0]
  // console.log('wwclsMap[name]=', wwclsMap[name])
  return `@/${prefix || '@wwclass'}/${name}/${version || 'latest'}/${fname || 'index.min.js'}`
}

export default {
  lib: lib
}
