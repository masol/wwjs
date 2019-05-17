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
import str from '../utils/str'
import EE from '../utils/evt'
import cfg from '../utils/cfg'
import commands from './commands'
import getopts from 'getopts'

/**
一、问题:

  我们很多应用场合，例如服务器回应的处理，事件绑定之后的逻辑处理，都是一段代码，也就是命令。这些命令在浏览器下执行，需要使用Javascript来书写。传统的做法，需要在浏览器下提前把代码写好，然后服务器/事件回调/peer通知来调用对应代码。而清晰应该执行何种命令的源端是事件发起端、服务器代码端。尤其是模块开发人员，通常都给出使用说明来让使用模块的人拷贝代码。为了解决这一问题，我们将代码依赖自动加载，以允许代码就地执行。

二、模块说明:

  “可网络传输的命令”模块，用于通过网络传输命令(通常从服务器传输到客户端，当然，wwjs的客户端逻辑也依赖本模块)，由于一个命令会调用特定环境的代码，因此本模块的重点在于依赖解耦。为了解决依赖解藕问题，net模块所有的函数调用，除了浏览器支持的代码外，依赖环节的函数调用被自动加载并执行。因此，所有依赖的函数调用，都是Promise Style的。

  net模块假设所有的函数都是无状态的(stateless)，如果需要维护状态，需要通过[依赖注入](https://en.wikipedia.org/wiki/Dependency_injection)的方式来解决，在无注入时也需要提供默认值。wwjs中，如果需要页面生存期，默认存储可以使用wwjs.state[ACTIONNAME]来维护自己的状态(伪单页刷新会自动清空)，应用打开生存期可以使用window.state[ACTIONNAME],session生存期可以使用localstorage，当然也可以使用其它服务器端存储点——这完全是由函数实现者维护的。

三、其它技术框架对比:

  1. 与ROUTE的对比:
  wwjs将action、route更明确的分离。现有的route库是从服务器端移植过来的，其选择器为URL(而不是浏览器中的css selector)，通过编码URL为类似`#/actonName/param1:XX/param2:XX`的格式，来指定一个命令调用。这种语法更类似于cmdline的变形。也被wwjs所支持。但是这里缺少了浏览器里真正的ROUTE，当哪些元素的何种事件发生时，执行“ROUTE”指定的命令。这种真正的ROUTE语法，可以参考[Backbone.View's events object](https://backbonejs.org/#View-delegateEvents)，以'click .btn'的格式来指定何种元素发生何种事件时，mapping到一个动作。概念上，net模块只维护命令集，关于ROUTE部分，浏览器端由evtmap模块(通过chk变为全自动)维护，服务器端没有额外维护，只是提供了一组命令原语维护。<br>
  现有的ROUTE库，无论[path-to-regexp](https://github.com/pillarjs/path-to-regexp)、[route-parser](https://github.com/rcs/route-parser)、[path-parser](https://github.com/troch/path-parser)都需要提前设置模板(regex)，这与wwjs中无限action的理念是冲突的，因此wwjs提供的urlstr函数对route风格字符串的格式设计与现行route类似但有区别:
   - /分割的最后一个(文件名)是命令，前面的都被解析为参数。
   - 参数部分使用:做分割符，在路径中指明参数名称。
   - 参数部分如果没有提供分割符，则自动将其转化为数组，转为标准COMMAND格式。

  2. JQuery事件绑定:
  JQuery事件绑定风格的action映射，包括上文提及的backbone中的抽象，由于执行环境的变化，对库开发者不友好——或者换言之，对库使用者不友好，因为需要处理一大堆依赖，自动解决依赖也是requirejs之类依赖包管理器被引入的一个重要原因。wwjs尝试让action可以通过网络传输，从而彻底分离两者。这使得通过HTML标准的属性标签来描述事件成为可能(类似a>href这样的内建属性)以及bootstrap扩展的data-toggle属性。wwjs这样的处理机制更为通用，同时保持了(a>href)的便利性。

四、安全考虑:

  由于代码可以通过网络任意分发，代码源(提供代码下载的服务器)成为一个重要的安全问题。如果从第三方引入库，那么理论上，第三方服务器可以任意修改你的程序逻辑。wwjs通过引入默认代码源服务器(@,通过wwjs.cfg来修改，参考[utils/cfg模块](module-utils_cfg.html))来集中管理代码源，您可以自建代码源服务器，设置客户端程序只能引入这里的代码来确保安全问题。需要注意的是:这并不能避免代理人攻击，此类攻击手段依然可以篡改您的客户端代码，因此，传统防代理人攻击的技术不能被取代。

五、格式

  wwj支持的命令及其参数的编码格式有三种:
  1. 命令行模式(bash兼容格式，适合人输入，例如在a>href中使用)
  2. JSON(适合程序之间交换数据)
  3. URL格式(route中使用的“/参数１/参数２/命令名”格式)<br>

net模块默认格式为JSON(调用run等函数时传入的参数格式),但是提供了格式转化器，通过[cmdline](#~cmdline)将bash命令行格式转为JSON，通过[urlstr](#~urlstr)将URL格式转化为JSON。当然，您可以实现自己的转化器，提供统一代码资源地址(code URI)，其他人就可以无缝调用您提供的命令。模块提供了一个方法[extract]()，方便方法实现代码从输入的参数中提取对应的变量。

六、内建支持的命令:

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
@desc 根据参数，获取对应的命令对象或处理器。返回的是Promise,只有命令成功注册之后才会返回。如果命令加载失败，或者cfg.cmdTimout(默认10000=秒)时间到达，尚未收到对应的注册事件，Promise会reject。
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
            }, cfg.cmdTimout)
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
    let param = getopts(str.split(commandline, ' ', '\\'))
    if (typeof param === 'object' && param._) {
      let ret = {
        command: Array.isArray(param._) ? param._[0] : param._,
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
@param {object|array|string} cmd  命令对象，如果是对象，格式如下：
`{
command: "命令名，例如@@xxxx#commandName",
params: []|{}
}`
如果是数组，第一个元素是命令名，之后的是参数。
如果是字符串，则当作bash style的命令行来处理。格式为/^\s*(cmdString)(;cmdString)*$/。通过\;来转义分，使得分号不再是一个转义符。命令集以pipe的方式执行。
@param {Element} [refEle=undefined] 此命令涉及的元素。如果未指定，无法确定vm分支。
@param {Event} [evt=undefined] 触发本次命令的event对象，如果不是从action中触发,evt未定义。
@return {any} 如果执行成功，返回值由处理器确定，否则返回false.
*/
function run (cmd, refEle, evt) {
  let name, params
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
  } else if (cmd && typeof cmd === 'string') {
    let cmdArray = str.split(cmd, ';', '\\')
    if (cmdArray.length > 1) {
      return pipe(cmdArray, refEle, evt)
    } else if (cmdArray.length === 1) {
      let cmdLines = cmdline(cmdArray[0])
      if (cmdLines) {
        name = cmdLines.command
        params = cmdLines.params || []
      }
    }
  }
  if (!name) {
    throw new TypeError('invalid cmd format')
  }
  return Promise.resolve(getCmd(name)).then((func) => {
    if (typeof func === 'function') {
      return func(params, refEle, evt)
    }
    throw new URIError(`can not get requested command:${name}`)
  })
}

