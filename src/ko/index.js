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
ko模块的初始化代码，负责建立事件监听，以监听新节点的插入，并处理新加入的节点。
@exports ko
@method setup
@return undefined
*/
function setup () {
}

export default setup
