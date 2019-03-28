/// //////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
/// //////////////////////////////////////////////////////////////////////////
// Created At : 2018-12-20T08:53:28.949Z by masol (masol.li@gmail.com)

'use strict'

import cfg from '../utils/cfg'
import json from '../utils/json'
import vm from '../ko/viewmodel'

/**
@module net/commands
@desc 内建支持的命令集。
*/

/**
<strong><font color="green">内建命令</font></strong>:用于执行任意脚本，并添加vm局部变量。
@exports net
@method eval
@static
@param {array} params 数组至少一项，为需要eval的值。可以是一个Object，此时定义如下:
 {
   str: 'eval string',
   context: basic context object, 将被refEle的变量覆盖。因此只适合做refEle对应变量不存在时的默认变量。
 }
@param {Element|object} [refEle=$container] eval时，VM的局部变量由此DOM元素决定。也可以直接给出JSON对象。注意：VM局部变量的格式是'VM'。
@exception {net.eval} 如果发生异常，发出error事件，参考[evt模块](module-utils_evt.html)
@return {any} 返回执行结果。
*/
function evalStr (params, refEle) {
  if (!Array.isArray(params) || params.length < 1) {
    return false
  }
  let str = params[0]
  let context
  if (typeof str === 'object') {
    context = str.context
    str = str.str
  }
  if (!str) {
    return false
  }
  let targetVM = vm.get(refEle)
  if (!context) {
    context = targetVM
  } else {
    context = {}
    $.extend(context, targetVM)
  }
  let result = json.eval(str, context)
  if (result.error) {
    if (cfg.debug) {
      console.error('执行eval命令时，发生错误:', result.error)
    }
    EE.emit('error', 'net.eval', params, result.error)
  }
  return result.value
}

/**
<strong><font color="green">内建命令</font></strong>:用于更新viewModel的值。
@exports net
@method updatelv
@static
@param {array} params 数组至少一项，最多三项，含义如下：
- 第一个是当前viewModel对应的JSON对象。必须是一个对象。
- 如果给出非空字符串的第二个参数，则指示了更新当前名称空间下指定路径，并且支持几个前缀:
 - $root: 指示从根viewModel开始，而不是当前viewModel。
 - $parent: 指示从父名称空间开始，而不是当前viewModel。
- 如果给出了Object类型的第二个参数，则默认将其当作mapping option。并支持如下格式:
 - options: 如果是字符串类型，则将使用eval将其转为object，如果转化失败，则忽略本参数。如果是object类型，直接使用。
 - path: 字符串类型，含义与第二个参数为字符串时相同。
 - extender:则指示了当前对应更新的extender.(NOT IMPLEMENT)
@param {Element} [refEle=$container] 指示本次更新的DOM元素，通常是发起调用的元素自身。如果未指定，从全局viewModel开始。
@return {boolean|Promise<boolean>} 返回是否更新成功。如果extender需要从网络加载，则返回Promise。
*/
function updatelv (params, refEle) {
  if (!Array.isArray(params) || params.length < 1) {
    return false
  }
  let dataValid = false
  if (typeof params[0] === 'string') {
    let result = json.parse(params[0])
    if (result.value !== undefined) {
      dataValid = true
      params[0] = result.value
    }
  } else if (typeof params[0] === 'object') {
    dataValid = true
  }
  if (!dataValid) {
    if (cfg.debug) {
      console.error('更新逻辑视图(updatelv)的参数(params)必须是一个对象。请检查服务器回应的内容，确保返回的对象结构。')
    }
    EE.emit('error', 'net.invalidData', params)
    return false
  }
  let targetVM
  const rootPrefix = '$root.'
  const parentPrefix = '$parent.'
  let refPath = params[1] ? params[1] : undefined
  let setOption = {}
  switch (refPath) {
    case '$root':
      targetVM = vm.get()
      break
    case '$parent':
      targetVM = vm.get(refEle, 'vm', true)
      break
    default:
      if (typeof refPath === 'object') {
        if (typeof refPath.options === 'object') {
          setOption = refPath.options
        } else if (typeof refPath.options === 'string') {
          setOption = json.eval(refPath.options)
        }
        refPath = refPath.path
      }

      if (refPath) {
        if (refPath.startsWith(rootPrefix)) {
          targetVM = vm.get(refPath.substr(rootPrefix))
        } else if (refPath.startsWith(parentPrefix)) {
          targetVM = vm.get(refPath.substr(parentPrefix), 'vm', vm.get(refEle, 'vm', true))
        } else {
          targetVM = vm.get(refPath, 'vm', refEle)
        }
      } else {
        targetVM = vm.get(refEle)
      }
      break
  }

  if (!targetVM) {
    targetVM = vm.get(refEle)
    console.warn('updatelv未指定targetVM，将内容更新到请求元素对应的路径下。参考请求元素:', refEle)
  }

  vm.set(params[0], targetVM, true, setOption)
}

/**
<strong><font color="green">内建命令</font></strong>:用于打开指定页面。
@exports net
@method open
@static
@param {array} params 数组至少一项，最多三项:
- 第一项为URL。如果未给出，默认为`about:blank`。如果url等于当前url,则刷新本页面。
- 第二项为target,如下几个值中的一个(默认为_self):
 - **_self**: 目标文档载入并显示在相同的框架或者窗口中作为源文档
 - _blank: 在新窗口中打开被链接文档。
 - _parent: 在父框架集中打开被链接文档。
 - _top: 在整个窗口中打开被链接文档。
 - framename: 在指定的框架中打开被链接文档。如果framename指示了一个view,则更新此view的src属性.
- 第三项如果给出，并且第一项未给出，则被当作HTML内容注入到targt中去.
@param {Element} [refEle=$container] 寻找name时，名称空间范围。
@return {boolean} 返回处理结果。
*/
function open (params, refEle) {
  let newURL = wwjs.ns.template(params, refEle)
  if (newURL && window.location.href !== newURL) {
    window.location.href = newURL
  } else {
    window.location.reload()
  }
}

