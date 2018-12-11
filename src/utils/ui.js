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
import loadjs from './loadjs'

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
 * 显示消息对象
 * @param {object} message - 消息对象
 * @param {array} message.global - 全局消息列表
 * @param {object} message.global[] - 全局消息列表项
 * @param {string} message.global[].text - 全局消息提示文本, 必填
 * @param {string} message.global[].type - 全局消息提示文本, 默认 error, 可选 alert, success, error, warning, info
 * @param {string} message.global[].layout - 全局消息提示文本, 默认 topRight, 可选 top, topLeft, topCenter, topRight, center, centerLeft, centerRight, bottom, bottomLeft, bottomCenter, bottomRight
 * @param {string} message.global[].mint - 全局消息提示文本, 默认 mint, 可选 relax, mint, sunset, metroui, semanticui, bootstrap-v3, bootstrap-v4, nest
 * @param {number|false} message.global[].timeout - 全局消息提示文本, 默认 3500, 毫秒数或false
 * @param {array} message.element - 元素消息列表
 * @param {object} message.element[] - 元素消息列表项
 * @param {string} message.element[].text - 元素消息提示文本, 必填
 * @param {string} message.element[].className - 元素消息提示文本, 必填, 元素name
 * @param {string} message.element[].layout - 元素消息提示文本, 默认error, 提示类型success/error/warn/info
 * @param {string} message.element[].mint - 元素消息提示文本, 默认 "bottom left", 提示位置 "top", "middle" or "bottom";  "left", "center" or "right"
 * @param {number|false} message.element[].timeout - 元素消息提示文本, 默认 3000, 自动关闭, 或毫秒数
 */
