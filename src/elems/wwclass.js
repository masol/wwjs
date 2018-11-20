/// //////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
/// //////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-19T05:50:52.931Z by masol (masol.li@gmail.com)

'use strict'
import $ from 'jquery'
import loadjs from '../utils/loadjs'
import cfg from '../utils/cfg'

// 获取一个函数的名称。inspired from https://gist.github.com/dfkaye/6384439
function getFnName (fn) {
  // console.log(typeof fn)
  let s = (fn.constructor ? fn.constructor.name : fn.name)
  if (s) return s
  s = fn.toString().match(/function ([^(]+)/)
  if (s && s.length > 1) { return s[1] }
  return 'anonymous'
}

let wwclsMap = {}

// inspired by https://github.com/cmartin81/decorator-wrap/blob/master/src/wrap.js
// 增加特性，复制arg到数组，以允许wrapperMethod动态修改参数。
function wrap (wrapperMethod) {
  return (Target, key, descriptor) => {
    if (typeof (Target) === 'function') {
      let newTarget = function (...arg) {
        // let args = Array.prototype.slice.call(arg, 0)
        let self = this
        return (function () {
          let methodCallback = function () {
            // const ArgsTarget = Function.bind.apply(Target, args)
            // return new ArgsTarget()
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

/**
@class wwclass
@classdesc wwclass提供了wwjs元素类的基类，通过扩展wwclass来开发元素。这些元素不依赖[Shadow DOM](https://caniuse.com/#search=Shadow%20DOM%20v0)、[Custom Elements](https://caniuse.com/#search=Custom%20Elements)等当前支持不普遍的特性，而是利用普遍支持的[Mutation Observer](https://caniuse.com/#search=Mutation%20Observer)，结合模板库(当前选择[hyperHTML](https://github.com/WebReflection/hyperHTML))，局部css并不依赖被废弃的[Scoped CSS](https://caniuse.com/#search=Scoped%20CSS)或ShadowDom，而是利用PostCSS或[scope-css](https://github.com/dy/scope-css#readme)自动为元素css添加`[data-wwclass=XXX]`的前缀选择器。

wwjs元素处于三种状态:
- 初始状态:此时元素类尚未加载，元素以自己的原始定义被浏览器绘制。
- 元素类就绪:元素类及其依赖已被加载，元素类开始根据上下文重新调整元素外观，这里最重要的就是<font color='red'>平滑处理</font>，也就是从初始状态变化到元素类就绪状态，页面不应该闪烁。
- 数据就绪:需要的真实数据是由ko从各个数据源同步到元素上的，这可能发生在元素类就绪状态之前或之后，对元素类开发人员来说，这个状态大多数时候都可以忽略。而View开发者不关注元素类就绪状态，但是关注数据就绪的平滑处理。

wwclass类提供了如下修饰符(派生类不可见):
- [@wwjs.wwclass.dep](#.dep)
- [@wwjs.wwclass.readonly](#.readonly)
- [@wwjs.wwclass.watch](#.watch)

以及如下静态方法(派生类不可见):
- [wwjs.wwclass.get](#.get)
- [wwjs.wwclass.reg](#.reg)
- [wwjs.wwclass.unreg](#.reg)

@hideconstructor
**/
class wwclass {
  /**
  <strong><font color="red">decorator</font></strong>:修饰方法，为方法添加对指定属性的变化监听.
  @function watch
  @memberof wwclass
  @param {string} attr 要监听的属性名.
  @param {object} [options={immediate:false}] 要监听的属性名.
  @static
  @example
class Demo extends wwjs.wwclass {
  //@wwjs.wwclass.watch("data-test",{immediate:true}) //jsdoc当前版本无法输出es7 decorators,请删除开始的注释.
  propChangeCallback(propname,newValue,oldValue) {
  }
}
  **/
  static watch (attr, options) {
    console.log(arguments)
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
  <strong><font color="red">decorator</font></strong>:为方法/类定义依赖，这些依赖被resolve之后，会以数组的形式添加到最后一个参数。每条依赖路径的语法与[wwimport](global.html#wwimport)相同。
  如果对类进行修饰，那么进入构造函数时,类的`_deps`原型属性已经就绪，保存了import的内容。注意：此时如果自行new ClsName，那么得到的是一个Promise对象。
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
        let resolveURLArray = loadjs.resolve(urlArray)
        let i
        if (!$.isArray(urlArray)) {
          urlArray = [urlArray]
        }
        for (i = 0; i < urlArray.length; i++) {
          if (!loadjs.isDefined(urlArray[i])) {
            loadjs(resolveURLArray[i], urlArray[i])
          }
        }
        loadjs.ready(urlArray, {
          success: function () {
            // console.log('load ok')
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
  @param {class} clsdef 给出一个从wwclass派生的类，注册进入wwclass处理链条.
  @param {string} [name] 给出className,如果未给出，与clsdef的名称相同。
  @return {boolean} 如果注册成功，返回true。如果同名clsdef已经存在，返回false，需要调用unreg，然后再注册。
  **/
  static reg (clsdef, name) {
    if (typeof (clsdef) !== 'function') {
      return false
    }
    name = name || getFnName(clsdef)
    if (!wwclsMap[name]) {
      wwclsMap[name] = clsdef
      return true
    }
    return false
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
  获取一个元素类，如果没有，则加载并注册。如果给出了url,则从url处开始加载，而不是默认的内部规则。
  @function get
  @memberof wwclass
  @static
  @param {string} name 给出需要加载的元素类的名称。
  @param {string} [url] 可选的，给出其加载的url地址。
  @return {Promise<function>} 返回元素类对象。如果发生错误，则reject。
  **/
  static get (name, url) {
    if (!wwclsMap[name]) {
      if (!url) {
        const nameParts = name.split('@')
        let version = 'latest'
        if (nameParts.length === 2) {
          version = nameParts[1]
        }
        url = `@/@wwclass/${nameParts[0]}/${version}/index.min.js`
      }
      wwclsMap[name] = new Promise((resolve, reject) => {
        const bundleName = `_wwcls_${name}`
        if (!loadjs.isDefined(bundleName)) {
          loadjs(loadjs.resolve(url), bundleName)
        }
        loadjs.ready(bundleName, {
          'success': function (mod) {
            wwclass.reg(name, mod)
            loadjs.done(bundleName)
            resolve(mod)
          },
          before: (path, scriptEl) => {
            scriptEl.crossOrigin = true
          },
          'error': function (errFiles) {
            wwclass.unreg(name)
            if (cfg.debug) {
              console.error(`元素类${name}从${errFiles}加载失败。`)
            }
            EE.emit('error', 'wwclass.get', errFiles)
            reject(errFiles)
          }
        })
      })
    }
    return wwclsMap[name]
  }

  /**
  构造函数,需要传入本类需要绑定的元素对象。基类实现提供了`this.$ele`以及在$ele元素上添加`_wwinst` data。派生类应该通过`super(ele)`来调用。
  @function constructor
  @access private
  @inner
  @memberof wwclass
  **/
  constructor (ele) {
    // console.log('in constructor:', arguments)
    this.$ele = $(ele)
    // console.log('leave constructor 1', $ele)
    // console.log('leave constructor', this._deps)
    // console.log('leave constructor 2')
    // return hyper.wire`this is only a test`
  }

  /**
  析构函数,在对象删除时调用，基类实现负责清理`this.$ele`。派生类中不应该重载此函数，而是应该定义`finalize`函数来响应结束事件。
  @function _finalize
  @access private
  @inner
  @memberof wwclass
  **/
  _finalize () {
    this.$ele = undefined
  }
}

// class Test extends wwclass {
//   constructor (ele) {
//     super(ele)
//     console.log('enter test constructor:', this._deps)
//   }
//   @wwclass.dep(['@/bootstrap/4.1.3/js/bootstrap.bundle.min.js'], 'deperr')
//   test () {
//     console.log('intest:', arguments)
//     return 1100
//   }
//   deperr (err) {
//     console.log('enter deperr:', err)
//   }
// }
//
// function test2 () {
//   Array.prototype.push.call(arguments, 'd')
//   let t2 = new Test($('<div>'))
//   let t3 = t2.test()
//   console.log('t3 immediate result=', t3)
//   Promise.resolve(t3).then(result => { console.log('result=', result) })
//   // console.log(arguments)
// }
//
// console.log(test2())

export default wwclass
