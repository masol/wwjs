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

console.log('KO', kosetup)

/**
chk模块提供了在html代码插入时，检查插入的Node,并加以处理的能力。这一检查是在Node第一次被绘制时调用的(requestAnimationFrame)，因此，需要自行处理好平滑过程。
@module chk
*/

let containerObserver
let evtRaf = {}
function frameProc (evtName/*, timeStamp */) {
  // console.log('enter frameProc:', arguments)
  let raf = evtRaf[evtName]
  evtRaf[evtName] = undefined
  EE.emit(evtName, raf.nl)
  // console.log('in framePro', evtName, raf)
}

function rafProc (nodelist, evtName) {
  let oldRaf = evtRaf[evtName]
  // console.log('oldRaf=', oldRaf)
  if (typeof oldRaf === 'object') {
    oldRaf.nl = Array.prototype.concat.call(oldRaf.nl, nodelist)
    if (oldRaf.id) {
      cancelAnimationFrame(oldRaf.id)
    }
  } else {
    oldRaf = {
      nl: nodelist
    }
    evtRaf[evtName] = oldRaf
  }
  oldRaf.id = requestAnimationFrame(frameProc.bind({}, evtName))
}

/**
本函数首先初始化内建的chker,依次调用下列模块的setup:
- ko
- view
- module

然后，本函数安装MutationObserve(如果有wwrootContainer则选择，否则选择body)，并将事件处理为:
- 在节点被加入时，调用EE.emit("nodeBeforeAdd",NodeList) : 收到事件立即发出
- 在节点被加入时，并且延迟到第一次被绘制时调用的(requestAnimationFrame),调用EE.emit("nodeAdd",NodeList)
- 在节点被移除时，调用EE.emit("nodeBeforeRm",NodeList)
- 在节点被移除时，并且延迟到第一次被绘制时调用的(requestAnimationFrame),调用EE.emit("nodeRm",NodeList)

最后，由于本函数在Dom Ready之后调用，将容器对象作为第一个事件发送出去。
@exports chk
@access private
@method setup
@return {promise|undefined} 如果安装工作可以同步完成，返回undefined,否则返回一个promise(需要异步加载chker的情况),其被解析时意味着安装工作结束。
*/
function setup () {
  kosetup()

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver
  if (!MutationObserver) {
    if (cfg.debg) {
      console.error('无法创建MutationObserver，polyfill没有生效？')
    }
    return
  }

  function check (mutations) {
    let rmNodes = []
    let addNodes = []
    mutations.forEach(function (mutation) {
      if (mutation.removedNodes && mutation.removedNodes.length > 0) {
        rmNodes = rmNodes.concat(Array.prototype.slice.call(mutation.removedNodes, 0))
      }
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        addNodes = addNodes.concat(Array.prototype.slice.call(mutation.addedNodes, 0))
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

  var $container = $('body div.container,body div.container-fluid').first()
  if ($container.length === 0) {
    $container = $('body')
  }
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
    // 发出第一次的元素加入事件。
    EE.emit('nodeBeforeAdd', [$container[0]])
    rafProc([$container[0]], 'nodeAdd')
  }

  // document.getElementById('PreLoaderBar').style.display = 'none'
}

export default setup
