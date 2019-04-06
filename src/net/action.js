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
// Created At : 2019-04-02T09:11:52.980Z by lizhutang (lizhutang@spolo.org)

'use strict'

import ui from '../utils/ui'
import str from '../utils/str'
import vm from '../ko/viewmodel'
import ns from '../ko/ns'

/**
本模块提供了默认事件处理[action](module-chk_action.html)所需的命令。
- open
- submit
@module net/action
*/

const GLOBALSEL = '*g:'
const PARENTSEL = '*p:'
const CHILDSEL = '*c:'
const DESCSEL = '*d'
// 小于10是不处理的情况。
const OPENINNEW = 1
const SELFINFRAME = 2
const OPENINFRAME = 3
const OPENPAGE = 11
const OPENINVIEW = 12
const OPENINSELF = 13
function getTarget (ctx) {
  let $target = null
  if (typeof target === 'string') {
    // 如果要求新页面打开，或者位于IFrame中，请求打开parent或top，直接返回，让浏览器处理。
    if (ctx.target === '_blank') {
      ctx.mode = OPENINNEW
      return null
    } else if (ctx.target === '_parent' || ctx.target === '_top') {
      if (ui.inIframe()) {
        ctx.mode = SELFINFRAME
        return null
      }
      $target = ui.$container()
      ctx.mode = OPENPAGE
    } else if (ctx.target.startsWith(GLOBALSEL)) {
      $target = $(ctx.target.substr(GLOBALSEL.length))
    } else if (ctx.$refEle) {
      if (ctx.target.startsWith(PARENTSEL)) {
        $target = ctx.$refEle.closest(ctx.target.substr(PARENTSEL.length))
      } else if (ctx.target.startsWith(DESCSEL)) {
        $target = ctx.$refEle.find(ctx.target.substr(DESCSEL.length))
      } else if (ctx.target.startsWith(CHILDSEL)) {
        $target = ctx.$refEle.children(ctx.target.substr(CHILDSEL.length))
      }
    } else if (ctx.target === '_self') {
      $target = ctx.$refEle
      ctx.mode = OPENINSELF
    } else {
      // try to find iframe with name of target.
      // 如果请求在iframe中打开，不再处理。
      let $tmp = $(`iframe[name=${ctx.target}]`)
      if ($tmp.length > 0) {
        ctx.mode = OPENINFRAME
        return null
      }
    }
  } else {
    $target = ctx.$refEle
    ctx.mode = OPENINSELF
  }
  if (!ctx.mode && $target) {
    ctx.mode = OPENINVIEW
  }
  return $target
}

// Internal: Filter and find all elements matching the selector.
//
// Where $.fn.find only matches descendants, findAll will test all the
// top level elements in the jQuery object as well.
//
// elems    - jQuery object of Elements
// selector - String selector to match
//
// Returns a jQuery object.
function findAll (elems, selector) {
  return elems.filter(selector).add(elems.find(selector))
}

function parseHTML (html) {
  return $.parseHTML(html, document, true)
}

function procHashURL (url, ctx, context) {
  let vmIdx = url.indexOf((vm.VMINHASHPREFIX))
  if (vmIdx > -1) {
    let obj = vm.objFromHash(url)
    if (!Object.isEmpty(obj)) {
      vm.set(obj, null, true)
    }
    url = url.substr(0, vmIdx)
  }
  let $tpl = ui.$template(url.substr(1), context)
  if ($tpl && $tpl.length > 0) {
    ctx.$target.html($tpl.html())
    return true
  }
  return false
}

