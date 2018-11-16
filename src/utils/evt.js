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

系统所有的错误机制，可以监听`调用EE.on("error",function(desc,exobj){})`的方式来拦截，提供了如下错误类型(地一个参数):
- `script.wwjs` : wwjs类型的脚本执行错误。此时第２个参数是一个`Error`对象。
- `chk.nocontainer` : chk模块尝试获取container,但是失败了。此时第２个参数为undefined.

@example
<script type="script/wwjs">
EE.on('error',function(desc,exobj){
  console.error(`发生了错误${desc},错误内容${exobj}`)
})
</script>

@module utils/evt
*/

export default EE
