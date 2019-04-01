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
import net from '../net'

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
- 如果需要加入data-action，但是不期望执行默认处理，则需要加上属性`data-action-default=no|false`

### 3. 处理
data-action的处理，在wwjs之后，在wwclass检查之前。可以在action中立即响应随后的wwclass初始化事件，但是额外缺点是，wwclass动态修改data-action属性，将不会有效果。需要通过调用action模块的对应函数来处理。
@module chk/action
*/

function getDefaultTrigger ($ele) {
}

function mergeAction (action, key, actionArray) {
  if (!key) {
    return
  }
  let value = action[key] || []
  let cmdArray = []
  for (let i = 0; i < actionArray.length; i++) {
    let cmd = net.cmdline(actionArray[i])
    if (cmd) {
      cmdArray.push(cmd)
    }
  }
  action[key] = value.concat(cmdArray)
}

const ACTIONKEY = 'wwaction'
const ACTIONATTR = 'data-action'
/**
@exports action
@method cache
@desc 返回一个元素对应的action对象。action对象为一个pure object.其中key是事件名，value是一个数组，包含了可以直接调用net.run的params。
@param {jQueryElement} $ele 需要检查的元素。
@param {object|undefined} 返回元素对应的action对象，如果不存在，否则返回undefined。
*/
function cache ($ele) {
  let retAction = $ele.data(ACTIONKEY)
  if (typeof retAction !== 'object') {
    let action = {}
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
    if (!Object.isEmpty(action)) {
      $ele.data(ACTIONKEY, action)
      retAction = action
    }
  }
  return retAction
}

function procLink (event) {
}

function procSubmit (event) {
}

function applyHandler (event) {
  let $target = $(event.target)
  let action = cache($target)
  // let handled = false
  if (action) {
    let commands = action[event.type]
    if (Array.isArray(commands)) {
      for (let i = 0; i < commands.length; i++) {
        net.run(commands[i], $target.get(0))
        // handled = true
      }
    }
  }
  let defAction = $target.attr('data-action-default')
  if (defAction !== 'false' && defAction !== 'no') {
    if (event.target.tagName === 'A' && event.type === 'click') {
      procLink.apply(this, arguments)
    } else if (event.target.tagName === 'FORM' && event.type === 'submit') {
      procSubmit.apply(this, arguments)
    }
  }
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

/**
@param {string} cmd 需要执行的命令:
- append
- replace
- remove
@example $('a').wwaction('append',{'click','switchPage'})
*/
(function ($) {
  $.fn.wwaction = function (cmd, param) {
    return this.each(function () {
      var $item = $(this)
      let action = $item.data(ACTIONKEY) || {}
      let store = false
      if (typeof param === 'object') {
        for (let key in param) {
          switch (cmd) {
            case 'append':
            case 'replace':
              let value = param[key]
              let pushValue = []
              if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                  pushValue.push((typeof value[i] === 'string') ? net.cmdline(value[i]) : value[i])
                }
              }
              if (pushValue.length > 0) {
                if (cmd === 'append') {
                  let preValue = action[key] || []
                  action[key] = preValue.concat(pushValue)
                } else {
                  action[key] = pushValue
                }
                store = true
              }
              break
            case 'remove':
              delete action[key]
              store = true
              break
          }
        }
      }
      if (store) {
        if (Object.isEmpty(action)) {
          $item.removeData(ACTIONKEY)
        } else {
          $item.data(ACTIONKEY, action)
        }
      }
    })
  }
}(window.jQuery))

export default {
  attr: ACTIONATTR,
  check: check,
  setupDefault: setupDefault,
  cache: cache
}