const TPLRX = /\${.+?}/
function procURL (url, ctx) {
  let hashIdx = url.indexOf('#')
  let hashStr
  if (hashIdx > -1) {
    hashStr = url.substr(hashIdx)
    url = url.substr(0, hashIdx)
  }
  if (TPLRX.test(url)) {
    url = ns.pub.template(url, ctx.$refEle.get(0))
  }
  if (url.length > 0) {
    let fetch = window.ky || window.fetch
    // 展开URL，如果有es6模板。
    return Promise.pipe([
      function () {
        return fetch(url, {
          method: ctx.method || 'GET'
        }).catch(function (err) {
          // @TODO 这里拦截错误，并给出友好提示。
          if (!ctx.noerror) {
            ui.showMessage({
              'text': `忽略对${url}的请求:${err}`,
              'layout': 'top',
              'type': 'warning'
            })
          }
          // throw err
        })
      },
      function (response) {
        if (typeof response === 'object' && response.ok && response.headers) {
          let mime = response.headers.get('content-type')
          if (typeof mime === 'string') {
            if (mime.indexOf('text/html') > -1) {
              return Promise.pipe([
                function () {
                  return response.text()
                },
                function (htmlData) {
                  let fullDocument = /<html/i.test(htmlData)
                  let $head, $body
                  // Attempt to parse response html into elements
                  if (fullDocument) {
                    $body = $(parseHTML(htmlData.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]))
                    let head = htmlData.match(/<head[^>]*>([\s\S.]*)<\/head>/i)
                    $head = head != null ? $(parseHTML(head[0])) : $body
                  } else {
                    $head = $body = $(parseHTML(htmlData))
                  }

                  if (hashStr) {
                    return procHashURL(hashStr, ctx, $body)
                  } else {
                    if (ctx.mode === OPENPAGE) {
                      // If there's a <title> tag in the header, use it as
                      // the page's title.
                      let title = findAll($head, 'title').last().text()
                      let desc = findAll($head, 'meta[name="description"]').last().attr('content')
                      if (title) {
                        ui.title(title, desc)
                      }
                    }
                    if (fullDocument) {
                      let tmpBody = findAll($body, '#wwcontainer').first()
                      if (tmpBody.length > 0) {
                        $body = tmpBody
                      }
                    }
                    // @TODO wait before animation stop here?
                    ctx.$target.empty()
                    ctx.$target.append($body)
                  }
                }
              ])
            } else if (mime.indexOf('application/json') > -1) {
              // @TODO: run command with return json.
              return Promise.pipe([
                function () {
                  return response.json()
                },
                function (obj) {
                  if (typeof obj === 'object' && typeof obj._runCommand === 'object') {
                    if (Array.isArray(obj._runCommand)) {
                      for (let i = 0; i < obj._runCommand.length; i++) {
                        wwjs.net.run(obj._runCommand[i], ctx.$target.get(0))
                      }
                    } else {
                      wwjs.net.run(obj._runCommand, ctx.$target.get(0))
                    }
                  }
                }
              ])
            } else if (mime.indexOf('image/') > -1) {
              // @TODO: update image.
              console.error('NOT IMPLEMENT')
            }
          }
        }
      }
    ])
  }
}

function disableElePair (bEnable, ctx) {
  if (ctx.$target || ctx.$refEle) {
    switch (ctx.notdisable) {
      case 'yes':
      case 'true':
      case 'all':
        break
      case 'target':
        ui.block(ctx.$refEle, bEnable)
        break
      case 'self':
        ui.block(ctx.$target, bEnable)
        break
      default:
        // 如果有父子包含关系，只disable/enable父元素。
        if ($.contains(ctx.$refEle.get(0), ctx.$target.get(0))) {
          ui.block(ctx.$refEle, bEnable)
        } else if ($.contains(ctx.$target.get(0), ctx.$refEle.get(0))) {
          ui.block(ctx.$target, bEnable)
        } else {
          ui.block(ctx.$target, bEnable)
          ui.block(ctx.$refEle, bEnable)
        }
        break
    }
  }
}

