// / //////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// / //////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-18T08:42:52.706Z by masol (masol.li@gmail.com)

'use strict'

import wwclass from './wwclass'
import cfg from '../utils/cfg'

const hyper = require('hyperhtml/umd')

// console.log(hyper)

/**
wwjs的元素扩展模块，内建推荐方法是扩展[wwclass](wwclass.html)——wwlcass没有像[webcomponents](https://www.webcomponents.org/)那样利用[custom-element](https://caniuse.com/#search=Custom%20Elements)机制。而是使用mutation监听需要的属性变更，来模拟一个元素，同时兼顾了对KO的事件更新。内部的模板机制，推荐使用内置并暴露在`wwjs.hyper`名称空间下的[hyperHtml库](https://viperhtml.js.org/hyperhtml/documentation/)。
@module elems
*/

const WWINSTSTR = '_wwinst'
function construCls (ele, cls) {
  Promise.resolve(wwclass.get(cls)).then((Cls) => {
    $(ele).data(WWINSTSTR, new Cls(ele))
    // console.log('ele =', ele, 'cls = ', cls)
  })
}

function finalizeCls (ele, cls) {
  const clsFinalize = (inst, name) => {
    if (typeof (inst[name]) === 'function') {
      return inst[name]()
    }
  }
  const inst = $(ele).data(WWINSTSTR)
  if (typeof (inst) === 'object') {
    Promise.resolve(clsFinalize(inst, 'finalize')).then(() => {
      clsFinalize(inst, '_finalize')
      $(ele).removeData(WWINSTSTR)
    }).catch((e) => {
      clsFinalize(inst, '_finalize')
      $(ele).removeData(WWINSTSTR)
      if (cfg.debug) {
        console.error(`元素析构时发生错误:${e}`)
      }
      EE.emit('error', 'wwclass.finalize', e)
    })
  }
}

function wwclsssChk (cbFunc, nodeArray) {
  let i, ele
  const procEle = (ele) => {
    const cls = ele.getAttribute('data-wwclass')
    if (cls) {
      cbFunc(ele, cls)
    }
  }
  for (i = 0; i < nodeArray.length; i++) {
    ele = nodeArray[i]
    procEle(ele)
    const nodeList = ele.querySelectorAll('[data-wwclass]')
    Array.prototype.forEach.call(nodeList, procEle)
  }
}

// data-wwclass的监听事件是nodeBeforeAdd，这是为了提高后续可能的加载效率。
EE.on('nodeBeforeAdd', wwclsssChk.bind(null, construCls))
EE.on('nodeRm', wwclsssChk.bind(null, finalizeCls))

export default {
  hyper: hyper,
  wwclass: wwclass
}
