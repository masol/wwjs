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
// Created At : 2018-11-01T13:02:35.568Z by masol (masol.li@gmail.com)

'use strict'

import $ from 'jquery'
import 'systemjs/dist/s'
import 'systemjs/dist/extras/amd'

if (process.env.NODE_ENV === 'development') {
  window._debug = true
}

/**
内建的jQuery支持。注意，这不是原生jQuery,而是[cash-dom](https://github.com/kenwheeler/cash)，并被绑定到window.jQuery以及window.$
 * @type {jQuery}
 * @name $
 **/
window.$ = window.jQuery = $

/**
回调风格的模块加载。通常需要在html的head部分，写下容错代码，这在wwjs就绪之前，缓冲模块加载请求，并在就绪之后，异步并行加载。
```
<script>
window.wwimport = function(mod,callback){
  window.wwimcache = window.wwimcache || [];
  window.wwimcache.push({id : mod,cb : callback});
}
</script>
```
部分特殊的id被预约，以在内部特定事件发生时，得到通知：
- fullfill : 当wwjs可以使用时，回调。
- ready : 当wwjs可用，并且dom ready时，回调。
 * @method wwimport
 * @param {string} id 字符串形式的模块id。也就是url形式。
 * @param {function} cb 模块加载成功后的回调函数。接受两个参数，第一个为err对象(null表示无错误)，第二个为mod对象。
 * @return {promise|undefined} 如果wwjs模块已就绪，则返回promise对象，否则返回undefined.
 * @name wwimport
 **/
function wwimport (id, cb) {
  if (id === 'fullfill') {
    if (typeof suc === 'function') {
      cb(null)
    }
  } else if (id === 'ready') {
    ready(cb)
  } else {
    return window.System.import(String(id)).then((mod) => {
      if (typeof suc === 'function') {
        cb(null, mod)
      }
    }).catch((err) => {
      if (typeof err === 'function') {
        cb(err)
      }
    })
  }
}

// delete window.Promise
// delete window.MutationObserver
// delete window.WebKitMutationObserver
// delete window.fetch
const polyfills = require('./utils/polyfills')

let readNoitifer = []

// 调用缓冲的ready回调，ready已经发生。err为null表示无错误，否则是一个异常对象。
function notifyReady (err) {
  readNoitifer = readNoitifer || []
  while (readNoitifer.length > 0) {
    const cb = readNoitifer.shift()
    if (typeof cb === 'function') {
      cb(err)
    }
  }
  readNoitifer = undefined
}

// 0 pending,1:suc,2: failed
const READY_PEDING = 0
const READY_SUC = 1
let readyState = READY_PEDING
polyfills.install(() => {
  // basic environment ready. 开始处理缓冲的加载请求。
  // 现在开始等待dom ready事件，并开始处理。
  let tasks = []
  if (typeof window.wwimcache === 'object') {
    let i
    for (i in window.wwimcache) {
      const item = window.wwimcache[i]
      tasks.push(wwimport(item.id, item.cb))
    }
  }
  window.wwimport = wwimport
  window.Promise.all(tasks).then(() => {
    $(document).ready(function () {
      readyState = READY_SUC
      notifyReady(null)
    })
  }).catch((err) => {
    console.err(`ready之前发生错误，忽略这一错误，并继续处理，这可能会发生其它问题。错误内容:${err}`)
    readyState = err
    notifyReady(err)
  })
})

/**
   @module wwjs
   @desc wwjs主模块，负责构建wware在浏览器下的执行环境。wware假定代码都由编译器做完transpiling之后产生。wwjs自身可以执行于ie8+以上的环境。并确保如下功能:
   - Promise
   - MutationObserver
   - ES6 Module Loader
   */

/**
当所有内部功能就绪，并且dom ready之后，ready开始回调callback。如果已经就绪，则立即直接回调。
 * @method wwjs
 * @param {function} cb 当ready之后调用，如果地一个参数不为空(null)，则意味着ready时发生错误。
 * @name ready
 * @return undefined
 **/
function ready (cb) {
  switch (readyState) {
    case READY_PEDING:
      readNoitifer = readNoitifer || []
      readNoitifer.push(cb)
      break
    case READY_SUC:
      if (typeof cb === 'function') {
        cb(null)
      }
      break
    default:
      if (typeof cb === 'function') {
        cb(readyState)
      }
  }
}

module.exports = (() => {
  return {
    ready: ready,
    /**
    同步检查当前是否已经ready.
     * @method wwjs
     * @name isReady
     * @return {Boolean} 返回当前是否已经ready。如果发生错误，也算作ready状态。
     **/
    isReady: () => { return readyState !== READY_PEDING },
    /**
    当前的wwjs版本号。
     * @member wwjs
     * @type {string}
     * @name version
     **/
    version: '<# VERSION #>'
  }
})()
