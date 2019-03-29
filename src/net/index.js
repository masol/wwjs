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
import getopts from 'getopts'

/**
一、问题:

  我们很多应用场合，例如服务器回应的处理，事件绑定之后的逻辑处理，都是一段代码，也就是命令。这些命令在浏览器下执行，需要使用Javascript来书写。传统的做法，需要在浏览器下提前把代码写好，然后服务器/事件回调/peer通知来调用对应代码。而清晰应该执行何种命令的源端是事件发起端、服务器代码端。尤其是模块开发人员，通常都给出使用说明来让使用模块的人拷贝代码。为了解决这一问题，我们将代码依赖自动加载，以允许代码就地执行。

二、模块说明:

  网络命令传输模块，用于通过网络传输命令(通常从服务器传输到客户端，当然，wwjs的客户端逻辑也依赖本模块)，由于一个命令会调用特定环境的代码，因此本模块的重点在于依赖解耦。为了解决依赖解藕问题，net模块所有的函数调用，除了浏览器支持的代码外，依赖环节的函数调用被自动加载并执行。因此，所有依赖的函数调用，都是Promise Style的。

三、参数格式

  常见的参数格式有两种格式:
  1. 命令行模式(bash兼容格式，适合人输入，例如在a>href中使用)
  2. JSON(适合程序之间交换数据)

  本模块默认格式为JSON,但是提供了格式转化器，将bash命令行格式转为JSON。当然，您可以实现自己的转化器，提供统一代码资源地址(code URI)，其他人就可以无缝调用您提供的命令。模块提供了一个方法[extract]()，方便方法实现代码从输入的参数中提取对应的变量。

四、内建支持的命令:

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

/**
@exports net
@method cmdline
@desc 将一个命令行字符串转化为cmd对象以方便执行。本命令不提供变量替换(模板)支持，您需要提前将命令行字符串使用template命令处理之后，将其中的变量展开成普通字符串之后，再行调用本方法。
@param {string} commandline  命令字符串。
@param {object} [options={}] 分析配置。当前尚未支持。
@param {object|null} 如果解析成功，返回可以直接调用run的cmd对象，否则返回null。
*/
function cmdline (commandline) {
  if (commandline && typeof commandline === 'string') {
    let param = getopts(commandline.split(' '))
    if (typeof param === 'object' && param._) {
      let ret = {
        command: param._,
        params: param
      }
      delete param._
      return ret
    }
  }
  return null
}

/**
@exports net
@method run
@desc 在指定元素的名称空间下执行一个命令。之所以把命令名和参数编码在一起，是方便服务器端，返回一组命令，顺序执行。参考内建的[run]()命令。run命令就可以执行一组类似AST结构的语句。从中可以看出这种格式安排的作用。
@param {object|array} cmd  命令对象，如果是对象，格式如下：
`{
command: "命令名，例如@@xxxx#commandName",
params: []|{}
}`
如果是数组，第一个元素是命令名，之后的是参数。
@param {Element} [refEle=currentScript] 触发此命令的元素。如果未指定，尝试调用currentScript来获取当前脚本对应的元素对象(如果代码位于回调中或浏览器不支持，currentScript会返回null)。
@return {any} 如果执行成功，返回值由处理器确定，否则返回false.
*/
function run (cmd, refEle) {
  let name, params
  refEle = refEle || ui.currentScript()
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
}

/**
给定params对象，以及变量位置数组，提取其中的变量，并转化为对象返回。如果params不是一个对象，则将其当作位置变量中的第一个返回对象。
@exports net
@method extract
@param {any} params 命令对象，可能是数组或对象。
@param {array} mapping 命令对象格式映射。例如['abc','test']表示第一个参数名为'abc',第二个参数名为'test'。
@return {object} 如果已经是对象，直接返回，否则按照参数位置返回对应参数。
*/
function extract (params, mapping) {
  let ret = {}
  mapping = mapping || []
  if (Array.isArray(params)) {
    let i = 0
    for (i; i < mapping.length; i++) {
      ret[mapping[i]] = params[i]
    }
  } else if (typeof params === 'object') {
    ret = params
  } else if (mapping.length > 0) {
    ret[mapping[0]] = params
  }
  return ret
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
  extract: extract,
  cmdline: cmdline
}
