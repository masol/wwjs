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

/**
获取当前脚本执行的script标签．由于[IE11的设计问题](https://github.com/JamesMGreene/document.currentScript#public-service-announcement-psa)，无法[polyfill](https://github.com/JamesMGreene/document.currentScript),因此，我们采用了变通方案，要求传入一个值，也就是文件名以做selector查询．
@exports utils/ui
@method currentScript
@param {string} [srcparts] 传入src中一定包含的可以独立鉴别script标签的字符串用以获取script元素．
@return {Element} 返回Element或null(null只会在IE浏览器，并且selector错误时才会发生)
*/
function currentScript (srcparts) {
  if (document.currentScript) {
    return document.currentScript
  }
  // @TODO 这里是否应该拦截`SyntaxError`异常，并返回null?
  let eles = document.querySelectorAll(`script[src*=${srcparts}]`)
  if (eles.length === 1) {
    return eles[0]
  }
  return null
}

/**
ref: #22051 从wwclass.js V1.7中拷贝．
@exports utils/ui
@method createIframe
@param {JQueryElement} $ele iframe的父元素
@param {string} htmlsrc HTML的正文内容．
@return {Element} 返回新创建的IFrame元素．
*/
function createIframe ($ele, htmlstr) {
  $ele.addClass('embed-responsive embed-responsive-4by3')
  let parent = $ele.get(0)
  let iframe = document.createElement('iframe')
  parent.appendChild(iframe)
  $(iframe).addClass('embed-responsive-item').attr('width', '100%').css('width', '100%').attr('frameborder', '0')
  iframe.contentWindow.document.open('text/htmlreplace')
  iframe.contentWindow.document.write(htmlstr)
  iframe.contentWindow.document.close()
  return iframe
}

/**
block指定元素．默认实现使用了[waitMe](https://github.com/vadimsva/waitMe)．可以在插件中通过重载`wwjs.ui.block`函数来替换默认方案．
@exports utils/ui
@method block
@param {JQueryElement} [$ele] block指定元素．
@param {boolean} [block=false] block或unblock指定元素.
@param {object} [opt={}] 配置细节信息，这些配置同时可以同名从ele中获取．这里的配置优先级高于ele的配置.
@return {Promise} 解析为指定元素是否被block.
*/
function block ($ele, block, opt) {}

export default {
  $container: $container,
  currentScript: currentScript,
  block: block,
  createIframe: createIframe
}
