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
// Created At : 2018-11-19T05:50:52.931Z by masol (masol.li@gmail.com)

'use strict'
// import $ from 'jquery'
import loadjs from '../utils/loadjs'
import cfg from '../utils/cfg'
import json from '../utils/json'
const hyper = require('hyperhtml/umd')
const callPrefix = 'data-call-'

// 获取一个函数的名称。inspired from https://gist.github.com/dfkaye/6384439
// 又是因为IE捣乱，废弃此特性支持．
function getFnName (fn) {
  let s
  s = fn.name || (fn.constructor && fn.constructor.name ? fn.constructor.name : '')
  return s || '未获取函数名'
  // s = fn.toString().match(/function ([^(]+)/)
  // if (s && s.length > 1) { return s[1] }
  // return 'anonymous'
}

function removeDataPrefix (str) {
  if (String(str).startsWith('data-')) {
    str = str.substr('data-'.length)
  }
  return str
}

function procNode (ele, condition, inst) {
  // console.log('procNode ele=', ele)
  for (let i = 0; i < condition.length; i++) {
    const cond = condition[i]
    let func = (typeof (cond.handler) === 'function') ? cond.handler : inst[cond.handler]
    if (!func) {
      return
    }
    if (cond.nodeType) {
      if (ele.nodeType & cond.nodeType === 0) { return }
    } else if (ele.nodeType !== 1) {
      return
    }
    if (cond.selector) {
      let $ele = $(ele)
      // console.log('cond.selector=', cond.selector, '$ele.find(cond.selector)=', $ele.find(cond.selector))
      let notiArray = []
      if ($ele.is(cond.selector)) {
        notiArray.push(ele)
      }
      notiArray = notiArray.concat($ele.find(cond.selector).toArray())
      // console.log('notiArray=', notiArray)
      if (notiArray.length > 0) {
        // console.log('func', func, 'inst', inst)
        func.call(inst, notiArray)
        if (cond.render) {
          inst.requestRender()
        }
      }
    }
  }
}

function addTreeMonitor (isAdd, subtree, selector, handleName, nodeType, render) {
  let self = this
  self._mut = self._mut || {}
  let treeName = isAdd ? 'addtree' : 'rmtree'
  self._mut[treeName] = self._mut[treeName] || []
  self._mut[treeName].push({
    selector: selector,
    handler: handleName,
    nodeType: nodeType,
    render: render
  })
  let subType = subtree ? 'subtree' : false
  // console.log('subType=', subType)
  monitor(self, 'childList', subType)
}

function callMethod (self, name) {
  const updateRes = (info, mid) => {
    info = String(info || '')
    if (info.length > 0 && self.$ele) {
      const infoName = `data-${mid}-${name}`
      console.log(self.$ele)
      self.$ele.attr(infoName, info)
      self.$ele.trigger(ko.attrChanged, infoName)
    }
  }

  const opt = self._mut.methods[name]
  let err = ''
  if (typeof opt === 'object' && Function.isFunction(self[name])) {
    const func = self[name]
    const defValue = opt.defValue || ''
    const attrName = `${callPrefix}${name}`
    const attrValue = self.$ele.attr(attrName)
    if (defValue === attrValue) { // 默认值，不触发函数调用，直接返回.
      return
    }
    let param = json.parse(attrValue)
    if (param.error) {
      param = attrValue
    } else {
      param = param.value
    }
    if (!opt.noParamChk) { // 需要检查参数数量。
      let len = 1
      if (Array.isArray(param)) {
        len = param.length
      }
      if (func.length > len) {
        err = `invalidParameter:${name},except${func.length},given ${len}`
      }
    }

    if (err.length === 0) { // 一切正常，执行函数。
      if (!Array.isArray(param)) {
        param = [param]
      }
      const chkCacheReq = () => {
        if (self.$ele) { // 尚未析构。
          opt.req = opt.req || []
          if (opt.req.length > 0) {
            let reqParam = opt.req.shift()
            callMethodImpl(reqParam)
          } else { // 将属性更新为默认值，以方便下次调用。
            self.$ele.attr(attrName, defValue)
          }
        }
      }
      const callMethodImpl = (param) => {
        opt.result = Promise.resolve(func.apply(self, param)).then((result) => {
          updateRes(result, 'x')
          opt.result = undefined
          chkCacheReq()
        }).catch((errObj) => {
          err = `runtimeError:${errObj}`
          updateRes(err, 'e')
          err = ''
          chkCacheReq()
        })
      }
      if (!opt.async && opt.result) { // 同步并且已经有调用执行中
        opt.req = opt.req || []
        opt.req.push(param)
      } else { // 异步或者没有调用执行中.
        callMethodImpl(param)
      }
    }
  } else {
    err = `invalidMethod:${name}`
  }

  updateRes(err, 'e')
  err = ''
}

