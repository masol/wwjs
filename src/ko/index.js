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
@module ko
@desc ko检查模块
*/

import ko from 'knockout'
import mapping from './mapping'
import EE from '../utils/evt'
import VM from './viewmodel'

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

EE.on('nodeAdd', function (nodeArray) {
  // console.log('nodeAdded:', nodeArray, 'ko.options=', ko.options)
  let i = nodeArray.length
  for (i = 0; i < nodeArray.length; i++) {
    let item = nodeArray[i]
    // if (item.nodeType !== 1) { continue }
    let $item = $(item)
    // console.log($item)
    if ($item.is('[data-bind]') || $item.find('[data-bind]').length > 0) {
      // console.log(VM, nodeArray[i])
      ko.applyBindings(VM, nodeArray[i])
    }
  }
})

/**
ko模块的初始化代码，负责建立事件监听，以监听新节点的插入，并处理新加入的节点。
@exports ko
@method setup
@return undefined
*/
function setup () {
}

export default setup