/**
<strong><font color="green">内建命令</font></strong>:执行数组更新
@exports net
@method vmArrFuc
@static
@param {array} params
@param {Element} [refEle=$container] 寻找name时，名称空间范围。
@return {boolean} 返回处理结果。
*/
function vmArrFuc (params, refEle) {
  var sortCompareSet = {
    'numDesc': function (b, a) {
      return parseFloat(a) - parseFloat(b)
    },
    'numAsc': function (a, b) {
      return parseFloat(a) - parseFloat(b)
    },
    'alphaDesc': function (b, a) {
      var sa = String(a)

      var sb = String(b)
      return sa === sb ? 0 : (sa < sb ? -1 : 1)
    },
    'alphaAsc': function (a, b) {
      var sa = String(a)

      var sb = String(b)
      return sa === sb ? 0 : (sa < sb ? -1 : 1)
    }
  }
  function ensureObject (param) {
    if (typeof param === 'string') {
      try {
        param = JSON.parse(param)
      } catch (e) {
        if (cfg.debug) {
          console.error('"' + param + '" 格式错误: 需为json字符串格式')
        }
      }
      return param
    } else if (typeof param === 'object' || typeof param === 'function') {
      return param
    }
  }
  // params[0]为方法; params[1]为数组名; params[2]...其他参数
  function getOperateVm (param) {
    if (!param) {
      return false
    }
    if (typeof param === 'string') {
      // return wwareHelper.getVmFromPath(param)
      console.error('NOT IMPLEMENT update with path')
    }
    if (typeof param === 'function') {
      return param
    }
    return false
  }
  let viewModel = vm.get(refEle)
  if (viewModel && typeof params[1] === 'string' && !viewModel[params[1]]) {
    return false
  }
  var operateVm = getOperateVm(params[1])
  if (operateVm === false) {
    return false
  }

  let i
  switch (params[0]) {
    case 'set':
      var operateObj = operateVm()
      if (!operateObj.length || params.length < 3) {
        return false
      }

      for (i = 2; i < params.length; i++) {
        params[i] = ensureObject(params[i])
        if (params[i]) {
          var obj = params[i]
          var idx = parseInt(obj.idx)
          if (idx < 0) {
            idx = operateObj.length + idx
          }
          if (idx >= 0 && idx < operateObj.length && obj.value) {
            var itemVM = operateObj[idx]
            $.each(obj.value, function (key, value) {
              if (typeof itemVM[key] === 'function') {
                itemVM[key](value)
              }
            })
          }
        }
      }
      break
    case 'push':
      for (i = 2; i < params.length; i++) {
        params[i] = ensureObject(params[i])
        if (params[i]) {
          operateVm.push(ko.mapping.fromJS(params[i]))
        }
      }
      break
    case 'pop':
      params[2] = params[2] || 1
      if (typeof params[2] === 'string') {
        params[2] = parseInt(params[2])
      }
      for (i = 0; i < params[2]; i++) {
        operateVm.pop()
      }
      break
    case 'unshift':
      for (i = 2; i < params.length; i++) {
        params[i] = ensureObject(params[i])
        if (params[i]) {
          operateVm.unshift(ko.mapping.fromJS(params[i]))
        }
      }
      break
    case 'shift':
      params[2] = params[2] || 1
      if (typeof params[2] === 'string') {
        params[2] = parseInt(params[2])
      }
      for (i = 0; i < params[2]; i++) {
        operateVm.shift()
      }
      break
    case 'reverse':
      operateVm.reverse()
      break
    case 'sort':
      /* 首先判定params[2]是否是一个对象。如果是，并且存在 name 以及 sort 两个字段。name 是排序依赖的值，sort 是顺序。
            // */
      let sortFunc
      if (params.length >= 3) {
        var sortObj = ensureObject(params[2])
        switch (typeof sortObj) {
          case 'function':
            sortFunc = sortObj
            break
          case 'object':
            if (sortObj.name) {
              var compareFunc = sortCompareSet[sortObj.sort] || sortCompareSet.alphaAsc
              sortFunc = function (a, b) {
                if (typeof a !== 'object' || typeof b !== 'object') { return 0 }
                var left = a[sortObj.name]
                var right = b[sortObj.name]
                return compareFunc(left(), right())
              }
            }
            break
          default:
            try {
              /* eslint-disable */
              sortFunc = new Function(params[2])
              /* eslint-enable */
            } catch (e) {
              // console.log("不是一个函数");
            }
        }
      }
      operateVm.sort(sortFunc)
      break
    case 'splice':
      if (params.length <= 3) {
        return false
      }
      var startIdx = parseInt(params[2]) || 0
      var count = parseInt(params.length >= 4 ? params[3] : 1) || 1
      var initObj = false
      if (params.length >= 5) {
        initObj = ensureObject(params[4])
      }
      if (initObj) {
        operateVm.splice(startIdx, count, ko.mapping.fromJS(initObj))
      } else {
        operateVm.splice(startIdx, count)
      }
      break
    case 'remove':
      if (typeof params[2] === 'string') {
        params[2] = parseInt(params[2])
      }
      operateVm.remove(operateVm()[params[2]])
      break
    case 'removeAll':
      operateVm.removeAll()
      break
    default:
      ;
  }
}

export default {
  updatelv: updatelv,
  eval: evalStr,
  open: open,
  vmArrFuc: vmArrFuc
}