function check (mutations) {
  let self = this
  // console.log('enter mutation callback')
  mutations.forEach(function (mutation) {
    if (mutation.removedNodes && mutation.removedNodes.length > 0) {
      // @TODO 实现选择器判定式通知self指定函数.
      if (self._mut.rmtree && self._mut.rmtree.length > 0) {
        for (let i = 0; i < mutation.removedNodes.length; i++) {
          procNode(mutation.removedNodes[i], self._mut.rmtree, self)
        }
      }
    }
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      // @TODO 实现选择器判定式通知self指定函数.
      if (self._mut.addtree && self._mut.addtree.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          procNode(mutation.addedNodes[i], self._mut.addtree, self)
        }
      }
    }
    if (mutation.attributeName) {
      const attrName = String(mutation.attributeName)
      // console.log('attrName=', attrName)
      if (self.$ele.is(mutation.target)) {
        const propName = self._mut.attr[attrName]
        // console.log('propName=', propName)
        if (propName) {
          self.props[propName] = self.$ele.attr(attrName)
        } else if (attrName.startsWith(callPrefix)) {
          callMethod(self, attrName.substr(callPrefix.length))
        }
      }
    }
  })
}

function monitor (self, type, subType) {
  self._mut = self._mut || {}
  self._mut.attr = self._mut.attr || {}
  self._mut.methods = self._mut.methods || {}
  self._mut.config = self._mut.config || {}
  // 尚未开始监听此类型．添加监听.
  if (!self._mut.config[type] || (subType && !self._mut.config[subType])) {
    if (self._mut.observer) {
      self._mut.observer.disconnect()
      self._mut.observer = undefined
    }
    self._mut.config[type] = true
    if (subType) {
      self._mut.config[subType] = true
    }
    self._mut.observer = new MutationObserver(Function.bind.call(check, self))
    // console.log('self.$ele=', self.$ele, 'config=', self._mut.config)
    self._mut.observer.observe(self.$ele[0], self._mut.config)
  }
}

let wwclsMap = {}
let ele2inst

function getE2Iwmap () {
  if (!ele2inst) {
    ele2inst = new WeakMap()
  }
  return ele2inst
}

// 仅内部使用，用于在elems::finalizeInstance时移除对应的weakmap入口。
function rm (ele) {
  getE2Iwmap().delete(ele)
}

// inspired by https://github.com/cmartin81/decorator-wrap/blob/master/src/wrap.js
// 增加特性，复制arg到数组，以允许wrapperMethod动态修改参数。
function wrap (wrapperMethod) {
  return (Target, key, descriptor) => {
    if (typeof (Target) === 'function') {
      // @FIXME 如何使用new的时候,可以apply arguments?
      let newTarget = function (arg) {
        // let args = Array.prototype.slice.call(arg, 0)
        let self = this
        // console.log('in wrap before ,arg=', arg)
        return (function () {
          let methodCallback = function () {
            // const ArgsTarget = Function.bind.apply(Target, arg)
            // return new ArgsTarget(arg)
            // console.log('in wrap,arg=', arg)
            return new Target(arg)
          }
          return wrapperMethod.call(self, methodCallback, arg, Target.name, 'class', Target)
        }())
      }
      return newTarget
    } else {
      let orgMethod = descriptor.value
      descriptor.value = function (...arg) {
        let self = this
        return (function () {
          let methodCallback = function () { return orgMethod.apply(self, arg) }
          return wrapperMethod.call(self, methodCallback, arg, key, 'function', Target)
        }())
      }
      return descriptor
    }
  }
}

// wwclass的requestAnimationFrame回调
function frameProc (/*, timeStamp */) {
  // console.log('enter frameProc:', arguments)
  const wwInst = this
  if (wwInst._rid) {
    cancelAnimationFrame(wwInst._rid)
    wwInst._rid = undefined
    // if (typeof (wwInst.doRender) === 'function') {
    // 只有wwInst已经初始化并且尚未删除才调用doRender方法。
    if (wwInst.$ele) {
      wwInst.doRender()
    }
    // }
  }
}

