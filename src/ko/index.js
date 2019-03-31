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
// Created At : 2018-11-08T16:53:47.078Z by masol (masol.li@gmail.com)

'use strict'

/**
ko模块利用[knockoutjs](https://knockoutjs.com/)来分离元素及数据逻辑。
@module ko
*/

import ko from 'knockout'
import mapping from './mapping'
import EE from '../utils/evt'
import VM from './viewmodel'
import ns from './ns'
import attr from './attr'
import state from '../utils/state'

ko.mapping = mapping
// @see https://knockoutjs.com/documentation/deferred-updates.html
ko.options.deferUpdates = true

// 代码中描述的属性，但是不工作。
// ko.options.deferEvaluation = true

// @see https://knockoutjs.com/documentation/binding-preprocessing.html 但是按照文档，下方代码不工作。
// console.log('ko.bindingHandlers.text.preprocess=', ko.bindingHandlers.text.preprocess)
// ko.bindingHandlers.text.preprocess = function (stringFromMarkup) {
//   // Return stringFromMarkup if you don't want to change anything, or return
//   // some other string if you want Knockout to behave as if that was the
//   // syntax provided in the original HTML
//   return stringFromMarkup
// }
// console.log('ko.bindingProvider.instance.preprocessNode=', ko.bindingProvider.instance.preprocessNode)
// ko.bindingProvider.instance.preprocessNode = function (node) {
//   // Use DOM APIs such as setAttribute to modify 'node' if you wish.
//   // If you want to leave 'node' in the DOM, return null or have no 'return' statement.
//   // If you want to replace 'node' with some other set of nodes,
//   //    - Use DOM APIs such as insertChild to inject the new nodes
//   //      immediately before 'node'
//   //    - Use DOM APIs such as removeChild to remove 'node' if required
//   //    - Return an array of any new nodes that you've just inserted
//   //      so that Knockout can apply any bindings to them
//   console.log(123123)
//   console.log('ko.bindingProvider.instance.preprocessNode=', node)
// }

window.ko = ko

// console.log(attr)
attr()

/**
ko模块的初始化代码，在DomReady之后，由chk模块调用。负责建立事件监听，以监听新节点的插入，并处理新加入的节点。处理过程:
- 首先检查hash中是否有viewModel串(以#?开头的部分,当作queryString格式)，并使用其内容初始化viewModel,然后建立后续hash变化的相同检查。
- 在进行KO处理之前，对每个加入的节点，发出同步事件(koprepare)，如果事件有监听，则监听代码负责预处理节点，如下响应会被加载，以更新attr,更新viewmodel...
  - 检查data-ns,如果有，更新viewmodel,加入对象，并更新元素,加入with绑定。
  - 检查data-bindvar,如果有，使用data-bindvar属性对viewmodel做初始化更新。(符合namespace)
  - 检查script[type="text/bindvar"],将内容当作viewmodel做初始化更新。(符合namespace,并且可以有函数[computed observer]。[计算型](https://knockoutjs.com/documentation/computed-reference.html)数据的定义，可以通过create option来创建，也可以直接在bindvar脚本中创建，此时this为同级{同ns}viewModel，如果接受参数，则write属性设置，否则pure属性设置。默认都会设置deferEvaluation)
  - 检查script[type="text/wwjs"],执行之
- 对含有data-bind的元素,执行applyBindings
@exports ko
@access private
@method setup
@return undefined
*/
function setup () {
  VM.setup()
  // 构建事件监听，以保障事件响应顺序。
  EE.on('koprepare', ns.check)
  EE.on('koprepare', VM.check)
}

let depTasks = []
/**
ko可以从如下几个角度扩展:
- 增加新的[自定义绑定](https://knockoutjs.com/documentation/custom-bindings.html)。
- [extender](https://knockoutjs.com/documentation/extenders.html)扩展绑定变量的语义。
- [component](https://knockoutjs.com/documentation/component-binding.html#component-lifecycle)扩展。
以上几个层面的扩展都被wwjs所支持，为了确保绑定之前，绑定所依赖的资源已经被加载，通常我们在[wwjs script](module-chk_script.html)中来加载所需的依赖。并在加载代码中调用ko.dep(Promise)来让ko绑定动作延迟到Promise就绪。
@exports ko
@access public
@method dep
@param {Promise} [task=undefined] 指定需要加入ko依赖池的任务。
@return {array<Promise>} 返回任务依赖池。
*/
ko.dep = function (task) {
  if (task instanceof Promise) {
    depTasks.push(task)
  }
  return depTasks
}

/**
ko相关的检查及处理函数。按照如下顺序检查并处理:
- 如果depTask不为空，等待其信号。
- ns#check::检查是否有[data-ns]，如果有处理之。
- VM#check::检查是否有[data-bindvar]属性。
- VM#check::检查是否有[script[type="text/bindvar"]]节点，如果有，处理之。
- self::检查是否有[data-bind]节点，如果有，应用绑定。
@exports ko
@access private
@method check
@return undefined
*/
function check (nodeArray) {
  let procBind = (nodeArray) => {
    let i, item, $item
    // let Notifiers = EE.listeners('koprepare')
    // console.log('Notifiers=', Notifiers)
    for (i = 0; i < nodeArray.length; i++) {
      item = nodeArray[i]
      $item = $(item)
      // if (item.nodeType !== 1) { continue }  //不再需要，已经被chk实现。
      // 2019-3-30之后，不再需要，调用顺序已经被保障。
      EE.emit('koprepare', $item)
      // 为确保执行顺序，手动调用ns.check,而不是由ns.check注册事件。
      // ns.check($item)
      // for (j = 0; j < Notifiers.length; j++) {
      //   Notifiers[j]($item)
      // }
      // console.log(VM.get('', 'json'))
      if ($item.is('[data-bind]') || $item.find('[data-bind]').length > 0) {
      // console.log(VM, nodeArray[i])
        ko.applyBindings(VM.get(), nodeArray[i])
      }
    }
  }
  // console.log('nodeAdded:', nodeArray, 'ko.options=', ko.options)
  if (depTasks.length > 0) {
    state.push(nodeArray)
    return Promise.all(depTasks).then(() => {
      procBind(nodeArray)
      state.pop(nodeArray)
    }).catch((err) => {
      console.error(`无法处理KO绑定，因为其依赖处理失败:${err}`)
      EE.emit('ko.dep', err, depTasks)
      state.pop(nodeArray)
    })
  }
  return procBind(nodeArray)
}

setup.check = check

export default setup
