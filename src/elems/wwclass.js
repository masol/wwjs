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
import cfg from '../utils/cfg'

// inspired by https://github.com/cmartin81/decorator-wrap/blob/master/src/wrap.js
// 增加特性，复制arg到数组，以允许wrapperMethod动态修改参数。
function wrap (wrapperMethod) {
  return (Target, key, descriptor) => {
    if (typeof (Target) === 'function') {
      let newTarget = function (...arg) {
        let self = this
        return (function () {
          let methodCallback = function () { return new Target(arg) }
          return wrapperMethod.call(self, methodCallback, arg, 'class', Target.name, Target)
        }())
      }
      return newTarget
    } else {
      let orgMethod = descriptor.value
      descriptor.value = function (...arg) {
        let args = Array.prototype.slice.call(arg, 0)
        let self = this
        return (function () {
          let methodCallback = function () { return orgMethod.apply(self, args) }
          return wrapperMethod.call(self, methodCallback, args, 'function', key, Target)
        }())
      }
      return descriptor
    }
  }
}

/** wwclass提供了wwjs内建元素的基类，通过扩展wwclass来定制元素。
@class wwclass
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
  @param {array} depArray 给定依赖库的数组
  @param {function|string} [errhandler=null] 当任意依赖加载失败时，错误处理方法，由于错误时，类可能尚未创建，本方法必须是闭包全局定义的一个方法。
  @example
//@wwjs.wwclass.dep(['@/moduleName1/Verson/XXXX.js']) //jsdoc当前版本无法输出es7 decorators,请删除开始的注释.
class Demo extends wwjs.wwclass {
  //@wwjs.wwclass.dep(['/moduleName2/Verson/XXXX.js']) //jsdoc当前版本无法输出es7 decorators,请删除开始的注释.
  someDepFunc(...[moduleName]) {
  }
}
  **/
  static dep (depArray, errhandler) {
    return wrap(function (method, args, type, key, Target) {
      let self = this
      console.log('enter wrap function....type=', type, 'depArray=', depArray, 'Target=', Target)
      if (type === 'class' && Target.prototype._deps) {
        return method.apply(self, args)
      }
      return window.System.import(depArray).then((mods) => {
        if (type === 'class') {
          Target.prototype._deps = mods
        } else {
          args.push(mods)
        }
        console.log('mods=', mods)
        return method.apply(self, args)
      }).catch((err) => {
        let errFunc = errhandler
        if (typeof (errhandler) === 'function') {
          errFunc = Target[errhandler]
        }
        if (typeof (errFunc) === 'function') {
          errFunc.call(self, err)
        } else {
          if (cfg.debug) {
            console.error(`元素依赖${key}加载失败:${err}`)
          }
          EE.emit('error', 'elem.depfailed', err)
        }
      })
    })
  }

  /**
  构造函数,需要传入本类需要绑定的元素对象。基类实现提供了`this.$ele`以及在$ele元素上添加`_wwinst` data。派生类应该通过`super(ele)`来调用。
  @function constructor
  @access private
  @inner
  @memberof wwclass
  **/
  constructor (ele) {
    console.log('in constructor:', arguments)
    let $ele = $(ele)
    this.$ele = $ele
    console.log('leave constructor 1', $ele)
    $ele.data('_wwinst', this)
    console.log('leave constructor', this._deps)
    console.log('leave constructor 2')
    // return lit.html`this is only a test`
  }

  /**
  析构函数,在对象删除时调用，基类实现负责清理`this.$ele`以及$ele元素上的`_wwinst` data。派生类中应该通过`super()`来调用
  @function finalize
  @access private
  @inner
  @memberof wwclass
  **/
  finalize () {
    this.$ele = undefined
    this.$ele.removeData('_wwinst')
  }
}

class Test extends wwclass {
  constructor (ele) {
    super(ele)
    console.log('enter test constructor:', this._deps)
  }
  @wwclass.dep(['@/bootstrap/4.1.3/js/bootstrap.bundle.min.js'], 'deperr')
  test () {
    console.log('intest:', arguments)
    return 1100
  }
  deperr (err) {
    console.log('enter deperr:', err)
  }
}

function test2 () {
  Array.prototype.push.call(arguments, 'd')
  let t2 = new Test($('<div>'))
  let t3 = t2.test()
  console.log('t3 immediate result=', t3)
  Promise.resolve(t3).then(result => { console.log('result=', result) })
  // console.log(arguments)
}

console.log(test2())

export default wwclass