// 更新属性，是否需要将本方法公开给派生类使用？
function updateProp (self, newValue, attrName, propName, methodName, options) {
  // console.log('enter updateProp', arguments)
  if (newValue !== self._p[propName]) {
    let oldValue = self._p[propName]
    self._p[propName] = newValue
    // console.log(self.props.test)
    if (!options.noSyncEle && self.$ele.attr(attrName) !== newValue) {
      self.$ele.attr(attrName, newValue)
    }
    if (!options.noSyncKO) {
      // console.log('to trigger attrChanged event')
      self.$ele.trigger(ko.attrChanged, attrName)
    }
    if (options.render) {
      self.requestRender()
    }
    // 必须在最后调用回调，以确保属性更新完毕，否则回调中可能重新更新属性值，如果属性更新放在后面，会导致回调中设置的值被覆盖．
    if (Function.isFunction(self[methodName])) {
      self[methodName](oldValue, newValue)
    }
  }
}

/**
@class wwclass
@classdesc wwclass提供了wwjs元素类的基类，通过扩展wwclass来开发元素。这些元素不依赖[Shadow DOM](https://caniuse.com/#search=Shadow%20DOM%20v0)、[Custom Elements](https://caniuse.com/#search=Custom%20Elements)等当前支持不普遍的特性，而是利用普遍支持的[Mutation Observer](https://caniuse.com/#search=Mutation%20Observer)(性能问题参考[这里](http://stackoverflow.com/questions/31659567/performance-of-mutationobserver-to-detect-nodes-in-entire-dom))，结合模板库(当前选择[hyperHTML](https://github.com/WebReflection/hyperHTML))，局部css并不依赖被废弃的[Scoped CSS](https://caniuse.com/#search=Scoped%20CSS)或ShadowDom，而是利用PostCSS或[scope-css](https://github.com/dy/scope-css#readme)自动为元素css添加`[data-wwclass=XXX]`的前缀选择器。

wwjs元素处于三种状态:
- 初始状态:此时元素类尚未加载，元素以自己的原始定义被浏览器绘制。
- 元素类就绪:元素类及其依赖已被加载，元素类开始根据上下文重新调整元素外观，这里最重要的就是<font color='red'>平滑处理</font>，也就是从初始状态变化到元素类就绪状态，页面不应该闪烁。
- 数据就绪:需要的真实数据是由ko从各个数据源同步到元素上的，这可能发生在元素类就绪状态之前或之后，对元素类开发人员来说，这个状态大多数时候都可以忽略。而View开发者不关注元素类就绪状态，但是关注数据就绪的平滑处理。

wwclass类提供了如下修饰符(使用派生类不可见):
- [@wwjs.wwclass.dep](#.dep)
- [@wwjs.wwclass.readonly](#.readonly)

以及如下类修改器(在构造函数中使用)
- [this.method(...)](#~method)
- [this.watch(...)](#~watch)
- [this.watchAdd(...)](#~watchAdd)
- [this.watchRm(...)](#~watchRm)

以及如下静态方法(派生类不可见):
- [wwjs.wwclass.apply](#.apply)
- [wwjs.wwclass.call](#.call)
- [wwjs.wwclass.get](#.get)
- [wwjs.wwclass.reg](#.reg)
- [wwjs.wwclass.unreg](#.unreg)
- [wwjs.wwclass.getInstance](#.getInstance)

以及如下渲染支持(使用派生类可见):
- [requestRender](#requestRender)
- [render](#.render)

以及如下派生类可以实现的函数:
- init: 本函数在new完类对象时调用，如果派生类实现了本函数，则创建需要等本函数返回值解析之后(如果返回Promise)才会继续执行。用于弥补构造函数无法返回Promise的缺陷。

wwclass元素只处理客户端展示与逻辑，无需处理任意的数据源．这个概念类似[redux](https://redux.js.org/),不过是应用在整个系统，reducer就是服务器响应某个action的脚本，而action对象就是请求．redux与wwclass元素无关，设计初衷是：所有的公共数据(需要保存在服务器端的数据)，都是通过同步机制同步到KO层，再绑定到Dom元素上，从而触发wwclass元素作出反应，任意对服务器的请求就是一次状态变化请求．因此，wwclass没有提供任意与服务器通信的机制(也不需要与服务器通信，除了专门负责通信的元素)，只提供了如下机制:
- 绘制机制：任意时刻，调用```requestRender()```,在下一帧绘制时自动调用`doRender`,派生类可以重载`doRender`，函数内调用```this.render`Template．．．．````(<font color="red">注意不是函数调用，而是es6文字模板调用，没有括号</font>)即可实现模板动态绘制．这会自动维护增量更新，只需写出全模板即可．
- 依赖管理：如果依赖任意第三方库，可以通过``` @wwjs.wwclass.dep(...)```来修饰方法或类，从而自动加载依赖．
- 属性监听,自动更新,自动绘制: 构造函数中调用`this.watch(...)`即可支持.此时，`this.props[propName]`的写入，自动触发配置的同步．函数返回，`this.props[propName]`的值已经有效．并且如果本属性会触发渲染，只要有任意初始值，将会自动触发，无需额外调用．
- 构造与析构: 添加方法```finalize()```，在析构时自动调用.
- 版本控制：类定义中添加静态方法```static version : ＇X.X.X.X'```即可得到支持．(本条可以忽略，如果使用标准环境，版本控制是全自动的)
- 事件机制：并未实现特殊的事件监听机制，请自行使用`this.$ele.on('click',this.handlerFunc.bind(this))`的方式来监听事件－通常在构造函数中使用．

关于渲染的说明：
- 什么是增量更新？考虑一个例子`<ul>由DATA控制的li数组</ul>`．这个例子看起来很简单，直觉就会使用如下模板:
  ```
  doRender(){
  let self = this
  self.render`<ul>${DATA.map((item)=>{
    return `<li>${item.data}</li>`
  })}</ul>`
}```
  但是，这引发一个问题．如果我们变动DATA中的值，然后重新渲染，会发现每次都删除全部li元素，然后再新建.如何维持Dom元素与DATA数组中的关系？确保只新增DATA中新加的，删除DATA中新删除的．这一特性就称为增量更新．
- 增量更新唯一需要注意的是在循环中，需要利用`wwjs.hyper.wire(Object)`来维护Object是否变化，如果是新的Object则新建Dom元素，否则更新原Dom节点.因此，循环体中，必须`wire`到一个Object上，由这个Object来控制是否需要删除旧元素并新建，还是直接在对应的旧元素上更新．参考测试用例关于wwclass的部分,有测试此特性的代码，摘抄如下：
```
doRender(){
  let self = this
  self.render`<ul>${DATA.map((item)=>{
    return wwjs.hyper.wire(item)`<li>${item.data}</li>`
  })}</ul>`
}```

wwclass实例对象与DomElement的互相获取:
- 有了wwclass instance对象，通过属性XXX.$ele来获取对应的DomElement(jQuery对象)．
- 有一个DomElement对象，通过静态方法(getInstance)[#.getInstance]来获取对应的wwclass intance．内部通过[weakmap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)来维护这一反向映射，以不干扰GC．

@hideconstructor
**/
class wwclass {
  /**
  <strong><font color="green">modifier</font></strong>: 类修改器,为实例添加与DOM元素属性,KO attr变量之间的绑定关系
  @function watch
  @memberof wwclass
  @param {string} attrName 要监听的属性名.
  @param {object} [options={noSyncEle:false,noSyncKO:false,render: false}] 选项．当前支持如下三个选项:
   - noSyncEle :  任意代码对元素属性this[promName]改变时，不将变化同步到元素属性上．默认是同步的．
   - noSyncKO : 任意代码对元素属性this[promName]改变时，不将变动更新回KO属性绑定对应的变量(如果有的话)，默认是同步的.
   - render : 属性变动是否触发render方法．默认是不触发的.
  @param {string} [propName=RemoveDataPrefix(attrName)] 暴露在对象上的属性名.只有更新这一属性才会触发自动更新KO或Element。直接访问_p[propName]是不会触发自动更新的。
  @param {string} [methodName=`on${propName}Changed`] 属性值发生变化时，自动回调的函数`(oldValue, newValue)`，进入回调函数之后，`this[propName] === newValue`一定成立。因此，this._p[propName]也已经更新为newValue了: this._p[propName]就是this[propName]的属性存放地，this[propName]额外根据配置执行了部分更新关联元素/KO的代码。
  @inner
  @access private
  @example
class Demo extends wwjs.wwclass {
  constructor(ele) {
    super(ele)
    this.watch('data-prop', {noSyncEle:true}, 'propName', 'onchangeMethod')
    this.watch('data-prop2')
  }
}
  **/
  watch (attrName, options, propName, methodName) {
    if (!propName) {
      propName = removeDataPrefix(attrName)
    }
    if (!methodName) {
      methodName = `on${propName}Changed`
    }
    options = options || {}
    let self = this
    self._p = self._p || {}
    Object.defineProperty(self.props, propName, {
      get () {
        return self._p[propName]
      },
      set (newValue) {
        updateProp(self, newValue, attrName, propName, methodName, options)
      },
      enumerable: true
    })
    monitor(self, 'attributes')
    self._mut.attr[attrName] = propName
    // 必须在defineProperty后调用．否则回调里访问self.props会出错．先写入初始的attr值.updateProp中会判定新旧值是否一致，因此这里不判定．
    updateProp(self, self.$ele.attr(attrName), attrName, propName, methodName, options)
  }

