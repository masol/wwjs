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
import uniqid from 'uniqid'
import waitme from './waitme'

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
获取指定名称的template.wwjs默认template从body > div#wwtemplates下开始的template元素。其名称为指定名称的template.
@exports utils/ui
@method $template
@param {string} name 需要返回的模板名称。
@param {Element} [context = body] 需要返回的模板名称。
@return {$Element} 返回Jquery封装的Element Collection(期望长度为0或1)
*/
function $template (name, context) {
  if (typeof name !== 'string') {
    return null
  }
  if (name.startsWith('#')) {
    name = name.substr(1)
  }
  context = context || document.body
  return $('#wwtemplates', context).children(`template[name="${name}"]`)
}

/**
获取当前脚本执行的script标签．由于[IE11的设计问题](https://github.com/JamesMGreene/document.currentScript#public-service-announcement-psa)，无法[polyfill](https://github.com/JamesMGreene/document.currentScript),因此，我们采用了变通方案，要求传入一个值，也就是文件名以做selector查询．
@exports utils/ui
@method currentScript
@param {string} [srcparts=''] 传入src中一定包含的可以独立鉴别script标签的字符串用以获取script元素．
@return {Element} 返回Element或null(null只会在IE浏览器，并且selector错误时才会发生)
*/
function currentScript (srcparts) {
  if (document.currentScript) {
    return document.currentScript
  }
  if (document._currentScript) {
    return document._currentScript()
  }
  if (srcparts) {
    // @TODO 这里是否应该拦截`SyntaxError`异常，并返回null?
    let eles = document.querySelectorAll(`script[src*=${srcparts}]`)
    if (eles.length === 1) {
      return eles[0]
    }
  }
  return null
}

/**
获取当前wwjs的base url地址。在wwjs初始化后通过ui.currentScript来获取并设置在这里。
@exports utils/ui
@method baseurl
@return {string} 当前wwjs的脚本URL地址。
**/
let base
function baseurl () {
  if (!base) {
    let baseEle = currentScript('wwjs.min.js')
    if (baseEle && typeof baseEle.src === 'string') {
      let src = baseEle.src
      let idx = src.indexOf('?')
      if (idx > -1) {
        src = src.substr(0, idx)
      }
      idx = src.lastIndexOf('/')
      if (idx > -1) {
        src = src.substring(0, idx + 1)
      }
      if (!src.endsWith('/')) {
        src += '/'
      }
      if (baseEle.src.startsWith('/') || baseEle.src.startsWith('http://') || baseEle.src.startsWith('https://')) {
        base = src
      } else {
        base = `${window.location.protocol}//${window.location.host}${window.location.pathname}${src}`
      }
    }
  }
  return base
}

