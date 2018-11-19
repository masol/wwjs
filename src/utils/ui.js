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
// Created At : 2018-11-16T07:47:29.797Z by masol (masol.li@gmail.com)

'use strict'

import cfg from './cfg'

/**
UI模块提供了对HTML布局的一些基本假定的Adapter接口。
@module utils/ui
*/

const isEleValid = ($ele) => {
  return ($ele && $ele.length > 0)
}
let $containerCache
/**
获取Mutation负责开始监听的根路径元素。要求所有需要显示的元素都应该是这个根元素的孩子。获取这个根元素的方式按照下列顺序从上往下搜索，第一个满足条件的元素被返回:
- 按照cfg模块的`$container`给定的selector.first()来确定元素。
- 搜索`#wwcontainer`.first()
- 搜索`body > div.container,body > div.container-fluid`.first()
- 搜索`body div.container,body div.container-fluid`.first()
- 使用'body'.first()
@exports utils/ui
@method $container
@return {$Element} 返回Jquery封装的Element Collection(长度为１)
*/
function $container () {
  if ($containerCache) {
    return $containerCache
  }
  let $ele
  if (typeof (cfg.$container) !== 'string') {
    $ele = $(cfg.$container).first()
  }
  if (!isEleValid($ele)) {
    $ele = $('#wwcontainer').first()
    if (!isEleValid($ele)) {
      $ele = $('body > div.container,body > div.container-fluid').first()
      if (!isEleValid($ele)) {
        $('body div.container,body div.container-fluid').first()
      }
    }
  }
  $containerCache = $ele
  return $ele
}

export default {
  $container: $container
}