function promiseRun (promiseRuner, cmdArray, refEle, evt) {
  if (Array.isArray(cmdArray)) {
    let pipeTask = []
    for (let i = 0; i < cmdArray.length; i++) {
      pipeTask.push(wwjs.net.run.bind(this, cmdArray[i], refEle, evt))
    }
    return promiseRuner(pipeTask)
  }
  return wwjs.net.run(cmdArray, refEle, evt)
}

/**
@exports net
@method pipe
@desc 给定一个cmdArray，顺序执行其中的每条命令(pipe)。如果不是数组，等效于[run](#~run)。
@param {object|array|string} cmdArray  命令数组，如果是一个数组，其内部有效元素为[run](#~run)函数的cmd参数的格式。或者这里可以是一个非数组的cmd参数。此时pipe等效于[run](#~run)。
@param {Element} [refEle=undefined] 此命令涉及的元素。如果未指定，无法确定vm分支。
@param {Event} [evt=undefined] 触发本次命令的event对象，如果不是从action中触发,evt未定义。
@return {Promise|any} 如果cmdArray是数组，返回Promise，值解析为pipe中的函数依次执行后，最后一条命令的返回值。
*/
function pipe (cmdArray, refEle, evt) {
  return promiseRun(Promise.pipe, cmdArray, refEle, evt)
}

/**
@exports net
@method all
@desc 给定一个cmdArray，并行执行其中的每条命令(pipe)。如果不是数组，等效于[run](#~run)。
@param {object|array|string} cmdArray  命令数组，如果是一个数组，其内部有效元素为[run](#~run)函数的cmd参数的格式。或者这里可以是一个非数组的cmd参数。此时pipe等效于[run](#~run)。
@param {Element} [refEle=undefined] 此命令涉及的元素。如果未指定，无法确定vm分支。
@param {Event} [evt=undefined] 触发本次命令的event对象，如果不是从action中触发,evt未定义。
@return {Promise|any} 如果cmdArray是数组，返回Promise，值解析为pipe中的函数依次执行后，最后一条命令的返回值。
*/
function all (cmdArray, refEle, evt) {
  return promiseRun(Promise.all, cmdArray, refEle, evt)
}

/**
给定params对象，以及变量位置数组，提取其中的变量，并转化为对象返回。如果params不是一个对象，则将其当作位置变量中的第一个返回对象。
@exports net
@method extract
@param {any} params 命令对象，可能是数组或对象，如果指定了其它类型(数字，字符串)，为mapping的第一个参数而指定。
@param {array} mapping 命令对象格式映射。例如['abc','test']表示第一个参数名为'abc',第二个参数名为'test'。
@param {DomElement} [refEle=undefined] 默认参数元素: 如果params没有给出对应参数，按照mapping对应名称添加`data-`前缀来获取参数并返回。这允许函数调用者通过refEle来设置默认值(默认值可以绑定到变量上来与绑定变量交互)。
@return {object} 如果已经是对象，直接返回，否则按照参数位置返回对应参数。
*/
function extract (params, mapping, refEle) {
  let ret = {}
  mapping = mapping || []
  if (Array.isArray(params)) {
    let i = 0
    for (i; i < mapping.length; i++) {
      ret[mapping[i]] = params[i]
    }
  } else if (typeof params === 'object') {
    ret = params
  } else if (mapping.length > 0) { // 如果指定了其它类型(数字，字符串)，为mapping的第一个参数而指定。
    ret[mapping[0]] = params
  }
  if (refEle) {
    for (let i = 0; i < mapping.length; i++) {
      let name = mapping[i]
      let attrName = `data-${name}`
      if (!ret.hasOwnProperty(name) && refEle.hasAttribute(attrName)) {
        ret[name] = refEle.getAttribute(attrName)
      }
    }
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
  pipe: pipe,
  all: all,
  extract: extract,
  cmdline: cmdline
}