/**
检查当前页面是否在IFrame中被加载。
@exports utils/ui
@method inIframe
@return {Boolean} true表示位于iframe中。
*/
function inIframe () {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
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
显示消息提醒，是对[bootstrap-notify](https://github.com/mouse0270/bootstrap-notify)的一个封装，并且API针对WIDE1.0做了改进，并不兼容1.0的格式。在net.run中有对应的[message命令](module-net_commands.html#.message)
  @exports utils/ui
  @method showMessage
  @param {object|array|string} message - 消息对象,格式如下:
- 如果是对象，可以包含如下元素:
 - {string} text - 消息提示文本, 必填
 - {string} [element] - 需要提示的元素selector(或者Element)，默认为body.
 - {string} [icon] - 图标或image地址，默认图标与type相符。
 - {string} [iconType] - 图标类别,默认为icon。
 - {string} [type] - 提示的类别, 默认 info, 可选 light, dark, success, danger, warning, info, primary, secondary。参考[bootstrap alerts](https://getbootstrap.com/docs/4.0/components/alerts/)
 - {string} [layout] - 提示的位置, 默认 topCenter, 可选 top, topLeft, topCenter, topRight, bottom, bottomLeft, bottomCenter, bottomRight
 - {number} [delay] - 文本消失时间, 默认 5000, 毫秒数,小于等于0将不会自动关闭。
 - {boolean} [showProgressbar] - 是否显示进度条, 默认 false
 - 更多可能参数，参考[bootstrap-notify文档](http://bootstrap-notify.remabledesigns.com/)
- 如果是数组，则包含若干上文描述的对象或字符串。
- 如果是字符串，则为一个对象， 除了text全部使用默认值。
*/
let bsNotyLoaded = false
function showMsgImpl (message) {
  let notyOpt = {}
  let notySet = {
    placement: {
      from: 'top',
      align: 'center'
    }
  }
  if (typeof message === 'string') {
    notyOpt.message = message
  } else if (Array.isArray(message)) {
    for (let i = 0; i < message.length; i++) {
      showMsgImpl(message[i])
    }
  } else if (typeof message === 'object') {
    if (typeof message.layout === 'string') {
      if (message.layout.startsWith('bottom')) {
        notySet.placement.from = 'bottom'
      }
      if (message.layout.indexOf('Left') > -1) {
        notySet.placement.align = 'left'
      } else if (message.layout.indexOf('Right') > -1) {
        notySet.placement.align = 'right'
      }
    }
    notyOpt.message = message.text
    $.extend(notySet, message)
  }
  $.notify(notyOpt, notySet)
}

function showMessage (message) {
  if (bsNotyLoaded) {
    return showMsgImpl(message)
  } else {
    return new Promise((resolve, reject) => {
      loadjs.load(['css!@/animate.css/3.7.0/animate.min.css', '@/bootstrap-notify/3.1.3/bootstrap-notify.min.js'], {
        success: function () {
          bsNotyLoaded = true
          // console.log($.notify)
          resolve(showMsgImpl(message))
        },
        error: function (errPath) {
          console.error(`message无法加载其依赖库${errPath}`)
          EE.emit('ui.message.dep', errPath, message)
          reject(errPath)
        }
      })
    })
  }
}

/**
对指定的元素添加，移除基于CSS的动画，以[animate.css](https://github.com/daneden/animate.css)的规范为准。如果动画的开始/移除都使用本函数，则维护了data('transitioning',true)——当动画进行时。参考[这里的说明](https://stackoverflow.com/questions/9736919/check-if-element-is-being-animated-css3)
@exports utils/ui
@method animateCSS
@param {jQueryElement} $ele 需要设置动画效果的元素。
@param {string} [effectName=''] 动画效果的名称，如果名称为空，则立即停止元素上的任意动画效果。可用名称内建支持[animate.css](https://github.com/daneden/animate.css)+'none'(不执行任何动画，立即返回)。其它扩展名称，需要自行包含对应的css文件。
@param {object} [options={iteration:1, duration:1000, delay:0, block:true, unhide:false, moveto:false}] 动画效果的扩展配置。可能的配置如下:
 - iteration: 数字或'infinite' 动画循环的次数，默认是1。
 - duration: faster(500ms),fast(800ms),slower(3s),slow(2s)。或者数字用于指示持续时间。默认1秒。
 - delay: 动画启动的延迟可以是'2s','2000ms'这样的字符串，默认立即启动。
 - block: *true* 检查元素是否是inline,如果是inline,修改display为inline-block。默认为true,因为animate.css很多效果依赖block显示状态。
 - unhide: 检查元素是否处于隐藏状态，如果是，显示之。
 - moveto: 检查元素是否在页面可视区域中，如果不在，滚动到元素位置之后，才开始动画。（NOT IMPLEMENT)
@param {object} [beforecss={}] 动画开始之前为$ele添加的属性。
@param {object} [aftercss={}] 动画结束之后为$ele添加的属性。
@return {Promise} 当动画执行结束时，被解析。
*/
const transitioning = 'transitioning'
const removeClasses = ['animated', 'infinite', 'delay-2s', 'delay-3s', 'delay-4s', 'delay-5s', 'faster', 'fast', 'slower', 'slow'].join(' ')
function cssAnimate ($ele, effectName, options, beforecss, aftercss) {
  options = options || {}
  if (typeof options.block !== 'boolean') {
    options.block = true
  }
  if (effectName === 'none') {
    return
  }
  return new Promise(function (resolve, reject) {
    let handleAnimationEnd = function (evt, bNotResolve) {
      $ele.removeClass(removeClasses)
      if (effectName) {
        $ele.removeClass(effectName)
      }
      $ele.css({
        'animation-duration': '',
        'animation-delay': '',
        'animation-iteration-count': ''
      })
      if (typeof aftercss === 'object' && !Object.isEmpty(aftercss)) {
        $ele.css(aftercss)
      }
      $ele.removeData(transitioning)
      if (!bNotResolve) {
        resolve(true)
      }
    }
    if (effectName) {
      if ($ele.data(transitioning)) {
        handleAnimationEnd(true)
      }
      if (options.unhide) {
        if ($ele.css('visibility') === 'hidden') {
          $ele.css('visibility', 'visible')
        }
        if ($ele.is(':hidden')) {
          $ele.show()
        }
      }
      let extraInlineCSS = {}
      let addedClasses = [
        effectName,
        'animated'
      ]
      if (options.block && $ele.css('display') === 'inline') {
        $ele.css('display', 'inline-block')
      }
      if (options.iteration === 'infinite') {
        addedClasses.push('infinite')
      } else if (typeof options.iteration === 'number' && options.iteration !== 1) {
        extraInlineCSS['animation-iteration-count'] = options.iteration
      }
      if (options.delay) {
        switch (options.delay) {
          case '2s':
          case '3s':
          case '4s':
          case '5s':
            addedClasses.push(`delay-${options.delay}`)
            break
          default:
            extraInlineCSS['animation-delay'] = options.delay
        }
      }
      if (options.duration) {
        switch (options.duration) {
          case 'faster':
          case 'fast':
          case 'slower':
          case 'slow':
            addedClasses.push(options.duration)
            break
          default:
            extraInlineCSS['animation-duration'] = options.duration
        }
      }
      if (!Object.isEmpty(extraInlineCSS)) {
        $ele.css(extraInlineCSS)
      }
      if (typeof beforecss === 'object' && !Object.isEmpty(beforecss)) {
        $ele.css(beforecss)
      }
      $ele.addClass(addedClasses.join(' '))
      $ele.data(transitioning, true)
      $ele.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', handleAnimationEnd)
    } else {
      if ($ele.data(transitioning)) {
        return handleAnimationEnd()
      }
      resolve(false)
    }
  })
}

/**
获取元素的名称，依次获取name,data-name,id,data-id.如果没有，创建唯一id，并返回这一唯一id.返回第一个获取到的。
@exports utils/ui
@method getName
@param {JQueryElement} $ele 需要获取名称的元素。
@return {String} 获取到的名称。
*/
function getName ($ele) {
  return $ele.attr('name') || $ele.attr('data-name') || $ele.attr('id') || $ele.attr('data-id') || $ele.uniqueId()
}

/**
获取元素的名称，依次获取name,data-name,id,data-id.如果没有，创建唯一id，并返回这一唯一id.返回第一个获取到的。
@exports utils/ui
@method uniqId
@param {JQueryElement} $ele 需要检查是否有id的元素。
@param {String} [prefix=undefined] prefix
@return {String} id字符串，如果原始已定义，则返回原始的id。
*/
function uniqId ($ele, prefix) {
  let id = $ele.attr('id')
  if (!id) {
    id = uniqid(prefix)
    $ele.attr('id', id)
  }
  return id
}

/**
设置页面的title以及meta[name="description"].
@exports utils/ui
@method title
@param {string} newTitle 设置为新的title.
@param {string} [desc=newTitle] 设置新的description,默认设置为title.
@return {undefined}
*/
function title (newTitle, desc) {
  if (typeof newTitle === 'string' && document.title !== newTitle) {
    document.title = newTitle
    desc = desc || newTitle
    $('meta[name="description"]').attr('content', desc)
  }
}

/**
block指定元素．默认实现使用了[waitMe](https://github.com/vadimsva/waitMe)．可以通过重载`wwjs.ui.block`函数来替换默认方案。不同于showMessage的依赖可以运行期动态加载。由于页面初次加载时就有加载状态，因此将waitme内置包含。
@exports utils/ui
@method block
@param {JQueryElement} [$ele] block指定元素．
@param {boolean} [benable=false] block或unblock指定元素.
@param {object} [opt={}] 配置细节信息，这些配置同时可以同名从ele中获取．这里的配置优先级高于ele的配置。支持的配置参考[waitMe文档](https://vadimsva.github.io/waitMe/):
- effect: 指定动画效果，默认为*bounce*，其它有效值为:'none', 'rotateplane', 'stretch', 'orbit', 'roundBounce', 'win8', 'win8_linear', 'ios', 'facebook', 'rotation', 'timer', 'pulse', 'progressBar', 'bouncePulse', 'img'。
- text: 在效果动画下放置文本，默认为空字符串(不放置文本)
- bg: 容器元素的背景，默认为'rgba(255,255,255,0.7)',也可以传入'false'不改变容器背景。
- color: 动画及文字的背景，默认为'#000'，可以使用['','',...]来指定多个颜色。
- maxSize: 最大尺寸，可以设置为40等数字(单位为px)。默认为空，意味着根据容器当前尺寸来设置。
- waitTime: 设置毫秒为单位的等待时间，时间到达后自动取消禁用状态，默认为-1(无限时间)。
- textPos: 文本位置，只有指定了text属性这一属性才有意义。默认为垂直‘vertical’放置，另外有效值为水平放置'horizontal'
- fontSize: 设置文本字号，只有指定了text属性才有意义。默认使用容器的字体设置。可以设置为'18px'这样的css有效的值。
- source: 图片地址，只有效果设置为img才有意义。默认采用内部的img/img.svg。
- onClose: 在禁用状态被关闭时的回调函数，等效于响应'close'事件。这里指定的是bash格式的命令字符串。(尚未实现)
@return {undefined}
*/
function assignValue ($ele, opt, suffix) {
  if (!opt[suffix]) {
    let value = $ele.attr(`data-disable-${suffix}`)
    if (value) {
      opt[suffix] = value
    }
  }
}
function block ($ele, benable, opt) {
  if (benable) {
    opt = opt || {}
    assignValue($ele, opt, 'effect')
    assignValue($ele, opt, 'text')
    assignValue($ele, opt, 'bg')
    assignValue($ele, opt, 'color')
    assignValue($ele, opt, 'maxSize')
    assignValue($ele, opt, 'waitTime')
    assignValue($ele, opt, 'textPos')
    assignValue($ele, opt, 'fontSize')
    assignValue($ele, opt, 'source')
    assignValue($ele, opt, 'onClose')

    if (!opt.maxSize) {
      opt.maxSize = Math.min($ele.outerWidth(true), $ele.outerHeight(true))
    }
    // if (typeof opt.onClose === 'string') { // 将opt.onClose转化为函数。
    //
    // }
    $ele.waitMe(opt)
  } else {
    $ele.waitMe('hide')
  }
}

export default {
  $container: $container,
  $template: $template,
  currentScript: currentScript,
  block: block,
  title: title,
  cssAnimate: cssAnimate,
  uniqId: uniqId,
  loadImg: waitme.img,
  baseurl: baseurl,
  /**
  获取基于时间的唯一字符串。详见[uniqid](https://github.com/adamhalasz/uniqid)
  @exports utils/ui
  @method uniq
  @param {String} [prefix=undefined] 如果需要前缀，通过本参数指定。
  @return {String} 新创建的唯一字符串.
  */
  uniq: uniqid,
  createIframe: createIframe,
  inIframe: inIframe,
  showMessage: showMessage,
  getName: getName
}
