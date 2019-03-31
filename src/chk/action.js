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

/**
### 1. 概念
action模块处理页面的`data-action`属性，并将action与command关联在一起。这个command通常引用了[net模块](module-net.html)所支持的远程命令。

data-action概念上是一个action mapping的数组。每个action mapping包含三个部分:
 - trigger: 事件源，可以是任意有效的jQuery支持的事件。如果不存在，指示当前元素的默认事件。
 - selector: 选择器，哪些元素发出的trigger事件会触发action。如果不存在，指示当前(有data-action属性的)元素。
 - command: bash格式的命令字符串，调用net模块中的run指令。注意，此时很多额外参数可以保存在元素上，这些额外属性是由具体的command实现者来定义的。如果不存在，指示当前元素的wwjs默认处理。
以上三个部分，如果只有一项，为command;如果有两项，则指明trigger+command。

### 2.格式
格式语法借鉴了[stimulus](https://github.com/stimulusjs/stimulus)。

- action maping: trigger(/s*)->(/s*)selector(/s*)->command(/s*)
 - 通过\->来转义，使得其不再是一个分割符，而是传统的->。
- data-action: action mapping1(/s*);action mapping1...
 - 通过\;来转义，使得分号不再分割一个action mapping.

常见特殊值说明,通常data-action的值可能是如下两种:
- 空,此时只是通知本元素需要做默认的事件响应和处理。
- 字符串，此时是针对当前元素的默认触发的命令字符串。

### 3. 处理
data-action的处理，在wwjs之后，在wwclass检查之前。可以在action中立即响应随后的wwclass初始化事件，但是额外缺点是，wwclass动态修改data-action属性，将不会有效果。需要通过调用action模块的对应函数来处理。
@module chk/action
*/

function check () {
}

function setup () {
}

function cache ($ele) {
  let action = $ele.data('wwaction')
  if (!action) {
    action = []
    let actArray = strUtils.split($ele.attr('data-action'), ';', '\\')
    for (let i = 0; i < actArray.length; i++) {
      action.push(strUtils.split(actArray[i], '->', '\\'))
    }
    $ele.data('wwaction', action)
  }
  return action
}

function route (ele) {
}

export default {
  check: check,
  setup: setup,
  cache: cache,
  route: route
}