  /**
  <strong><font color="green">modifier</font></strong>: 类修改器,为实例添加可以通过KO绑定来调用的方法。方法调用属性的值变动时，不会反向更新KO;DOM属性变化为非默认值则会触发函数调用。

  函数调用通过三个配对属性来完成：
  - `data-call-${函数名}`: 调用入口，值如果是一个JSON，则解析之后当作参数传入，否则当作字符串传入函数。这个属性在函数内部变化，不会更新绑定的KO变量，请内部不要更新此属性。**函数执行完毕之后，本属性的值被设置到默认值**,但是这个变动不会触发KO变量的同步。因此，下次直接改动KO变量即可再次调用函数。**额外注意，由于KO默认只有值变化才会触发通知，如果异步调用每次值都一致，需要设置对应绑定变量的通知机制**,如下代码:`vm.get().XXXX.extend({notify: 'always'});`(关闭使用`{notify: 'change'}`)。更多信息，参考[ko extender](https://knockoutjs.com/documentation/extenders.html)
  - `data-x-${函数名}`: 函数的返回值。这个属性，无论KO还是DOM变动不会触发内部响应，DOM变动也不会触发KO同步，只有内部返回值才会触发KO绑定更新。
  - `data-e-${函数名}`: 异常信息，如果函数执行中发生任何异常，则本属性被设置，以暴露异常信息。其更新规则与`data-x-${函数名}`相同，只有函数执行会自动更新KO绑定属性。DOM更新不会触发KO属性变动。
  - 额外支持一个`data-call`属性，与`data-call-${函数名}`的区别是，必须传入一个数组，其中第一个参数为函数名。**尚未支持，有需要发请求**

  **注意事项:**
  - 为了防止初始值触发函数调用，函数参数必须有默认值来区分是否是有效值，以防止初始化时默认调用一次，默认的默认值是空字符串`''`，可以通过option来改变。
  - 绑定方式的函数调用，并未支持sequence，因此多次并行调用无法区别返回值是哪个调用触发的。因此默认实现是同步机制，换言之，第二个调用一定会等地一个调用结束才会进行。为了改变这一特性，可以使用`async`属性来设置，但是此时,
    - 如果需要返回值，请自行实现一个sequence机制来区别返回值属于哪次调用。
    - 如果不需要返回值，可以安全忽略本注意事项。

  @function method
  @memberof wwclass
  @param {string} name 函数名，必须在类中有定义。
  @param {object} [options={noParamChk=false,defValue="",async="false"}] 配置项，含义如下:
  - noParamChk: 用于设置是否不检查传入参数的数量与函数配对。
  - defValue: 默认值，如果传入的值是默认值，不会触发函数调用。
  - async: 是否支持异步调用，也就是多个调用同时执行。默认不支持，多次调用会依次执行完毕。
  @inner
  @access private
  @example
class Demo extends wwjs.wwclass {
  constructor(ele) {
    super(ele)
    this.method('submit')
  }
  submit(value){
  }
}
  **/
  method (name, options) {
    options = options || {}
    let self = this
    self._p = self._p || {}
    monitor(self, 'attributes')
    self._mut.methods[name] = options
  }

