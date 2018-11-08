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
// Created At : 2018-11-08T16:53:47.078Z by masol (masol.li@gmail.com)

'use strict'

/**
@module ko
@desc ko检查模块
*/

import ko from 'knockout'
import mapping from './mapping'

ko.mapping = mapping
window.ko = ko
console.log(ko)
console.log(mapping)

/**
@exports ko
@method check
@desc 在指定目录下查找指定正则(可选)的文件.
@param pattern 需要搜索的文件表达式.
@return promise,解析为文件集合的数组.
@see https://github.com/isaacs/node-glob#readme
*/
function check () {
}

module.exports = check
