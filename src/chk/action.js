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
// Created At : 2019-03-31T10:17:53.131Z by lizhutang (lizhutang@spolo.org)

'use strict'

import strUtils from '../utils/str'
import ui from '../utils/ui'
// import jQuery from 'jquery'

/**
### 1. 概念
action模块处理页面的`data-action`属性，并将action与command关联在一起。这个command通常引用了[net模块](module-net.html)所支持的远程命令。

data-action概念上是一个action mapping的数组。每个action mapping包含两个部分(do Command when Trigger):
 - trigger: 事件源，可以是任意有效的jQuery支持的事件。如果不存在，指示当前元素的默认事件。
 - command: bash格式的命令字符串，调用net模块中的run指令。注意，此时很多额外参数可以保存在元素上，这些额外属性是由具体的command实现者来定义的。如果不存在，指示当前元素的wwjs默认处理。
以上两个部分，如果只有一项，为command。

### 2.格式
格式语法借鉴了[stimulus](https://github.com/stimulusjs/stimulus)。

- trigger: ^\s*(evtName)(\s+evtName)*\s*$
 - 通过“\ ”来转义分割符，使得空格不再是一个分割符，目前的事件名不会需要。
- command: ^\s*(cmdString)(;cmdString)*$
 - 通过\;来转义分，使得分号不再是一个转义符。
- action maping: trigger->command
 - 通过\->来转义，使得“->”不再是一个分割符，而是传统的->。
- data-action: action mapping1(/s*);;action mapping1...
 - 通过\;;来转义，使得双分号不再分割一个action mapping。如果command中需要“;;”，需要录入“\;\;”而不是使用mapping分割“”。

常见特殊值说明,通常data-action的值可能是如下两种:
- 空,此时只是通知本元素需要做默认的事件响应和处理。
- 字符串，此时是针对当前元素的默认触发的命令字符串。

### 3. 处理
data-action的处理，在wwjs之后，在wwclass检查之前。可以在action中立即响应随后的wwclass初始化事件，但是额外缺点是，wwclass动态修改data-action属性，将不会有效果。需要通过调用action模块的对应函数来处理。
@module chk/action
*/

(function ($) {
  $.fn.wwaction = function (option) {
    return this.each(function () {
      var item = $(this)
      item.append(' (' + item.attr('href') + ')')
    })
  }
}(window.jQuery))

// Usage example:
// $('a').showLinkLocation()

function getDefaultTrigger ($ele) {

}

function mergeAction (action, key, actionArray) {
  if (!key) {
    return
  }
  let value = action[key] || []
  action[key] = value.concat(actionArray)
}

const ACTIONKEY = 'wwaction'
const ACTIONATTR = 'data-action'
function cache ($ele) {
  let action = $ele.data(ACTIONKEY)
  if (typeof action !== 'object') {
    action = {}
    let actArray = strUtils.split($ele.attr(ACTIONATTR), ';;', '\\')
    for (let i = 0; i < actArray.length; i++) {
      // 调整顺序为: command,trigger,selector
      let mapper = strUtils.split(actArray[i], '->', '\\')
      if (mapper.length === 1) {
        mergeAction(action, getDefaultTrigger($ele), strUtils.split(mapper[0], ';', '\\'))
      } else if (mapper.length >= 2) {
        let evtArray = strUtils.split(mapper[0], ' ', '\\')
        for (let j = 0; j < evtArray; j++) {
          let actArray = strUtils.split(mapper[1], ';', '\\')
          mergeAction(action, evtArray[j], actArray)
        }
        if (mapper.length > 2) {
          console.warn(`data-action字符串内容不合法:${actArray[i]}，忽略多余部分。`)
        }
      } else {
        console.warn(`data-action字符串内容不合法:${actArray[i]}，无法更新action。`)
      }
    }
    $ele.data(ACTIONKEY, action)
  }
  return action
}

// function procLink (event) {
// }
//
// function procSubmit (event) {
// }

function applyHandler () {
/** $target = $(this.eventTarget)
 let action = cache($ele)
 for(let i = 0; i < action.length; i++) {
   let mapper = action[i]
   if(!mapper[SELECTORIDX] || $target.is(mapper[SELECTORIDX])){
   //run command($target,mapper[COMMANDIDX])
   }
   if(event.isPreventDefault() || event.isStopProganation()){
     break
   }
 }
// */
}

let routeCache = {}
function ensureRoute (trigger) {
  if (!routeCache[trigger]) {
    routeCache[trigger] = 0
    let $container = ui.$container()
    $container.on(trigger, '[data-action]', applyHandler)
  }
  routeCache[trigger]++
}

// setup default action.
function setupDefault (reset) {
  if (reset) {
    // clear old default.
  }
  ensureRoute('click')
  ensureRoute('submit')
}

function setup () {
  // if (!(this instanceof Element)) {
  // }
  let $ele = $(this)
  let action = cache($ele)
  for (let trigger in action) {
    switch (trigger) {
      case 'click':
      case 'submit':
        // 忽略默认事件。
        break
      default:
        ensureRoute(trigger)
        break
    }
  }
}

function check (nodeArray) {
  const selector = '[data-action]'
  let i; let count = 0
  for (i = 0; i < nodeArray.length; i++) {
    let $item = $(nodeArray[i])
    if ($item.is(selector)) {
      setup.call($item[0])
      count++
    }
    let nsItems = $item.find(selector)
    if (nsItems.length > 0) {
      nsItems.each(setup)
      count++
    }
  }
  return count
}

export default {
  attr: ACTIONATTR,
  check: check,
  setupDefault: setupDefault,
  cache: cache
}