  /**
  <strong><font color="green">modifier</font></strong>: 类修改器,为实例添加监测子节点加入的能力
  @function watchAdd
  @memberof wwclass
  @param {string} selector 标准的选择器，用于判定一个Dom元素的加入是否需要通知handler.
  @param {string|function} [handler='onChildAdd'] 一个处理函数，或者函数名(函数名必须属于实例对象).被调用到时，`this`就是实例．
  @param {object} [options={tree=false,nodeType=1,render:false}] 通过选项控制额外特性:
  - tree: 监听全部子节点加入？如果给出false,只监听直接孩子节点的加入．
  - nodeType: 要检查的节点类型，默认是普通元素，不包含text,comment等类型．
  - render: 是否触发渲染？默认不触发渲染．
  @inner
  @access private
  @example
class Demo extends wwjs.wwclass {
  constructor(ele) {
    super(ele)
    this.watchAdd('.somclass [data-prop]',this.onSomeClassAdd)
  }
}
  **/
  watchAdd (selector, handleName, options) {
    options = options || {}
    addTreeMonitor.call(this, true, options.tree, selector, handleName || 'onChildAdd', options.nodeType, options.render)
  }

  /**
  <strong><font color="green">modifier</font></strong>: 类修改器,为实例添加监测子节点移除的能力
  @function watchRm
  @memberof wwclass
  @param {string} selector 标准的选择器，用于判定一个Dom元素的加入是否需要通知handler.
  @param {string|function} [handler='onChildRm'] 一个处理函数，或者函数名(函数名必须属于实例对象).被调用到时，`this`就是实例．
  @param {object} [options={tree=false,nodeType=1,render:false}] 通过选项控制额外特性:
  - tree: 监听全部子节点加入？如果给出false,只监听直接孩子节点的加入．
  - nodeType: 要检查的节点类型，默认是普通元素，不包含text,comment等类型．
  - render: 是否触发渲染？默认不触发渲染．
  @inner
  @access private
  **/
  watchRm (selector, handleName, options) {
    options = options || {}
    addTreeMonitor.call(this, false, options.tree, selector, handleName || 'onChildRm', options.nodeType, options.render)
  }

