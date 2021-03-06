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

// import $ from 'jquery'
import './index.css'
import loadjs from './utils/loadjs'
import cfg from './utils/cfg'
import ns from './ko/ns'
import chkSetup from './chk'
import EE from './utils/evt'
import json from './utils/json'
import ui from './utils/ui'
import polyfillSetup from './utils/polyfills'
import vm from './ko/viewmodel'
import wwcls from './elems'
import net from './net'
import i18n from './utils/i18n'
import queryString from 'query-string'
import getKY from './utils/ky'
import AnimEvent from 'anim-event'
import state from './utils/state'
import ObjectPath from 'objectpath'
import './utils/lazysizes'

// console.log(loadjs)

// 这是[jQuery 3.3.1](https://jquery.com/)，并被绑定到window.jQuery以及window.$

// /**
// 内建的jQuery支持。注意这不是[jQuery](https://jquery.com/),而是[cash-dom](https://github.com/kenwheeler/cash)
//  * @type {jQuery}
//  * @name $
//  **/

if (!window.jQuery || !window.ko) {
  console.error('wwjs的运行需要依赖jQuery以及knockout.js。请确保包含wwjs之前，已经引入了jquery及knockout')
}

// 设置和获取baseurl
ui.baseurl()

// if (!window.$) {
//   window.$ = window.jQuery = $
// }
// 为了更多兼容
// $.fn.jquery = '3.0.0'
// $.fn.support = ''

// console.log(chkSetup)

// 不再使用诸如barba.js,navigo,page.js之类的History API管理工具。而是内建由view来自行调用History API来自行处理。
// import router from './utils/router'

// console.log(System)

/**
暴露在window.wwjs全局名称空间的[wwjs](module-wwjs.html)模块对象。
 * @type {object}
 * @name wwjs
 **/

/**
 暴露在window.AnimEvent全局名称空间的[AnimEvent](https://github.com/anseki/anim-event)。用于简化对rquestAnimation的调用，类似于[lodash#throttle](https://lodash.com/docs/4.17.10#throttle)。
  * @type {object}
  * @name AnimEvent
 **/
window.AnimEvent = AnimEvent

/**
暴露在window.Template全局名称空间的[Template](module-wwjs.html#~Template)函数。等同于`wwjs.Template`。
 * @method Template
 * @param {string} templateString 符合es6 template literial规范的字符串。
 * @param {object} [value={}] 在templateString中可以使用的额外变量声明。
*/
function Template (templateString, value) {
  return window.Template.apply(this, arguments)
}

/**
 暴露在window.EE全局名称空间的事件中心，API文档参考[Nodejs官方文档](https://nodejs.org/api/events.html)，事件列表参考[evt模块](module-utils_evt.html)。
 全局的`EE`对象存在的目的: 当wwjs自身发生错误时，导致wwjs等机制无法工作，EE依然可以响应。
  * @type {object}
  * @name EE
**/

/**
 暴露在window.ko全局名称空间的Knockoutjs
- API文档参考[Knockoutjs官方文档](https://github.com/knockout/knockout/wiki/API-Reference)
- 额外增加了[mapping插件](https://knockoutjs.com/documentation/plugins-mapping.html)，通过`ko.mapping`来访问。
  * @type {object}
  * @name ko
**/

/**
 暴露在window.Modernizr全局名称空间的特性检查，提供了当前浏览器对各特性支持情况的信息。详情参考[polyfills模块](module-utils_polifills.html)文档。
  * @type {object}
  * @name Modernizr
**/

/**
 暴露在window.ky全局名称空间的ky,在polyfill加载完毕后有效。
- API文档参考[ky官方文档](https://github.com/sindresorhus/ky)。同时wwjs中提供了[getky](module-wwjs.html#~getky)函数返回相同对象。
  * @type {function}
  * @name ky
**/

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
  - img! : img格式
  - js! : javascript模块格式
  - css! : 通过在head中设置<link>标签来加载，如果已有相同url被加载,则fullfill(一个url只加载一次).
  - 无前缀时被当作amd模块(LoadJS)对待
