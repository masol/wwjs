// ///////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// ///////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-15T11:16:27.898Z by masol (masol.li@gmail.com)

'use strict'

import EE from '../utils/evt'
import cfg from '../utils/cfg'

/**
本模块负责检查`<script type="text/wwjs">XXX</script>`标签。并在wwjs就绪之后调用这些脚本。这些脚本可以是任意javascript，其本质上被封装为一个function形式，并且this为当前元素。
不同于`type="text/javascript"`的是，这些代码确保wwjs就绪之后执行。wwjs通常通过view来扩展，在view中添加代码可以有如下几个方式(如果代码引入外部库，不需要考虑重复加载，一个url，只会加载一次):
- 书写一个wwjs script，这段script在元素被加入Dom Tree，并且wwjs就绪之后，数据绑定应用之前执行(响应'koprepare')，并且只执行一次。因此很适合做绑定数据相关的工作：
  - 给出绑定数据初始化(`set(XX,XX,false)`形式调用)
  - 添加事件绑定回调函数
- 书写一个标准的es6模块，通过wwimport引入，这个引入是在wwjs就绪之后，与数据绑定的执行时间不可预测。通常用来处理如下事物:
  - 引入额外chk.
- 书写javascript script元素,执行时，wwjs是否就绪未知。
- 书写元素wwclass，并在Dom Tree中插入元素，这是复用性最好的机制，可以被WIDE使用者直接使用。
- 书写KO模板，与wwclass相同，这也是服用性非常好的一种形式。
@module chk/script
*/

function procScript () {
  let ele = this
  // eslint-disable-next-line no-new-func
  const func = new Function(ele.textContent)
  try {
    func.call(this)
  } catch (ex) {
    if (cfg.debug) {
      console.error('wwjs类型的脚本执行错误:', ex)
    }
    EE.emit('error', 'script.wwjs', ex)
  }
}

EE.on('koprepare', function ($item) {
  const selector = 'script[type="text/wwjs"]'
  if ($item.is(selector)) {
    procScript.call($item[0])
  }
  let nsItems = $item.find(selector)
  if (nsItems.length > 0) {
    nsItems.each(procScript)
  }
})