  /**
  <strong><font color="red">decorator</font></strong>:防止方法或属性被改变(只读)
  @function readonly
  @memberof wwclass
  @static
  @example
class Demo extends wwjs.wwclass {
  //@wwjs.wwclass.readonly //jsdoc当前版本无法输出es7 decorators,请删除开始的注释.
  someReadonlyFuncOrProp() {
  }
}
  **/
  static readonly (target, key, descriptor) {
    descriptor.writable = false
    return descriptor
  }

  /**
  <strong><font color="red">decorator</font></strong>:为方法/类定义依赖，这些依赖被resolve之后，才会调用原函数，并返回Promise,解析为原函数返回值。每条依赖路径的语法与[wwimport](global.html#wwimport)相同。
  如果对类进行修饰，那么进入构造函数时,类的依赖资源已经加载完毕。注意：此时如果自行new ClsName，那么得到的是一个Promise对象。加载没有使用模块机制(AMD,CMD,CommonJS之类)，需要被加载资源自行处理通信机制．如果依赖资源已经加载就绪，调用有依赖的函数/类是同步方式，但是依然返回Promise．
  @function dep
  @memberof wwclass
  @static
  @param {array} urlArray 给定依赖库的数组，默认bundleName是urlArray中的每个元素的值．如果option中给定`bundle:false`，可以提前使用loadjs来定义bundlename,然后构造基于bundleName的urlArray.
  @param {function|string|object} [errhandler=null] 当任意依赖加载失败时，错误处理方法，由于错误时，类可能尚未创建，本方法必须是闭包全局定义的一个方法。也可以是一个object,此时可以给出如下值:
  - err : function|string 错误回调．
  - bundle : boolean depArray中传递的是bundle还是path? 默认是false,传递的是url．此时bundle与url相同．
  @example
//@wwjs.wwclass.dep(['@/moduleName1/Verson/XXXX.js']) //jsdoc当前版本无法输出es7 decorators,请删除开始的注释.
class Demo extends wwjs.wwclass {
  //@wwjs.wwclass.dep(['/moduleName2/Verson/XXXX.js']) //jsdoc当前版本无法输出es7 decorators,请删除开始的注释.
  someDepFunc(...[moduleName]) {
  }
}
  **/
  static dep (urlArray, errhandler) {
    return wrap(function (method, args, key, type, Target) {
      let self = this
      // console.log('enter wrap function....type=', type, 'urlArray=', urlArray, 'Target=', Target)
      return new Promise(function (resolve, reject) {
        loadjs.load(urlArray, {
          'success': () => {
            resolve(method.apply(self, args))
          },
          error: function (errFiles) {
            // console.log('load failed:', errFiles)
            let errFunc = errhandler
            if (typeof (errhandler) !== 'function') {
              errFunc = Target[errhandler]
            }
            if (typeof (errFunc) === 'function') {
              errFunc.call(self, errFiles)
            }
            if (cfg.debug) {
              // console.log(Target)
              console.error(`无法加载元素类${type === 'class' ? key : getFnName(Target) + '::' + key}的依赖文件“${errFiles}”`)
            }
            EE.emit('error', 'elem.depfailed', errFiles)
            reject(errFiles)
          }
        })
      })
    })
  }

