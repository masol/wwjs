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

VM.reset()

/**
ko模块的初始化代码，在DomReady之后，由chk模块调用。负责建立事件监听，以监听新节点的插入，并处理新加入的节点。处理过程:
- 在进行KO处理之前，对每个加入的节点，发出同步事件(koprepare)，如果事件有监听，则监听代码负责预处理节点，如下响应会被加载，以更新attr,更新viewmodel...
  - 检查data-ns,如果有，更新viewmodel,加入对象，并更新元素,加入with绑定。
  - 检查data-bindvar,如果有，使用data-bindvar属性对viewmodel做初始化更新。(符合namespace)
  - 检查script[type="text/wwjs"],执行之
- 对含有data-bind的元素,执行applyBindings
@exports ko
@access private
@method setup
@return undefined
*/
function setup () {
  EE.on('nodeAdd', function (nodeArray) {
    // console.log('nodeAdded:', nodeArray, 'ko.options=', ko.options)
    let i, j, item, $item
    let Notifiers = EE.listeners('koprepare')
    // console.log('Notifiers=', Notifiers)
    for (i = 0; i < nodeArray.length; i++) {
      item = nodeArray[i]
      $item = $(item)
      // if (item.nodeType !== 1) { continue }  //不再需要，已经被chk实现。
      // 为确保执行顺序，首先调用ns.procElem
      ns.procElem($item)
      for (j = 0; j < Notifiers.length; j++) {
        Notifiers[j]($item)
      }
      // console.log(VM.get('', 'json'))
      if ($item.is('[data-bind]') || $item.find('[data-bind]').length > 0) {
      // console.log(VM, nodeArray[i])
        ko.applyBindings(VM.get(), nodeArray[i])
      }
    }
  })
}

export default setup
