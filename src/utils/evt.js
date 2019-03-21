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
import UI from './ui'

const EE = new EventEmitter()
window.EE = EE

/**
事件中心模块提供了全局的内部事件中心，可以独立于Dom执行。

系统所有的错误机制，可以通过调用`EE.on("error",function(desc,exobj){})`的方式来拦截，提供了如下错误类型(事件响应代码的第一个参数):
- `script.wwjs` : wwjs类型的脚本执行错误。此时第２个参数是一个`Error`对象。
- `chk.nocontainer` : chk模块尝试获取container,但是失败了。此时第２个参数为undefined.
- `vm.typeerror` : 给vm某个变量设置值，但是其类型不同于原始值。此时第２个参数是`TypeError`实例。如果设置了自动转化，则本事件不会发出。参考[utils/cfg模块](module-utils_cfg.html)
- `bindvar` : 处理`data-bindvar`时发生了错误，错误对象是第二个参数，通常是`SyntaxError`对象。第三个参数返回相关的ele对象(dom Element)
- `elem.depfailed` : 元素dep依赖加载失败，错误对象是第二个参数。
- `wwclass.finalize` : 元素析构时发生错误，错误对象是第二个参数。查阅[elems模块](module-elems.html)
- `wwclass.get` : 获取元素类时发生错误，加载失败的文件名是第二个参数。查阅[wwclass:get](wwclass.html#.get)
- `net.invalidURL` : 加载网络命令处理器时发生错误，第二个参数是errFiles，第三个参数是请求的命令。
- `net.invalidCmd` : 当请求的命令文件被加载，但是指定时间内(默认10秒)未能等待到注册事件，发出本事件。
- `net.invalidData` : 执行`updatelv`时，params参数无效。第二个参数是传入的params.
- `net.eval` : 执行`eval`指令时发生错误。第二个参数是传入的params
- `wwclass.constructor` : 创建元素类实例时发生错误，第二个参数是异常对象。

系统所有的警告机制，可以通过调用`EE.on("warn",function(desc,exobj){})`的方式来拦截，提供了如下警告:
- `elems.verMismatch` : 回调(type, name, RequestVer, RegVer)请求实例化元素，但是元素版本与当前注册表中的版本不匹配，这说明当前页面请求了不同版本的相同元素.

只在debug为true时发出的错误事件(这些类型的事件，通常只在开发期才会出现，开发期不出现的话，运行期不会出现):
- `wwclass.badparameter` : 回调(type,inst) wwclass创建实例时，绑定的ele无效．查阅[wwclass:constructor](wwclass.html#~constructor)

还提供了如下事件:
- `nodeBeforeAdd` : 第一个参数是新加入的元素(只通知根元素).参考[chk模块](module-chk.html)
- `nodeAdd` : 第一个参数是新加入的元素(只通知根元素).参考[chk模块](module-chk.html)
- `nodeBeforeRm` : 第一个参数是删除的元素(只通知根元素).参考[chk模块](module-chk.html)
- `nodeRm` : 第一个参数是删除的元素(只通知根元素).参考[chk模块](module-chk.html)
- `koprepare` : 第一个参数是检查的元素(只通知根元素)，这是一个同步事件，用于在数据绑定前做处理。参考[ko模块](module-ko.html)
- `vm.get.invalidPath` : 第一个参数是`pathOrele`。参考[viewModel::get](module-ko_viewmodel.html#~get)
- `elems.inst` : 回调(ele, inst, reqfullclass)，当一个Dom元素被绑定了wwclass类实例时发出．
- `wwclass.reg`: 回调(name,clsdef),当一个wwclass元素被注册时，发出事件。
- `command.reg`: 回调(name,handler),当一个命令扩展被注册时，发出事件,包括内建命令。

@example
<script type="script/wwjs">
EE.on('error',function(desc,exobj){
  console.error(`发生了错误${desc},错误内容${exobj}`)
})
</script>

@module utils/evt
*/

/**
onNodeAdd事件，是对`EE.on('nodeAdd'...)`的一个扩展，如果监听时，事件已经发出，则会将$container的加入事件重新发送一遍，以确保不会遗漏加入事件，用于注册的chk函数。
@exports utils/evt
@access public
@param {function} [cb] 接收onNodeAdd事件的回调函数，参考[chk模块](module-chk.html#~setup).
@method onNodeAdd
@return {undefined}
*/

EE.onNodeAdd = function (cb) {
  if ($.isFunction(cb)) {
    EE.on('nodeAdd', cb)
    if (EE.alreadyEmitted) {
      setTimeout(() => {
        EE.emit('nodeAdd', [UI.$container()[0]])
      }, 0)
    }
  }
}

export default EE