  /**
  注册一个wwclass。
  @function reg
  @memberof wwclass
  @static
  @param {string} name 给出className,如果未给出，与clsdef的名称相同。
  @param {class} clsdef 给出一个从wwclass派生的类，如果相同名称，简单覆盖，wwjs不支持多版本元素类共存，在发现多版本请求时，会给出警告。
  @return {boolean} 如果注册成功，返回true。如果同名clsdef已经存在，返回false，需要调用unreg，然后再注册。
  **/
  static reg (name, clsdef) {
    if (typeof (clsdef) !== 'function' || typeof (name) !== 'string') {
      return false
    }
    wwclsMap[name] = clsdef
    EE.emit('wwclass.reg', name, clsdef)
    return true
  }

  /**
  注销一个元素类。注销之后，无法新建，但是已经新建并绑定的元素类的销毁，取决于元素类是否支持`watch`绑定。
  @function unreg
  @memberof wwclass
  @static
  @param {string} name 给出注册的clsdef的名称。
  @return {boolean} 如果已经注册，返回其类对象，否则返回null.
  **/
  static unreg (name) {
    return (wwclsMap[name]) ? (delete wwclsMap[name], true) : false
  }

  /**
  获取一个元素类，如果没有，则加载并注册。如果给出了url,则从url处开始加载，而不是默认的内部规则。name的格式为`NAME[@Version]`.默认的URL规则是`@/@wwclass/${NAME}/${Version||'latest'}/index.min.js`
  @function get
  @memberof wwclass
  @static
  @param {string} name 给出需要加载的元素类的名称。
  @param {string} [url] 可选的，给出其加载的url地址。元素上通过属性`[data-classurl]`来指定．
  @param {number} [delay] 可选的，给出毫秒为单位的延迟加载时间。在延迟时间内，如果有元素注册在这个名称下，则立即返回。延时到达，尚未有元素注册，则开始加载。元素上通过属性`[data-delay-load]`来指定．
  @return {Promise<function>} 返回元素类对象。如果发生错误，则reject。
  **/
  static get (name, url, delay) {
    const nameParts = name.split('@')
    const version = nameParts[1] || false
    const loadEle = (resolve, reject, name) => {
      // const bundleName = `_wwcls_${name}@${version || ''}`
      loadjs.load(url, {
        /* eslint-disable-next-line */
        bundleTpl: '_wwcls_${name}',
        'success': function () {
          // 执行到这里，wwclsMap[name]的值应该已经被插件改变．
          // console.log(1)
          let item = wwclsMap[name]
          if (item instanceof Promise) {
            let regHandler = (clsName, clsdef) => {
              if (clsName === name) {
                EE.off('wwclass.reg', regHandler)
                resolve(clsdef)
              }
            }
            EE.on('wwclass.reg', regHandler)
            // @TODO: 这里需要设置一个超时，例如5秒，然后发出get失败的事件。
          } else {
            // loadjs.done(bundleName)
            resolve(item)
          }
        },
        'error': function (errFiles) {
          // console.log(2)
          wwclass.unreg(name)
          if (cfg.debug) {
            console.error(`元素类${name}从${errFiles}加载失败。`)
          }
          EE.emit('error', 'wwclass.get', errFiles)
          reject(errFiles)
        }
      })
    }
    name = nameParts[0]
    // console.log('wwclsMap[name]=', wwclsMap[name])
    if (!wwclsMap[name]) {
      if (!url) {
        url = `@/@wwclass/${name}/${version || 'latest'}/${name}.min.js`
      }
      wwclsMap[name] = new Promise((resolve, reject) => {
        if (!isNaN(delay) && delay > 0) {
          let regHandler = (clsName, clsdef) => {
            if (clsName === name) {
              clearTimeout(timeOutHandler)
              EE.off('wwclass.reg', regHandler)
              loadEle(resolve, reject, name)
            }
          }
          let timeOutHandler = setTimeout(() => {
            EE.off('wwclass.reg', regHandler)
            loadEle(resolve, reject, name)
          }, delay)
          EE.on('wwclass.reg', regHandler)
        } else {
          loadEle(resolve, reject, name)
        }
      })
    } else if (version && !(wwclsMap[name] instanceof Promise) && (version !== wwclsMap[name].version)) { // 请求了指定版本．从缓冲中获取．
      EE.emit('warn', 'elems.verMismatch', name, version, wwclsMap[name].version)
    }
    return wwclsMap[name]
  }

