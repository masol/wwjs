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

import * as lit from 'lit-html'
import wwclass from './wwclass'

// console.log(lit.html)
// console.log(lit.render)

/**
wwjs的元素扩展模块，内建推荐方法是扩展[wwclass](wwclass.html)——wwlcass没有像[webcomponents](https://www.webcomponents.org/)那样利用[custom-element](https://caniuse.com/#search=Custom%20Elements)机制。而是使用mutation监听需要的属性变更，来模拟一个元素，同时兼顾了对KO的事件更新。内部的模板机制，推荐使用内置并暴露在`wwjs.lit`名称空间下的[lit-html库](https://github.com/Polymer/lit-html)。
@module elems
*/

function construCls (ele, cls) {
  console.log('ele =', ele, 'cls = ', cls)
}

function finalizeCls (ele, cls) {

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
  lit: lit,
  wwclass: wwclass
}
