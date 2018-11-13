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
import './utils/systemjs'
import cfg from './utils/cfg'
import chkSetup from './chk'
import EE from './utils/evt'

console.log(chkSetup)

// 不再使用诸如barba.js,navigo,page.js之类的History API管理工具。而是内建由view来自行调用History API来自行处理。
// import router from './utils/router'

// console.log(System)

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
window.wwimport = window.wwimport || function(mod,callback){
  window.wwimcache = window.wwimcache || [];
  window.wwimcache.push({id : mod,cb : callback});
}
</script>
```
id可以使用如下格式，以在内部特定事件发生时，得到通知：
- fullfill : 当wwjs可以使用时，回调。
- ready : 当wwjs可用，并且dom ready时，回调。
- [@]URL : 如果不带@前缀，则默认从本地服务器加载。如果带有@前缀，则从libs服务器下加载。如果给出全路径，则忽略@前缀。当前支持的前缀(区分大小写)如下:
  - json! : json格式
  - css! : 通过在head中设置<link>标签来加载，如果已有相同url被加载,则fullfill(一个url只加载一次).
  - ~~amd! : 当作amd module来加载。~~如果需要加载amd模块，请使用`window.define`函数。
  - 无前缀时被当作es6模块(CommonJS) : 当作es6 module来加载。
- [!][*viewSelector]URL[#!!modelpath!!#] 调用URL,并更新view及model。此格式下的URL被解析到本地地址。
  - !或*必须有一个。通常在主页面只加载model，因此会形如：“!URL”
  - 如果要求加载一对,URL给出的是view的url，而model的url会把view的后缀(建议采用.html)改为.json加载。
  - 当加载模型时，可以通过指定modelpath后缀来指明更新model的路径，如果未加载模型，modelpath从字符串中删除。如果没有给出modelPath,则默认从根路径下开始更新。服务器回应如果指定路径，优先级低于这里指定的modelPath
 * @method wwimport
 * @param {string|array} id 字符串形式的模块id。也就是url形式。
 * @param {function} [cb] 模块加载成功后的回调函数。接受两个参数，第一个为err对象(null表示无错误)，第二个为mod对象。
 * @return {promise|undefined} 如果wwjs模块已就绪，则返回promise对象，否则返回undefined.
 * @name wwimport
 **/
function wwimport (id, cb) {
  if ($.isArray(id)) {
    for (let i = 0; i < id.length; i++) {
      wwimport(id[i], cb)
    }
    return
  }
  if (!$.isString(id) || id.length === 0) {
    return
  }
  if (!$.isFunction(cb)) {
    // 允许不传入回调，用于加载后不管的情况。
    cb = () => {}
  }
  if (id === 'fullfill') {
    cb(null)
  } else if (id === 'ready') {
    ready(cb)
  } else {
    return window.System.import(id).then((mod) => {
      cb(null, mod)
    }).catch((err) => {
      cb(err)
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
    // 已经在wwimport中检查了，确保是一个函数。
    cb(err)
  }
  chkSetup()
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
   @desc wwjs主模块，负责构建wware在浏览器下的执行环境。wware假定代码都由编译器做完transpiling之后产生。wwjs只是提供一个抽象的浏览器虚拟机(<font color="red">所有可以提供相同API的虚拟机都可以被WWARE transpiling所支持</font>)，其自身可以执行于ie8+以上的环境。并确保如下功能:
   - Promise
   - MutationObserver
   - ES6 Module Loader

配置wwjs的方式是，在引入wwjs之前，定义部分全局变量：
```
   window.wwcfg = {
      debug : true , //如果被定义为true，则启用调试模式，在console输出更多信息。
      libbase : "//libs.YOURDOMAIN.COM" , //如果被定义一个字符串(空字符串表示引用本地服务器地址)，则用来做外部引入库的根路径。默认是"//libs.wware.org" : 注意服务器的CORS设置。
    }
```
   @example
<script>
window.wwcfg  = {
  debug : true,
  libbase : "//libs.mydomain.com/someprefix"
}
</script>
<script async src="//libs.wware.org/wwjs/2.0.0/wwjs.min.js"></script>
   */

/**
当所有内部功能就绪，并且dom ready之后，ready开始回调callback。如果已经就绪，则立即直接回调。
 * @method wwjs
 * @param {function} cb 当ready之后调用，如果地一个参数不为空(null)，则意味着ready时发生错误。
 * @name ready
 * @return undefined
 **/
function ready (cb) {
  if (!$.isFunction(cb)) {
    if (cfg.debug) {
      console.error(`ready参数必须是一个函数,而不是"${String(cb)}"！忽略本次ready调用`)
    }
    return
  }
  switch (readyState) {
    case READY_PEDING:
      readNoitifer = readNoitifer || []
      readNoitifer.push(cb)
      break
    case READY_SUC:
      cb(null)
      break
    default:
      cb(readyState)
  }
}

module.exports = (() => {
  return {
    /**
    当前的wwjs的配置。注意这里的属性是只读的，修改之后无效。
     * @member wwjs
     * @readonly
     * @type {object}
     * @name config
    **/
    config: cfg,
    /**
    默认的事件中心,可以通过window.EE访问本变量。
     * @member wwjs
     * @constant
     * @type {object}
     * @name EE
    **/
    EE: EE,
    /**
    同步检查当前是否已经ready.
     * @method wwjs
     * @name isReady
     * @return {Boolean} 返回当前是否已经ready。如果发生错误，也算作ready状态。
     **/
    isReady: () => { return readyState !== READY_PEDING },
    ready: ready,
    /**
    当前的wwjs版本号。
     * @member wwjs
     * @readonly
     * @type {string}
     * @name version
     **/
    version: '<# VERSION #>'
  }
})()
