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
// Created At : 2018-11-13T06:35:34.007Z by masol (masol.li@gmail.com)

'use strict'

import EE from '../utils/evt'
import kosetup from '../ko'
import cfg from '../utils/cfg'
import UI from '../utils/ui'
import scriptChecker from './script'
import action from './action'
import wwclass from '../elems'
import state from '../utils/state'

/**
chk模块提供了在html代码插入时，检查插入的Node,并加以处理的能力。这一检查是在Node第一次被绘制时调用的(requestAnimationFrame)，因此，需要自行处理好平滑过程。这是一个内部模块，外部无法调用到。
@module chk
*/

let containerObserver
let evtRaf = {}
function frameProc (evtName/*, timeStamp */) {
  // console.log('enter frameProc:', arguments)
  let raf = evtRaf[evtName]
  evtRaf[evtName] = undefined
  if (raf.id) {
    cancelAnimationFrame(raf.id)
  }
  EE.emit(evtName, raf.nl)
  // console.log('in framePro', evtName, raf)
}

function rafProc (nodelist, evtName) {
  let oldRaf = evtRaf[evtName]
  // console.log('oldRaf=', oldRaf)
  if (typeof oldRaf === 'object') {
    oldRaf.nl = Array.prototype.concat.call(oldRaf.nl, nodelist)
    // 不清理oldRaf的回调调度，否则会引发连续节点加入阶段，处理得不到调用。
    // if (oldRaf.id) {
    //   cancelAnimationFrame(oldRaf.id)
    // }
  } else {
    oldRaf = {
      nl: nodelist
    }
    evtRaf[evtName] = oldRaf
    oldRaf.id = requestAnimationFrame(frameProc.bind(null, evtName))
  }
}

/**
本函数首先初始化内建的chker,依次调用下列checker模块的setup:
- ko
- view
- module

然后，本函数安装MutationObserve(如果有wwrootContainer则选择，否则选择body)，过滤元素类型(Nodetype===1)并转发如下消息:<font color="red">如果没有额外需求，应该响应"nodeAdd"及"nodeRm"事件，大多数涉及元素的场合都是不绘制不影响</font>
- 在节点被加入时，调用EE.emit("nodeBeforeAdd",NodeList) : 收到事件立即发出
- 在节点被加入时，并且延迟到下一次被绘制时(通过requestAnimationFrame),调用EE.emit("nodeAdd",NodeList)
- 在节点被移除时，调用EE.emit("nodeBeforeRm",NodeList)
- 在节点被移除时，并且延迟到第一次被绘制时(通过requestAnimationFrame),调用EE.emit("nodeRm",NodeList)

最后，由于本函数在Dom Ready之后调用，将容器对象作为第一个加入事件的参数，发送一个伪造的元素加入事件(nodeBeforeAdd以及nodeAdd)。
@exports chk
@access private
@method setup
@return {undefined}
*/
function setup () {
  kosetup()
  action.setupDefault()
  EE.on('nodeBeforeAdd', scriptChecker)
  EE.on('nodeAdd', action.check)
  EE.on('nodeAdd', wwclass.check)
  EE.on('nodeAdd', kosetup.check)

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver
  if (!MutationObserver) {
    if (cfg.debg) {
      console.error('无法创建MutationObserver，polyfill没有生效？')
    }
    return
  }

  function acceptNode (element) {
    return element.nodeType === 1
  }

  function check (mutations) {
    let rmNodes = []
    let addNodes = []
    mutations.forEach(function (mutation) {
      if (mutation.removedNodes && mutation.removedNodes.length > 0) {
        rmNodes = rmNodes.concat(Array.prototype.filter.call(mutation.removedNodes, acceptNode))
      }
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        addNodes = addNodes.concat(Array.prototype.filter.call(mutation.addedNodes, acceptNode))
        // console.log(mutation.addedNodes);
      }
      // console.log(mutation);
    })
    if (rmNodes.length > 0) {
      // console.log('in check,rmNodes=', rmNodes)
      EE.emit('nodeBeforeRm', rmNodes)
      rafProc(rmNodes, 'nodeRm')
    }
    if (addNodes.length > 0) {
      // console.log('in check,addNodes=', addNodes)
      EE.emit('nodeBeforeAdd', addNodes)
      rafProc(addNodes, 'nodeAdd')
    }
  }

  let $container = UI.$container()
  // console.log($container)
  if ($container.length > 0) {
    containerObserver = new MutationObserver(check)
    var config = {
      childList: true,
      attributes: false,
      attributeOldValue: false,
      subtree: true,
      characterData: false,
      characterDataOldValue: false
    }
    containerObserver.observe($container[0], config)
    // 如果没有任意特殊元素，为了发出state:loaded事件，这里需要push/pop伪造元素。
    state.push($container)
    // 发出第一次的元素加入事件。
    EE.emit('nodeBeforeAdd', [$container[0]])
    // 伪造事件不需要等待下一次绘制(RequestAnimationFrame)
    EE.emit('nodeAdd', [$container[0]])
    // rafProc([$container[0]], 'nodeAdd')
    EE.nodeAdded = true
    state.pop($container)
  } else {
    if (cfg.debug) {
      console.error('没有获取到有效的$container节点，无法构建Mutation监听')
    }
    EE.emit('error', 'chk.nocontainer')
  }

  // document.getElementById('PreLoaderBar').style.display = 'none'
}

/**
chk模块支持的**部分**检查函数，内部预处理时会使用到。所有预处理函数，返回其处理的元素数量。
 * @member chk
 * @constant
 * @type {object}
 * @name checkers
**/
setup.checkers = {
  // 'ns': kosetup.checkers.ns,
  // 'vm': kosetup.checkers.vm,
  'script': scriptChecker
}
// console.log('setup.checkers=', setup.checkers)

export default setup