  /** 从一个Dom元素获取其对应的instance.
  @function getInstance
  @memberof wwclass
  @static
  @param {Element} ele 给出一个DOM元素对象，返回其绑定的元素实例。
  @return {null|object} 如果DOM元素有对应的扩展元素实例，则返回此实例，否则返回空。
  **/
  static getInstance (ele) {
    return getE2Iwmap().get(ele)
  }

  /**
  调用DOM元素绑定实例的一个方法。与Function对象的[apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)方法一致，只不过第一个参数为DOM元素。
  @function applyMethod
  @memberof wwclass
  @static
  @param {Element} ele 需要调用的DOM元素对象。
  @param {string} name 需要调用的函数名。
  @param {Array} [params=[]] 参数数组
  @return {object} 返回一个对象,{suc:true|false,result: any}
  **/
  static applyMethod (ele, name, params) {
    const inst = wwclass.getInstance(ele)
    let ret = { suc: false, result: null }
    if (typeof inst === 'object' && typeof inst.name === 'function') {
      ret.result = inst.name.apply(inst, params || [])
      ret.suc = true
    }
    return ret
  }

  /**
  调用DOM元素绑定实例的一个方法。与Function对象的[call](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)方法一致，只不过第一个参数为DOM元素。
  @function callMethod
  @memberof wwclass
  @static
  @param {Element} ele 需要调用的DOM元素对象。
  @param {string} name 需要调用的函数名。
  @param {...any} [varArgs] 任意多的其它参数。
  @return {object} 返回一个对象,{suc:true|false,result: any}
  **/
  static callMethod (ele, name, varArgs) {
    let params = []
    if (arguments.length > 2) {
      params = Array.prototype.slice.call(arguments, 2)
    }
    return wwclass.apply(ele, name, params)
  }

  /**
  构造函数,需要传入本类需要绑定的元素对象。基类实现提供了`this.$ele`以及在$ele元素上添加`_wwinst` data。派生类应该在构造函数中通过`super(ele)`来调用。
  @member constructor
  @access private
  @param {Element} ele 本实例需要绑定的Dom元素．
  @inner
  @memberof wwclass
  **/
  constructor (ele) {
    // console.log('in constructor:', arguments, 'ele=', ele)
    let self = this
    if (cfg.debug && !(ele instanceof Element)) {
      console.error('wwclass基类构造函数中，未传入有效的DOM元素对象，派生类忘记调用＂super($ele)？＂')
      EE.emit('error', 'wwclass.badparameter', self)
    }
    self.$ele = $(ele)
    self.props = {}
    /**
    render模板渲染属性，利用[HyperHTML](https://github.com/WebReflection/hyperHTML/blob/master/index.js)，可以直接调用```this.render`ES6 Template String` ```，通常在`doRender`函数中使用．这样引发的更新是增量更新．
    @member render
    @access private
    @memberof wwclass
    **/
    Object.defineProperty(self, 'render', {
      get () { // [HyperHTML的实现](https://github.com/WebReflection/hyperHTML/blob/master/index.js)，非常轻量，每次直接调用无问题,无需利用一个变量缓冲．
        // console.log('123123')
        if (!self._renderInst) {
          // console.log('aaaa')
          self._renderInst = self.$ele ? hyper.bind(self.$ele[0]) : Function.dummy
        }
        return self._renderInst
      },
      enumerable: false
    })
    getE2Iwmap().set(ele, self)
  }

  /**
  请求一次绘制，这会内部调用requestAnimationFrame，并确保一个绘制周期只实际发生一次`doRender`调用．请求一次，只会调用一次doRender．如果期望多次调用，需要再次请求．派生类可以定义`onRequestRender`函数，在每次请求时都得到调用．如果不定义doRender方法，不会得到`onRequestRender`调用.

  - 对于有绘制的元素，推荐做法是，使用`watch`在影响渲染的属性变动时，自动调用doRender,派生类实现doRender,然后调用`this.render(...)`来定义渲染模板，复杂模板可以利用`wwjs.hyper.wire()`来分解．
  - 对于无绘制的元素，不要定义`doRender`方法,则所有的绘制机制不再工作．
  @function requestRender
  @memberof wwclass
  @instance
  @return {undefined}
  **/
  requestRender () {
    if (typeof (this.doRender) === 'function') {
      if (!this._rid) {
        this._rid = requestAnimationFrame(frameProc.bind(this))
      }
      if (typeof (this.onRequestRender) === 'function') {
        this.onRequestRender()
      }
    }
  }
}

export default { wwclass, rm }
