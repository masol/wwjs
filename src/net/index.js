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
const Template = require('es6-dynamic-template')

/**
JSON格式的网络命令协议模块。命令协议模块，用于解析可以通过网络传输的可扩展命令。
其中默认格式采用JSON，其它格式最终都转为JSON格式来执行。因此，netProtocal模块的默认实现采用了JSON格式。
@module net
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

function open (params, refEle) {
  let newURL
  if ($.isArray(params) && params.length > 0) {
    newURL = (params[0].indexOf('${') >= 0) ? Template(params[0], vm.get(refEle, 'json')) : params[0]
    if (window.location.href === newURL) {
      newURL = undefined
    }
  }
  if (newURL) {
    window.location.href = newURL
  } else {
    window.location.reload()
  }
}

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
@method getCmd
@desc 获取一个命令处理器。
@param {String} name  命令的名称。可能是如下三种:
 - 内建命令
 - 以@开头，默认从libs服务器加载处理器，并以?分割，?之后的部分识别为包中需要执行的命令。
 - 一个url，以?分割，?之后的部分识别为包中需要执行的命令。
@param {boolean} [noAutoLoad=false] 不自动加载，默认是false(自动加载)
@return {Promise<function>} 最终解析为加载完毕的处理器。
*/
function getCmd (name, noAutoLoad) {
  const internalGetCmd = (url, subName) => {
    let ret = cmds[url]
    if (typeof ret === 'object' && subName) {
      ret = ret[subName]
    }
    return ret
  }
  if (!name) {
    return undefined
  }
  if (!cmds) { // 注册内部命令。
    reg('updatelv', updatelv)
    reg('eval', evalStr)
    reg('open', open)
    reg('vmArrFuc', vmArrFuc)
  }
  const pkgArray = name.split('?')
  let url, subName
  if (pkgArray.length === 2) {
    url = pkgArray[0]
    subName = pkgArray[1]
  }
  let ret = internalGetCmd(url, subName)
  if (!ret && !noAutoLoad) {
  // try loading functor.
    if (!loadjs.isDefined(url)) {
      loadjs(loadjs.resolve(url), url)
    }
    return new Promise((resolve, reject) => {
      loadjs.ready(url, {
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

function reg (name, func) {
  cmds = cmds || {}
  let ret = cmds[name]
  if (typeof func === 'function') {
    cmds[name] = func
  } else {
    cmds[name] = undefined
  }
  return ret
}

function run (cmd, refEle) {
  let name, params
  if (typeof cmd === 'object') {
    name = cmd.command
    params = cmd.params
  } else if (window.$.isArray(cmd) && cmd.length > 0) {
    name = cmd[0]
    if (cmd.length > 1) {
      params = cmd.slice(1)
    }
  }
  if (!name) {
    return false
  }
  return Promise.resolve(getCmd(name)).then((func) => {
    if (typeof func === 'function') {
      return func(params, refEle)
    }
    return false
  })
}

export default {
  get: getCmd,
  reg: reg,
  run: run
}
