/// ///////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
/// ///////////////////////////////////////////////////////////////////////////
// Created At : 2019-03-31T08:08:01.544Z by lizhutang (lizhutang@spolo.org)

'use strict'

import EE from './evt'

/**
@class State
@classdesc State类提供了维护了状态信息的基类。并且全局新建了一个维护页面状态的实例。维护了如下状态：
1. 当前页面有效的存储空间——配合伪单页结构，这里的内容在页面刷新后刷新。
2. 当前页面的加载状态——还有多少个依赖项正在加载中，并且可以遍历这些依赖项。
 - 当所有元素加载完毕之后，发出'state:loaded'事件，跟随一个参数，指示这是第几次事件。
 - 在第一个加载请求发出时，发出'state:loading'事件，跟随一个参数，指示这是第几次事件。

@hideconstructor
**/
class State {
  constructor () {
    this.pgCount = 0
    this.store = {}
    this.reset()
  }
  /**
  重置页面状态，这在伪单页模式下，切换页面时，重置页面的状态。
  @function reset
  @memberof State
  @instance
  @return {undefined}
  **/
  reset () {
    this.pgCount++
    this.cLodevt = 0
    // 由于loadSize为0时，由于延迟了一帧发出loaded事件，lodflag指示的是事件含义上，是否处于加载状态.有可能出现loadSize为0，但是loaded事件尚未发出，因此lodflag为true的时刻。
    this.lodflag = false
    this.pageStore = {}
    this.loadmap = (this.loadmap && Function.isFunction(this.loadmap.clear)) ? this.loadmap.clear() : new WeakMap()
    this.loadSize = 0
    if (this.rafID) {
      cancelAnimationFrame(this.rafID)
      this.rafID = undefined
    }
  }
  /**
  当一个元素需要外部依赖时，通知状态维护器更新加载状态。
  @function push
  @memberof State
  @param {object} ele 需要外部依赖的元素对象，这是一个弱引用，不会阻止GC。
  @return {undefined}
  **/
  push (ele) {
    if (this.loadSize === 0 && !this.lodflag) {
      this.lodflag = true
      EE.emit('state:loading', this.cLodevt)
      // console.log('state:loading:', this.cLodevt)
    }
    this.loadmap.set(ele, this.pgCount)
    this.loadSize++
  }
  delayLoaded () {
    if (this.loadSize === 0) {
      this.rafID = undefined
      this.lodflag = false
      // console.log('state:loaded:', this.cLodevt)
      EE.emit('state:loaded', this.cLodevt++)
    }
  }
  /**
  检查当前是否有依赖被加载中——注意这些依赖可能已经加载到内存中了。
  @function loadNum
  @memberof State
  @return {Number} 返回当前正在做依赖处理的元素数量，0表示没有依赖加载中。
  **/
  loadNum () {
    return this.loadSize
  }

  /**
  当一个元素的外部依赖加载完毕时，通知状态维护器更新加载状态。
  @function pop
  @memberof State
  @param {object} ele 需要外部依赖的元素对象，这是一个弱引用，不会阻止GC。
  @return {undefined}
  **/
  pop (ele) {
    if (this.loadmap.get(ele) === this.pgCount) {
      this.loadmap.delete(ele)
      this.loadSize--
      if (this.lodflag && this.loadSize === 0) {
        // 延迟一帧发出事件，以忽略同步加载引发的加载事件泛滥。
        if (this.rafID) {
          cancelAnimationFrame(this.rafID)
        }
        this.rafID = requestAnimationFrame(this.delayLoaded.bind(this))
      }
    }
  }
}

let state = new State()

export default state
