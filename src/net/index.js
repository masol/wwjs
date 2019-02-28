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
// Created At : 2018-12-11T15:10:28.456Z by masol (masol.li@gmail.com)

'use strict'

import loadjs from '../utils/loadjs'
import cfg from '../utils/cfg'
import vm from '../ko/viewmodel'
import trans from './trans'
import EE from '../utils/evt'

/**
JSON格式的网络命令协议模块。命令协议模块，用于解析可以通过网络传输的可扩展命令。
其中默认格式采用JSON，其它格式最终都转为JSON格式来执行。因此，netProtocal模块的默认实现采用了JSON格式。支持的内建命令如下:
- [eval](#.eval)
- [open](#.open)
- [updatelv](#.updatelv)
- [vmArrFuc](#.vmArrFuc)
@module net
*/

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
- 如果给出第三个参数，则指示了当前对应更新的extender.
@param {Element} [refEle=$container] 指示本次更新的DOM元素，通常是发起调用的元素自身。如果未指定，从全局viewModel开始。
@return {boolean|Promise<boolean>} 返回是否更新成功。如果extender需要从网络加载，则返回Promise。
*/
function updatelv (params, refEle) {
  if (!$.isArray(params) || params.length < 1) {
    return false
  }
  let dataValid = false
  if (typeof params[0] === 'string') {
    try {
      params[0] = JSON.parse(params[0])
      dataValid = true
    } catch (e) {}
  } else if (typeof params[0] === 'object') {
    dataValid = true
  }
  if (!dataValid) {
    if (cfg.debug) {
      console.error('更新逻辑视图(updatelv)的参数(params)必须是一个对象。请检查服务器回应的内容，确保返回的对象结构。')
    }
    EE.emit('error', 'net.invalidData', params)
  }
  if (params[1]) { // 指定了根路径。
    console.error('NOT IMPLEMENT PARTIAL UPDATELV with path')
  } else {
    vm.set(params[0], vm.get(refEle), true)
  }
}

/**
<strong><font color="green">内建命令</font></strong>:用于执行任意脚本，并添加vm局部变量。
@exports net
@method eval
@static
@param {array} params 数组至少一项，为需要eval的值。
@param {Element} [refEle=$container] eval时，VM的局部变量由此DOM元素决定。
@exception {net.eval} 如果发生异常，发出error事件，参考[evt模块](module-utils_evt.html)
@return {any} 返回执行结果。
*/
function evalStr (params, refEle) {
  try {
    /* eslint-disable */
    eval(params[0])
    /* eslint-enable */
  } catch (e) {
    if (cfg.debug) {
      console.error('执行eval命令时，发生错误:', e)
    }
    EE.emit('error', 'net.eval', params)
  }
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

let cmds = null
/**
@exports net
@method cmd
@desc 获取一个命令集对象。
@param {String} name  命令集的名称。可能是如下三种:
 - 内建命令: 此时命令集中的命令就一个，因此返回的是function对象。
 - 以@@开头，省略了@/@wwcmd前缀。
 - 以@/开头，默认从libs服务器加载处理器，并以#分割，#之后的部分识别为命令集中需要执行的命令。返回object或function
 - 一个url，以#分割，#之后的部分识别为命令集中需要执行的命令。返回object或function
@param {boolean} [noAutoLoad=false] 不自动加载，默认是false(自动加载)
@return {Promise<function|object>} 最终解析为加载完毕的处理器——注意处理器可能是对象。
*/
function getCmd (name, noAutoLoad) {
  const internalGetCmd = (url, subName) => {
    let ret = cmds[url]
    if (typeof ret === 'object') {
      let result = ret[subName]
      if (!result && !subName) {
        result = ret.default || ret.version
      }
      ret = result
    }
    return ret
  }
  if (!name) {
    return undefined
  }
  const pkgArray = name.split('#')
  let url, subName
  if (pkgArray.length === 2) {
    url = pkgArray[0]
    if (url.length > 1 && url[0] === url[1] === '@') {
      url = loadjs.url(url.substr(2), '@wwcmd')
    }
    subName = (pkgArray.length > 2) ? pkgArray.slice(1).join('') : pkgArray[1]
  }
  let ret = internalGetCmd(url, subName)
  if (!ret && !noAutoLoad) {
  // try loading functor.
    return new Promise((resolve, reject) => {
      loadjs.load(url, {
        success: function () {
          ret = internalGetCmd(url, subName)
          resolve(ret)
        },
        error: function (errFiles) {
          EE.emit('error', 'net.invalidURL', errFiles, name)
          reject(errFiles)
        }
      })
    })
  }
  return ret
}

/**
@exports net
@method reg
@desc 注册一个命令集的处理器。由于默认了全局加载，而不是模块加载方式。因此扩展插件需要在被加载时调用`wwjs.net.reg`函数来自行注册。
@param {String} name  命令集的名称。
@param {function|object} [handler=undefined] 命令集的处理器。可能是函数，也可能是对象。如果传入undefined，则删除此处理器。
@return {function|object} 返回设置之前的旧处理器。
*/
function reg (name, handler) {
  cmds = cmds || {}
  let ret = cmds[name]
  cmds[name] = handler
  EE.emit('command.reg', name, handler)
  return ret
}

/**
@exports net
@method run
@desc 在指定元素的名称空间下执行一个命令。
@param {object|array} cmd  命令对象，如果是对象，格式如下：
`{
command: "命令名，例如@xxxx?commandName",
params: []
}`
如果是数组，第一个元素是命令名，之后的是参数。
@param {Element} [refEle=undefined] 触发此命令的元素。
@return {any} 如果执行成功，返回值由处理器确定，否则返回false.
*/
function run (cmd, refEle, transName) {
  let name, params
  return Promise.resolve(trans.tran(transName, cmd)).then((cmd) => {
    if (window.$.isArray(cmd) && cmd.length > 0) {
      name = cmd[0]
      if (cmd.length > 1) {
        params = cmd.slice(1)
      }
    } else if (typeof cmd === 'object') {
      name = cmd.command
      params = cmd.params
    } else if (typeof cmd === 'string') {
      name = cmd
      params = []
    }
    if (!name) {
      throw new TypeError('invalid cmd format')
    }
    return Promise.resolve(getCmd(name)).then((func) => {
      if (typeof func === 'function') {
        return func(params, refEle)
      }
      throw new URIError(`can not get requested command:${name}`)
    })
  })
}

if (!cmds) { // 注册内部命令。
  cmds = {
    updatelv: updatelv,
    eval: evalStr,
    open: open,
    vmArrFuc: vmArrFuc
  }
}

export default {
  cmd: getCmd,
  reg: reg,
  run: run,
  trans: trans
}
