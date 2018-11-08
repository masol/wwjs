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
// Created At : 2018-11-08T11:34:51.240Z by masol (masol.li@gmail.com)

'use strict'

/**
@module utils/promise
@desc 为window.Promise增加部分helper函数。ready之后，可以直接使用Promise.XXX来访问这些增加的方法。
*/

module.exports = (function initModule () {
  /**
  @exports utils/promise
  @method pipe
  @desc 将array中给定的值顺序执行，每个输出作为下一个函数的输入。
  @param {Array<any>} array  array必须是一个array|array like(需要reduce)的对象。如果值不是一个函数，则直接当作下一个的输入。
  @param {any} [initvar] 初始值，传给地一个promise函数的参数。
  @return {Promise} 最终解析为最后一个函数的返回值。
  */
  function pipe (array, initvar) {
    return Array.prototype.reduce.call(array, (result, task) => {
      return Promise.resolve(result).then((param) => {
        return (window.$.isFunction(task) ? task(param) : task)
      }).then(result => {
        return result
      })
    }, initvar)
  }

  /**
  @exports utils/promise
  @method whiledo
  @desc  根据条件不断重复action，类似同步的`while(predicate){action};`语句。
  @param {Function} predicate 判定条件，传入上次action的返回值(首次传入initval),函数可以返回promise<Boolean>或普通Boolean值。
  @param {Function} action 执行函数，传入上次action的返回值(首次传入initval),函数可以返回promise或普通值。
  @param {Any} [initval] 传入给第一次调用的初始值。
  @return {promise} 返回一个promise,解析为最后一次调用action的返回值。
  @see https://gist.github.com/victorquinn/8030190
  **/
  function whiledo (predicate, action, initval) {
    function loop (preret) {
      return Promise.resolve(predicate(preret)).then((cond) => {
        if (!cond) {
          return preret
        }
        return Promise.resolve(action(preret)).then(loop)
      })
    }
    return Promise.resolve(initval).then(loop)
  }

  /**
  @exports utils/promise
  @method delay
  @desc  延迟指定时间之后resolve一个值。这个值可以是任意值，如果是函数，则执行此函数，并返回结果
  @param {long} ms 延迟时间，以毫秒为单位
  @param {Any} [value] 指定时间后，解析的值。
  @return {promise} 返回一个promise,解析为value参数给定的值。
  **/
  function delay (ms, value) {
    return new Promise((resolve) => {
      setTimeout(() => {
        Promise.resolve(value).then((finalValue) => {
          if (window.$.isFunction(finalValue)) {
            resolve(finalValue())
          } else {
            resolve(finalValue)
          }
        })
      }, ms)
    })
  }

  window.Promise.pipe = pipe
  window.Promise.whiledo = whiledo
  window.Promise.delay = delay
}())