function showNewMessage (message) {
  /**
   * 页面提示功能, 可提示在特定元素, 也可提示在全局
   * @param {jQuery element} $ele - 若传入 $ 表示全局提示, 若传入jQuery对象, 表示在该元素上提示
   * @param {string} info - 提示文本
   * @param {string} className - 提示类名, 关联提示样式 success/error/warn/info, 默认是 "error" 错误提示
   * @param {string} style - 样式主题, 默认是 "bootstrap" 主题
   * @param {boolean/number} hide - 是否自动隐藏, 可传入毫秒数表示多少毫秒后隐藏, 或传入false表示不隐藏. 默认是3000
   */
  var notify = (function () {
    var defaultConfig = {
      className: 'error',
      style: 'bootstrap',
      autoHide: 3000
      // autoHide: false
    }
    // 确定最终在哪个元素上提示
    function ajustEle ($ele) {
      $ele = $ele || $
      if ($ele === $) {
        return $ele
      }

      if ($ele.is('input[type="radio"]')) {
        $ele = $ele.parent()
      }

      while (!$ele.is(':visible')) {
        $ele = $ele.parent()
      }

      return $ele
    }

    function processNotify ($ele, info, className, otherConfig) {
      // 默认值设置
      $ele = ajustEle($ele)
      var config = $.extend({}, defaultConfig)
      info = info || defaultConfig.info
      config.className = className || defaultConfig.className
      if (otherConfig && typeof otherConfig === 'object') {
        config = $.extend(config, otherConfig)
      }

      try {
        if ($ele === $) {
          var notyConfig = {}
          notyConfig.text = info
          if (typeof config.autoHide !== 'undefined') {
            notyConfig.timeout = config.autoHide
          }
          if (typeof config.className !== 'undefined') {
            notyConfig.type = config.className
          }
          noty(notyConfig)
        } else {
          $ele.notify(info, $.extend({
            position: 'bottom left'
          }, config))
          if (!config.autoHide || config.autoHide > 500) {
            var funcName
            var $notifyele = $ele.parent().find('.notifyjs-wrapper.notifyjs-hidable')
            var handler = $ele.one('focus change', funcName = function () {
              // remove notify: $ele.notify();
              $notifyele.trigger('notify-hide')
            })
            $notifyele.on('click', function () {
              $ele.off('focus change', funcName)
            })
            if (config.autoHide > 500) {
              setTimeout(function () {
                clearTimeout(handler)
              }, config.autoHide)
            }
          }
        }
      } catch (e) {
        console.error('notify error', e)
      }
    }

    var init = function () {
      init = function () {

      }
    }
    // console.log($);
    // if(!$.fn.notify || typeof $.fn.notify !== "function"){
    // requirejs.config({
    //   'baseUrl': '/',
    //   'paths': {
    //     'notify': 'libs/notifyjs/dist/notify-combined.min',
    //     'notify_bootstrap': 'libs/notifyjs/dist/styles/bootstrap/notify-bootstrap'
    //   },
    //   'shim': {
    //     'notify_bootstrap': {
    //       deps: ['notify']
    //     }
    //   }
    // })
    return function ($ele, info, className, otherConfig) {
      loadjs.load(['notify', 'notify_bootstrap'], function () {
        // debugger;
        init()
        processNotify($ele, info, className, otherConfig)
      })
    }
    // }
  }())

  // 获取特定name对应的元素, name: string, $eleSet: jquery对象, 在该元素集中查找元素, 如不填则默认在body中查找
  function searchTheNameEles (name, $eleSet, strict) {
    if (!name) {
      return false
    }
    strict = strict || false // 标识是否是严格模式, 严格模式若在eleSet找不到则不找
    var $nameDom = false

    if (strict) {
      if ($eleSet && $eleSet.length > 0) {
        $eleSet.each(function (index, targetDom) {
          var $this = $(targetDom)
          var eleName = getName($this)
          if (eleName === name) {
            $nameDom = ($nameDom === false ? $this : $nameDom.add($this))
          }
        })
      }
    } else {
      if ($eleSet && $eleSet.length > 0) {
        $eleSet.each(function (index, targetDom) {
          var $this = $(targetDom)
          var eleName = getName($this)
          if (eleName === name) {
            $nameDom = ($nameDom === false ? $this : $nameDom.add($this))
          }
        })
        if ($nameDom === false) { // 非严格模式扩大搜索范围
          $nameDom = $eleSet.find("[name='" + name + "'],[data-name='" + name + "']")
        }
      }
      if ($nameDom === false) {
        $nameDom = $('body').find("[name='" + name + "'],[data-name='" + name + "']")
      }
    }

    if (!$nameDom || $nameDom.length === 0) {
      return false
    } else {
      return $nameDom
    }
  }

  /**
   * 页面提示功能, 提示在全局, 可访问defaultConfig来修改默认配置
   * @param {object} config - 提示配置, 必须有text属性表示提示文字
   */
  let noty = (function () {
    let defaultConfig = {}

    // 初始化页面级配置
    let init = function () {
      defaultConfig.type = 'error' // alert, success, error, warning, info
      defaultConfig.layout = 'topRight' // top, topLeft, topCenter, topRight, center, centerLeft, centerRight, bottom, bottomLeft, bottomCenter, bottomRight
      defaultConfig.progressBar = true
      defaultConfig.theme = 'mint'
      defaultConfig.closeWith = ['click', 'button']
      defaultConfig.animation = {}
      defaultConfig.animation.open = 'noty_effects_open'
      defaultConfig.animation.close = 'noty_effects_close'
      defaultConfig.callbacks = {}
      defaultConfig.timeout = 3500
      init = function () {
        return true
      }
    }

    var loadDependence = function (fncallback) {
      if (!window.wwload.noty) {
        window.wwload.noty = 'wait'
        loadjs.load(['@/noty/3.2.0-beta/noty.min.js', 'css!@/noty/3.2.0-beta/noty.css'], function () {
          // window.Noty = noty
          console.log(arguments)
          window.wwload.noty = true
          replace()
          fncallback()
        })
      } else if (window.wwload.noty === 'wait') {
        setTimeout(function () {
          loadDependence(fncallback)
        }, 100)
      } else {
        replace()
        fncallback()
      }

      function replace () {
        loadDependence = function (fncallback) {
          fncallback()
        }
      }
    }

    let noty = function (config) {
      console.log(config)
      // 检查参数
      if (!config || !config.text) {
        return
      }
      init()
      config = $.extend(true, {}, defaultConfig, config)
      if (config.className && config.className !== config.type) {
        config.type = config.className
        delete config.className
      }

      // 执行noty
      loadDependence(function (config) {
        return function () {
          window.Noty.setMaxVisible(10)
          new window.Noty(config).show()
        }
      }(config))
    }
    noty.defaultConfig = defaultConfig
    return noty
  }())

  if (typeof message === 'undefined') {
    console.error('函数showNotify未传入message对象')
    return false
  }

  let $nameEles, i
  for (i = 0; i < message.global.length; i++) {
    noty(message.global[i])
  }
  for (i = 0; i < message.element.length; i++) {
    $nameEles = searchTheNameEles(message.element[i].name, $('body'), false)
    if ($nameEles.length > 0) {
      notify($nameEles.first(), message.element[i].text, false, message.element[i])
    } else {
      notify($, message.element[i].text, false, message.element[i])
    }
  }
  return true
}

/**
判断使用新message对象格式还是旧message对象格式.从wide1.5中继承。
@exports utils/ui
@method showMessage
@param {object|string} message 消息对象或者消息字符串
 */
function showMessage (message, $container, className, defaultMessage, strict) {
  if (!message) {
    return false
  }
  if (message.global && message.element && $.isArray(message.global) && $.isArray(message.element)) {
    showNewMessage(message)
  } else {
    // showOldMessage(message, $container, className, defaultMessage, strict)
  }
}

// 获取元素name
function getName ($ele) {
  var name = $ele.attr('name')
  name = name || $ele.data('name')
  if (name) {
    return name
  } else {
    return false
  }
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
  createIframe: createIframe,
  showMessage: showMessage,
  getName: getName
}