/**
<strong><font color="green">内建命令</font></strong>:用于打开指定链接。打开的处理逻辑在支持[turbolinks](https://github.com/turbolinks/turbolinks)及[pjax](https://github.com/defunkt/jquery-pjax)相应功能的基础上，实现了WIDE上一版本所支持的VIEW功能,并扩展VIEW的特性，允许多个URL同时请求，并根据其回应的MIME自动处理。也支持直接引用本地模板，或者网络文件中的模板。
@exports net
@method open
@static
@param {array|object} params
1. url|0(读取self的**url**属性) : 请求打开的URL数组。数组以' '(空格)分割。可以通过'\ '来转义。对于每个URL,可以使用es6 string template。此时，使用refEle所确定的名称空间的变量。在发送服务器请求时，会将‘#’后的内容裁掉，并在有回应后，更新url地址时加入#号(如果不更新URL，也会更新hash部分)。如果URL只有#，则等效于**content**属性给出值，并可能通过\#?附加部分vm变量更新。注意#的一些扩展:
 - \#? 后续内容是VM变量更新。
 - \# 后续内容引用模板或者锚的ID。
url的回应，根据其mine-type来决定:
 - 如果是HTML，更新target的内容为返回内容。
 - 如果是图片，视频，PDF等资源，并且目标元素是对应的类型，直接重置其URL。否则，替换目标元素的内容。
 - 如果是JSON，使用目标元素做refEle,执行其回应。
 - 如果是markdown，转化为HTML，并继续执行。
2. target|1(读取self的**target**属性): 如下几个值中的一个(默认为_self):
 - _self: 目标文档载入并显示在相同的框架或者窗口中作为源文档
 - _blank: 在新窗口中打开被链接文档。
 - _parent: 在父框架集中打开被链接文档。
 - _top: 在整个窗口中打开被链接文档。
 - framename: 在指定的框架中打开被链接文档。如果framename指示了一个view,则更新此view的src属性.
 - \*g:selector: 全局索引的selector(可能多个)。
 - \*p:selector: 符合selector的父节点(0或一个)。如果selector未给出，则为*p:[data-wwclass=view]
 - \*c:selector: 符合selector的直接子节点(可能多个)。
 - \*d:selector: 符合selector的后代(descendant,可能多个)。
3. method|2(读取self的属性**data-method**): 请求方法，统一应用在所有的URL请求上，默认是GET。如果target是一个form，则采用form中的method,如果form没有method,并且包含了文件字段，则默认使用POST。
4. before|3(读取self的属性**data-before**): target替换前的动画。默认是target元素上的渐隐。
5. after|4(读取self的属性**data-after**), target替换后的动画。默认是target元素上的渐显以及min(max)-width(height)的transition。
6. content|5(读取self的属性**data-content**): 这里的内容被当作HTML内容注入到targt中去。注意“#”开头引用本地层或锚定元素ID。这一属性等效于URL直接使用`#XXXXX`。
7. notdisable|6(读取self的属性**data-notdisable**): 不再禁止target及refEle。可能的值为:
 - true|all|yes: 不禁止两者.
 - target: 不禁用target.
 - self: 不禁用self.
8. noerror|7(读取self的属性**data-noerror**): 不使用ui.showMessage报错。

@param {Element} [refEle=undefined] 获取默认参数的元素——这里的参数优先级低于params。并使用此元素做重入判定，如果没有指定元素，不执行重入判定。
@param {Event} [evt=undefined] 事件对象，如果给定，会过滤诸如ctrl+点击，从而新窗口打开的情况，不再执行open action。
@return {undefined}
*/
function open (params, refEle, evt) {
  // Middle click, cmd click, and ctrl click should open
  // links in a new tab as normal.
  if (evt && (evt.which > 1 || evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey)) {
    return
  }
  // 保存上下文的变量.
  let context = wwjs.net.extract(params, ['url', 'target', 'method', 'before', 'after', 'content', 'notdisable', 'noerror']) || {}
  if (refEle) {
    context.$refEle = $(refEle)
    context.url = context.url || context.$refEle.attr('href')
    context.target = context.target || context.$refEle.attr('target')
    context.method = context.method || context.$refEle.attr('data-method')
    context.before = context.before || context.$refEle.attr('data-before')
    context.after = context.after || context.$refEle.attr('data-after')
    context.content = context.content || context.$refEle.attr('data-content')
    context.notdisable = context.notdisable || (context.$refEle.attr('data-notdisable') === 'true')
    context.noerror = context.noerror || (context.$refEle.attr('data-noerror') === 'true')
  }
  if (!context.url && !context.content) {
    return
  }
  // try to get target element.
  context.$target = getTarget(context)
  if (!context.$target) { // 没有需要更新的目标对象。
    return
  }
  return Promise.pipe([
    function () {
      // parse url info to context.
      //
      // 检查是否需要从网络获取内容。
    },
    function () {
      disableElePair(true, context)
    },
    function () {
      if (context.before) {
      }
    },
    function () {
      // do replace.
      if (context.content) {
        if (context.content.startsWith('#')) {
          procHashURL(context.content)
        } else {
          context.$target.html(context.content)
        }
      } else { // url.
        let urlArray = str.split(context.url, ' ', '\\')
        let tasks = []
        for (let i = 0; i < urlArray.length; i++) {
          tasks.push(procURL(urlArray[i], context))
        }
        return Promise.all(tasks)
      }
    },
    function () {
      if (context.after) {

      }
    },
    function () {
      disableElePair(false, context)
    }
  ])
}

export default {
  open: open
}
