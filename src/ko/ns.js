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
// Created At : 2018-11-14T13:11:17.108Z by masol (masol.li@gmail.com)

'use strict'

import EE from '../utils/evt'
import VM from './viewmodel'
import cfg from '../utils/cfg'

/**
ko/ns模块维护了名称空间。他允许任意元素开启一个新的名称空间，对应的viewmodel增加一个新的对象。同时，本模块提供了名称空间内id唯一的查询方式，当前名称空间下的唯一id(data-id)获取。
@module ko/ns
*/

/**
本函数在给定名称空间下寻找`selector`限定的元素。如果nested允许，子名称空间内的元素也被选择，否则只有当前名称空间的元素被返回。
@exports ko/ns
@method find
@param {String} selector jQuery Selector Format.
@param {String|Element} [ns=""] 如果是String,则给出名称空间，否则是一个元素，按照其所处的名称空间中查找。如果未给出本参数，默认为全局名称空间("")
@param {Boolean} [nested=false] 是否递归查找子名称空间中的元素，默认是false。
@return {jQueryCollection<Elements>} 返回符合条件的元素数组。
*/
function find (selector, ns, nested) {
}

function getById (id, ns, nested) {
}

let nssuffix = 0

// this is element.
function procNS () {
  let ele = this
  let nsName = ele.getAttribute('data-ns')
  if (nsName === 'foreach') { // 已经使用了foreach作为名称空间构建，不再处理。
    return
  }
  if (!nsName || nsName === 'unique') {
    nsName = `${cfg.nsprefx || 'wwns'}${nssuffix}`
    nssuffix++
    ele.setAttribute('data-ns', nsName)
  }
  let json = { }
  json[nsName] = {}
  VM.set(json, VM.get(ele), false)
  let bindStr = ele.getAttribute('data-bind') || ''
  if (!bindStr) {
    bindStr += ';'
  }
  bindStr += `with:${nsName}`
  ele.setAttribute('data-bind', bindStr)
}

/* 处理过程:
- 首先检查是否有data-ns名称空间。如果有，调用procNS执行如下处理:
  - 如果有，获取其名称(如果是unique，则自动换算为全局唯一名称`wwjs${suffix}`)
  - 获取元素当前的ko context,进一步获取到$data.
  - 在$data下初始化方式更新namespace对象。
  - 在$item上增加with的data-bind.
*/
EE.on('koprepare', ($item) => {
  let nsItems = $item.find('[data-ns]')
  if (nsItems.length > 0) {
    nsItems.each(procNS)
  }
  if ($item.is('[data-ns]')) {
    procNS.call($item[0])
  }
})

export default {
  find: find,
  getById: getById
}
