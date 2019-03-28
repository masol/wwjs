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
import ui from '../utils/ui'
import EE from '../utils/evt'
import commands from './commands'

/**
网络命令协议模块，用于通过网络传输可复用代码(通常从服务器传输到客户端，当然，wwjs的客户端逻辑也依赖本模块)，模块的重点在于依赖解耦。所有的函数调用，除了浏览器支持的代码外，依赖环节的函数调用被自动加载并执行。因此，所有依赖的函数调用，都是Promise Style的。

虽然本模块不涉及格式，推荐服务器/客户端传输的默认格式为JSON，其中包含了一系列语句，每个语句被解析为一个函数调用(eval是其中一个)。其它格式最终都转为JSON格式来执行。因此，net模块的默认实现采用了JSON格式。支持的内建命令如下:
- [eval](module-net_commands.html#.eval)
- [open](module-net_commands.html#.open)
- [updatelv](module-net_commands.html#.updatelv)
- [vmArrFuc](module-net_commands.html#.vmArrFuc)
@module net
*/

let cmds = commands

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
  url = pkgArray[0]
  if (pkgArray.length >= 2) {
    subName = (pkgArray.length > 2) ? pkgArray.slice(1).join('') : pkgArray[1]
  }
  let ret = internalGetCmd(url, subName)
  if (!ret && !noAutoLoad) {
    if (url.length > 1 && url[0] === url[1] === '@') {
      url = loadjs.url(url.substr(2), '@wwcmd')
    }
    // try loading functor.
    return new Promise((resolve, reject) => {
      loadjs.load(url, {
        success: function () {
          ret = internalGetCmd(url, subName)
          if (ret) {
            resolve(ret)
          } else {
            let timer = setTimeout(function () {
              EE.off('command.reg', waiter)
              EE.emit('error', 'net.invalidCmd', url, name)
              reject(new Error('net.invalidCmd'))
            }, 10000)
            let waiter = (name, handler) => {
              if (name === url) {
                clearTimeout(timer)
                ret = internalGetCmd(url, subName)
                resolve(ret)
              }
            }
            EE.on('command.reg', waiter)
          }
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

function trans (transformName, origContent, refEle) {
  if (transformName) {
    return run([transformName, origContent], refEle)
  }
  return origContent
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
@param {Element} [refEle=currentScript] 触发此命令的元素。如果未指定，尝试调用currentScript来获取当前脚本对应的元素对象(如果代码位于回调中或浏览器不支持，currentScript会返回null)。
@param {string} [transName=undefined] 对命令做解析的过滤转化器，默认过滤转化器直接拷贝全部原始内容。如果提供，这是一个标准的net command。会递归调用run来获取转化以后的格式，接受一个参数就是原始cmd内容。
@return {any} 如果执行成功，返回值由处理器确定，否则返回false.
*/
function run (cmd, refEle, transName) {
  let name, params
  refEle = refEle || ui.currentScript()
  return Promise.resolve(trans(transName, cmd)).then((cmd) => {
    if (Array.isArray(cmd) && cmd.length > 0) {
      name = cmd[0]
      if (cmd.length > 1) {
        params = cmd.slice(1)
      } else {
        params = []
      }
    } else if (typeof cmd === 'object') {
      name = cmd.command
      params = cmd.params || []
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

// if (!cmds) { // 注册内部命令。
//   cmds = {
//     updatelv: updatelv,
//     eval: evalStr,
//     open: open,
//     vmArrFuc: vmArrFuc
//   }
// }

export default {
  cmd: getCmd,
  reg: reg,
  run: run,
  trans: trans
}