- URLArray : 这是标准的loadjs bundle Array，如有多重依赖，提前使用`loadjs(...)`来定义好依赖关系。
- [!][*viewSelector]URL[#!!modelpath!!#] 调用URL,并更新view及model。此格式下的URL被解析到本地地址。
  - !或*必须有一个。通常在主页面只加载model，因此会形如：“!URL”
  - 如果要求加载一对,URL给出的是view的url，而model的url会把view的后缀(建议采用.html)改为.json加载。
  - 当加载模型时，可以通过指定modelpath后缀来指明更新model的路径，如果未加载模型，modelpath从字符串中删除。如果没有给出modelPath,则默认从根路径下开始更新。服务器回应如果指定路径，优先级低于这里指定的modelPath
- done::XXX : XXX的格式如同上一条，这不是加载，而是指示某个依赖项已经被加载完毕。
 * @method wwimport
 * @param {string|array} id 字符串形式的模块id。也就是url形式。
 * @param {function} [cb] 模块加载成功后的回调函数。接受两个参数，第一个为err对象(null表示无错误)，第二个为mod对象。
 * @return {promise|undefined} 如果wwjs模块已就绪，则返回promise对象，否则返回undefined.
 * @name wwimport
 **/
function wwimport (id, cb) {
  if (typeof (cb) !== 'function') {
    // 允许不传入回调，用于加载后不管的情况。
    cb = () => {}
  }
  if (Array.isArray(id)) {
    let allResult = []
    // 为防止同步回调，resp和expect在所有wwimport发送完毕之前不可能相等。
    let respCount = 1
    let chkAllDone = (idx, r) => {
      allResult[idx] = r
      respCount++
      if (respCount === id.length) {
        cb(allResult)
      }
    }
    for (let i = 0; i < id.length; i++) {
      wwimport(id[i], chkAllDone.bind(null, i))
    }
  }
  if (!(id) || typeof (id) !== 'string' || id.length === 0) {
    return
  }
  const donePrefix = 'done::'
  if (id === 'fullfill') {
    cb(null)
  } else if (id === 'ready') {
    ready(cb)
  } else if (String(id).startsWith(donePrefix)) {
    return loadjs.depDone(String(id).substr(donePrefix.length))
  } else {
    return loadjs.load(id, {
      success: cb,
      error: cb
    })
  }
}

// delete window.Promise
// delete window.MutationObserver
// delete window.WebKitMutationObserver
// delete window.fetch

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
polyfillSetup(() => {
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
  window.ky = getKY()
  window.Promise.all(tasks).then(() => {
    $(document).ready(function () {
      readyState = READY_SUC
      notifyReady(null)
    })
  }).catch((err) => {
    console.error(`ready之前发生错误，忽略这一错误，并继续处理，这可能会发生其它问题。错误内容:${err}`)
    readyState = err
    notifyReady(err)
  })
})

/**
   @module wwjs
   @desc wwjs主模块，负责构建wware在浏览器下的执行环境。本模块会创建一个全局变量wwjs,并暴露在window下。wware假定代码都由编译器做完transpiling之后产生。wwjs只是提供一个抽象的浏览器虚拟机(<font color="red">所有可以提供相同API的虚拟机都可以被WWARE transpiling所支持</font>)，其自身可以执行于ie8+以上的环境。并确保如下功能:
   - Promise
   - MutationObserver
   - ES6 Module Loader

wwjs做为主模块，被安装到`window.wwjs`名称空间下。可以直接访问`wwjs`来访问本模块的功能。为了配置wwjs，需要在引入wwjs之前定义配置变量，详情参考[utils/cfg模块](module-utils_cfg.html)
*/

/**
当所有内部功能就绪，并且dom ready之后，ready开始回调callback。如果已经就绪，则立即直接回调。
 * @method wwjs
 * @param {function} cb 当ready之后调用，如果地一个参数不为空(null)，则意味着ready时发生错误。
 * @name ready
 * @return undefined
 **/
function ready (cb) {
  if (typeof (cb) !== 'function') {
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

let wwjs = {
  /**
  当前的wwjs的配置。注意这里的属性是只读的，修改之后无效。API文档参考[utils/cfg模块](module-utils_cfg.html)
   * @member wwjs
   * @readonly
   * @type {object}
   * @name config
  **/
  config: cfg,
  /**
  默认的事件中心,可以通过window.EE访问本变量。API文档参考[Nodejs官方文档](https://nodejs.org/api/events.html),注意V8.4之后引入的方法无效。事件列表参考[evt模块](module-utils_evt.html)。
   * @member wwjs
   * @constant
   * @type {object}
   * @name EE
  **/
  EE: EE,
  /**
  ky实例。详情参考[ky模块](module-utils_ky.html)。实例的用法参考[ky官方文档](https://github.com/sindresorhus/ky)。

  注意:由于ky依赖fetch，因此，如果浏览器不支持fetch，需要等到fetch polyfill安装完毕之后ky才就绪。因此这一属性直到polyfill安装完毕才会就绪。
   * @member wwjs
   * @constant
   * @type {object}
   * @name ky
  **/
  /**
  同步检查当前是否已经ready.
   * @method wwjs
   * @name isReady
   * @return {Boolean} 返回当前是否已经ready。如果发生错误，也算作ready状态。
   **/
  isReady: () => { return readyState !== READY_PEDING },
  /**
  JSON辅助函数对象，详细API查看[utils/json模块](module-utils_json.html)
   * @member wwjs
   * @constant
   * @type {object}
   * @name JSON
  **/
  JSON: json,
  /**
  hyperHtml暴露到wwjs名称空间下。详细文档查看[wwclass模块](wwclass.html)。主要提供了两个函数:
  - wwjs.hyper.bind(DomElement)\'Template String\'
  - wwjs.hyper.wire(Object)\`Template String\`
   * @member wwjs
   * @constant
   * @type {object}
   * @name hyper
  **/
  hyper: wwcls.hyper,
  /**
  本地化子系统，这只是一个最简的i18n子系统，支持[gettext](https://www.gnu.org/software/gettext/)工作链。如果需要复杂的定制，可以考虑自行使用[i18next](https://www.i18next.com/)。两者可以无缝衔接，只不过i18next支持更多特性——但是这些特性会牺牲页面加载速度。详情参考[i18n](module-utils_i18n.html)子模块
   * @member wwjs
   * @constant
   * @type {object}
   * @name i18n
  **/
  i18n: i18n,
  /**
  [loadjs](https://github.com/muicss/loadjs)暴露到wwjs名称空间下。详细文档查看[loadjs模块](module-utils_loadjs.html)
   * @member wwjs
   * @constant
   * @type {object}
   * @name loadjs
  **/
  loadjs: loadjs,
  /**
  网络协议子模块，通过wwjs暴露到全局空间。详细文档查看[net模块](module-net.html)
   * @member wwjs
   * @constant
   * @type {object}
   * @name net
  **/
  net: net,
  /**
  名称空间子模块，通过wwjs暴露到全局空间。详细文档查看[ko/ns模块](module-ko_ns.html)
   * @member wwjs
   * @constant
   * @type {object}
   * @name ns
  **/
  ns: ns.pub,
  /**
   暴露的Objectpath分析库。(https://github.com/mike-marcacci/objectpath)。可以简单分析js变量语句，形如: `a.b['test'].d`
   */
  objectPath: ObjectPath,
  /**
  queryString的解析器，通过wwjs暴露到全局空间。详细文档查看[query-string](https://github.com/sindresorhus/query-string)
  * @member wwjs
  * @constant
  * @type {object}
  * @name qs
  **/
  qs: queryString,
  ready: ready,
  /**
  保存应用状态的存储空间。页面生存期，即使使用伪单页程序，页面伪刷新时，这里的数据会被清空。
   * @member wwjs
   * @type {State}
   * @name state
  **/
  state: state,
  /**
  es6模板规范的编译器，用于在es5环境下使用template。API参考[es6-dynamic-template](https://www.npmjs.com/package/es6-dynamic-template)，注意这是利用了babel的编译能力。
   * @member wwjs
   * @constant
   * @type {function}
   * @name Template
  **/
  Template: Template,
  /**
  UI抽象子模块，提供了对HTML布局的一个抽象假设。可以通过[cfg模块](module-utils_cfg.html)来配置。详细文档查看[utils/ui模块](module-utils_ui.html)
   * @member wwjs
   * @constant
   * @type {object}
   * @name ui
  **/
  ui: ui,
  /**
  ViewModel子模块被暴露到wwjs名称空间中。详情参考[ko/viewmodel模块](module-ko_viewmodel.html)
   * @member wwjs
   * @constant
   * @type {object}
   * @name vm
  **/
  vm: vm,
  /**
  当前的wwjs版本号。
   * @member wwjs
   * @readonly
   * @type {string}
   * @name version
   **/
  version: '<# VERSION #>',
  /**
  wwclass基类[wwclass类定义](wwclass.html)
   * @member wwjs
   * @constant
   * @type {object}
   * @name wwclass
  **/
  wwclass: wwcls.wwclass
}

Object.defineProperty(wwjs, 'ky', {
  get () {
    return getKY()
  },
  enumerable: true
})

module.exports = wwjs
