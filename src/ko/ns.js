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

import VM from './viewmodel'
import cfg from '../utils/cfg'

/**
ko/ns模块维护了名称空间。他允许任意元素开启一个新的名称空间，对应的viewmodel增加一个新的对象。同时，本模块提供了名称空间内id唯一的查询方式，当前名称空间下的唯一id(data-id)获取。
@module ko/ns
*/

/**
本函数在给定名称空间下寻找`selector`限定的元素。如果nested允许，子名称空间内的元素也被选择，否则只有当前名称空间的元素被返回。
@exports ko/ns
@method getNs
@param {String|Element} nsOrEle 如果是String,则给出名称空间，否则是一个元素。
@return {Element} 返回此NameSpace根节点
*/
function getNs (nsOrEle) {
}

/**
在指定元素的名称空间下展开模板。
@exports ko/ns
@method template
@param {String} params 需要展开的字符串模板。这个字符串模板的格式遵守es6 template literial规范。额外变量是refEle所指定的viewModel的变量，如果未指定，则为全局空间。
@param {Element} [refEle=undefined] 用于确定名称空间，进而确定viewModel的元素。
@return {String} 展开之后的模板元素。
*/
function template (params, refEle) {
  let tstr
  tstr = (Array.isArray(params)) ? params.join('') : String(params)
  return (tstr.indexOf('${') >= 0) ? window.Template(tstr, wwjs.vm.get(refEle, 'json')) : tstr
}

let nssuffix = 0

// this is element.
function procNS () {
  let ele = this
  let nsName = ele.getAttribute('data-ns')
  // console.log('nsName=', nsName)
  if (nsName === 'foreach' || typeof nsName !== 'string') { // 已经使用了foreach作为名称空间构建，不再处理。
    return
  }
  if (!nsName || nsName === 'unique') {
    nsName = `${cfg.nsprefx || 'wwns'}${nssuffix}`
    nssuffix++
    ele.setAttribute('data-ns', nsName)
  }
  // console.log('after autosuffix,nsName=', nsName)
  let json = { }
  json[nsName] = {}
  VM.set(json, VM.get(ele.parentNode), false)
  let bindStr = ele.getAttribute('data-bind') || ''
  if (bindStr) {
    bindStr += ';'
  }
  bindStr += `with:${nsName}`
  ele.setAttribute('data-bind', bindStr)
}

/** ns的处理必须在bindvar以及script之前。处理过程:
- 首先检查是否有data-ns名称空间。如果有，调用procNS执行如下处理:
  - 如果有，获取其名称(如果是unique，则自动换算为全局唯一名称`wwjs${suffix}`)
  - 获取元素当前的ko context,进一步获取到$data.
  - 在$data下初始化方式更新namespace对象。
  - 在$item上增加with的data-bind.
@exports ko/ns
@access private
@method check
@param {$Element} $item 要处理的Item.
@return {number} $item中符合条件的元素数量。
*/

function check ($item) {
  // console.log('data-ns')
  let count = 0
  if ($item.is('[data-ns]')) {
    procNS.call($item[0])
    count++
  }
  let nsItems = $item.find('[data-ns]')
  if (nsItems.length > 0) {
    nsItems.each(procNS)
    count++
  }
  return count
}

export default {
  pub: {
    getNs: getNs,
    template: template
  },
  check: check
}
