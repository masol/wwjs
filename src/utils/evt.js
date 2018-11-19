// ////////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// ////////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-13T07:13:47.688Z by masol (masol.li@gmail.com)

'use strict'

import EventEmitter from 'eventemitter3'

const EE = new EventEmitter()
window.EE = EE

/**
事件中心模块提供了全局的内部事件中心，可以独立于Dom执行。

系统所有的错误机制，可以监听`调用EE.on("error",function(desc,exobj){})`的方式来拦截，提供了如下错误类型(事件响应代码的第一个参数):
- `script.wwjs` : wwjs类型的脚本执行错误。此时第２个参数是一个`Error`对象。
- `chk.nocontainer` : chk模块尝试获取container,但是失败了。此时第２个参数为undefined.
- `vm.typeerror` : 给vm某个变量设置值，但是其类型不同于原始值。此时第２个参数是`TypeError`实例。如果设置了自动转化，则本事件不会发出。参考[utils/cfg模块](module-utils_cfg.html)
- `bindvar` : 处理`data-bindvar`时发生了错误，错误对象是第二个参数，通常是`SyntaxError`对象。
- `elem.depfailed` : 元素dep依赖加载失败，错误对象是第二个参数。

还提供了如下事件:
- `nodeBeforeAdd` : 第一个参数是新加入的元素(只通知根元素).参考[chk模块](module-chk.html)
- `nodeAdd` : 第一个参数是新加入的元素(只通知根元素).参考[chk模块](module-chk.html)
- `nodeBeforeRm` : 第一个参数是删除的元素(只通知根元素).参考[chk模块](module-chk.html)
- `nodeRm` : 第一个参数是删除的元素(只通知根元素).参考[chk模块](module-chk.html)
- `koprepare` : 第一个参数是检查的元素(只通知根元素)，这是一个同步事件，用于在数据绑定前做处理。参考[ko模块](module-ko.html)
- `vm.get.invalidPath` : 第一个参数是`pathOrele`。参考[viewModel::get](module-ko_viewmodel.html#~get)

@example
<script type="script/wwjs">
EE.on('error',function(desc,exobj){
  console.error(`发生了错误${desc},错误内容${exobj}`)
})
</script>

@module utils/evt
*/

export default EE
