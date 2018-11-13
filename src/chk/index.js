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
// Created At : 2018-11-13T06:35:34.007Z by masol (masol.li@gmail.com)

'use strict'

import EE from '../utils/evt'

/**
chk模块提供了在html代码插入时，检查插入的Node,并加以处理的能力。这一检查是在Node第一次被绘制时调用的(requestAnimationFrame)，因此，需要自行处理好平滑过程。
@module chk
*/

/**
本函数首先初始化内建的chker,依次调用下列模块的setup:
- ko
- view
- module

然后，本函数安装MutationObserve(如果有wwrootContainer则选择，否则选择body)，并将事件处理为:
- 在节点被加入时，调用EE.emit("nodeBeforeAdd",NodeList) : 收到事件立即发出
- 在节点被加入时，并且延迟到第一次被绘制时调用的(requestAnimationFrame),调用EE.emit("nodeAdd",NodeList)
- 在节点被移除时，调用EE.emit("nodeBeforeRm",NodeList)
- 在节点被移除时，并且延迟到第一次被绘制时调用的(requestAnimationFrame),调用EE.emit("nodeRm",NodeList)

最后，由于本函数在Dom Ready之后调用，将容器对象作为第一个事件发送出去。
@exports chk
@access private
@method setup
@return {promise|undefined} 如果安装工作可以同步完成，返回undefined,否则返回一个promise(需要异步加载chker的情况),其被解析时意味着安装工作结束。
*/
function setup () {
  require('../ko/index')
  EE.emit('nodeBeforeAdd')
  // document.getElementById('PreLoaderBar').style.display = 'none'
}

export default setup
