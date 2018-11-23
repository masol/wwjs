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

import wwcls from './wwclass'
import cfg from '../utils/cfg'

const wwclass = wwcls.wwclass

const hyper = require('hyperhtml/umd')

// console.log(hyper)

/**
wwjs的元素扩展模块，内建推荐方法是扩展[wwclass](wwclass.html)——wwlcass没有像[webcomponents](https://www.webcomponents.org/)那样利用[custom-element](https://caniuse.com/#search=Custom%20Elements)机制。而是使用mutation监听需要的属性变更，来模拟一个元素，同时兼顾了对KO的事件更新。内部的模板机制，推荐使用内置并暴露在`wwjs.hyper`名称空间下的[hyperHtml库](https://viperhtml.js.org/hyperhtml/documentation/)。
@module elems
*/

function construCls (ele, cls) {
  // console.log('in construCls,ele=', ele)
  Promise.resolve(wwclass.get(cls, ele.getAttribute('data-classurl'))).then((Cls) => {
    Promise.resolve(new Cls(ele)).then((inst) => {
      EE.emit('elems.inst', ele, inst, cls)
      if (!inst._rid && typeof (inst.doRender) === 'function') {
        inst.requestRender()
      }
    })
    // console.log('ele =', ele, 'cls = ', cls)
  })
}

/**
释放由wwclass基类分配的资源．本函数在派生类的`finalize`函数执行之后执行．这是闭包函数，外部无法访问．只由`elems`模块调用．
@exports elems
@method finalizeInstance
@static
@access private
**/
function finalizeInstance (inst) {
  // console.log('enter finalizeInstance,inst = ', inst)
  if (inst.$ele && inst.$ele.length > 0) {
    wwcls.rm(inst.$ele[0])
    inst.$ele = undefined
  }
  if (inst._mut && inst._mut.observer) {
    // console.log('disconnect mutation')
    inst._mut.observer.disconnect()
    inst._mut.observer = undefined
  }
  if (inst._rid) {
    cancelAnimationFrame(inst._rid)
  }
  inst._p = undefined
  inst.props = undefined
}

function finalizeCls (ele, cls) {
  // console.log('enter finalizeCls:', arguments)
  const clsFinalize = (inst, name) => {
    if (typeof (inst[name]) === 'function') {
      return inst[name]()
    }
  }
  const inst = wwclass.getInstance(ele)
  // console.log('inst=', inst)
  if (typeof (inst) === 'object') {
    Promise.resolve(clsFinalize(inst, 'finalize')).then(() => {
      finalizeInstance(inst)
    }).catch((e) => {
      finalizeInstance(inst)
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
