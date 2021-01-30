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
// Created At : 2018-11-08T16:53:47.078Z by masol (masol.li@gmail.com)

'use strict'

/**
ko模块利用[knockoutjs](https://knockoutjs.com/)来分离元素及数据逻辑。
@module ko
*/

// import ko from 'knockout'
import mapping from './mapping'
import EE from '../utils/evt'
import cfg from '../utils/cfg'
import VM from './viewmodel'
import ns from './ns'
import attr from './attr'
import file from './file'
import state from '../utils/state'

ko.mapping = mapping
// @see https://knockoutjs.com/documentation/deferred-updates.html
ko.options.deferUpdates = true

// 代码中描述的属性，但是不工作。
// ko.options.deferEvaluation = true

// @see https://knockoutjs.com/documentation/binding-preprocessing.html 但是按照文档，下方代码不工作。
// console.log('ko.bindingHandlers.text.preprocess=', ko.bindingHandlers.text.preprocess)
// ko.bindingHandlers.text.preprocess = function (stringFromMarkup) {
//   // Return stringFromMarkup if you don't want to change anything, or return
//   // some other string if you want Knockout to behave as if that was the
//   // syntax provided in the original HTML
//   return stringFromMarkup
// }
// console.log('ko.bindingProvider.instance.preprocessNode=', ko.bindingProvider.instance.preprocessNode)
// ko.bindingProvider.instance.preprocessNode = function (node) {
//   // Use DOM APIs such as setAttribute to modify 'node' if you wish.
//   // If you want to leave 'node' in the DOM, return null or have no 'return' statement.
//   // If you want to replace 'node' with some other set of nodes,
//   //    - Use DOM APIs such as insertChild to inject the new nodes
//   //      immediately before 'node'
//   //    - Use DOM APIs such as removeChild to remove 'node' if required
//   //    - Return an array of any new nodes that you've just inserted
//   //      so that Knockout can apply any bindings to them
//   console.log(123123)
//   console.log('ko.bindingProvider.instance.preprocessNode=', node)
// }

window.ko = ko

// console.log(attr)
attr()
file()

// 根据配置，拦截并初始化默认绑定的
const notDefRegex = /^([a-zA-Z_$]|[0-9a-zA-Z_$]*) is not defined$/
function initHandler (defVar, handler, element, valueAccessor, allBindings, model, context) {
  let suc = false
  // console.log(model, context)
  do {
    try {
      valueAccessor()
      suc = true
    } catch (e) {
      if (e instanceof ReferenceError && e.message) {
        let matched = e.message.match(notDefRegex)
        if (matched && matched.length > 1) {
          let varName = matched[1]
          if (cfg.strict) {
            suc = true
            console.error(`发现未定义的绑定变量${varName},由于设置为严格模式(cfg.strict),未能自动声明变量。相关元素:`, element)
          } else {
            let value = {}
            /// @TODO 按照utils中的配置，来决定defVar。这允许我们动态设定函数绑定。defVar是一个ko.computed.
            value[varName] = Function.isFunction(defVar) ? defVar(element) : defVar
            wwjs.vm.set(value, wwjs.vm.get(element))
            console.warn(`发现未定义的绑定变量${varName},定义其到默认类型“${typeof defVar}”。相关元素:`, element)
          }
          EE.emit('ko.referror', e, element, varName)
        }
      } else {
        suc = true
        EE.emit('ko.error', e, element)
        console.error(`处理绑定时发生错误：${e}。相关元素:`, element)
      }
    }
  } while (!suc)
  if (Function.isFunction(handler)) {
    return handler.call(this, element, valueAccessor, allBindings, model, context)
  }
}

/**
对init函数做拦截，并自动初始化遭遇的未定义变量到defVar。暴露在window.ko.autoinit名称空间下。这个函数只为需要扩展绑定类型的插件服务，为其添加了如下能力(这两个特性受到[cfg.strict](module-utils_cfg.html)的控制):
- 自动声明未声明变量的能力，兼容任意JS语句中的变量使用。
- 同时添加了如果变量值为false,自动初始化为元素中对应值的能力,此时忽略了变量的js语法的语义。

自动初始化的变量，其值的规则如下:
- class : 元素当前值
- css : ''
- attr : 对应属性的当前值
- style : ''
- let : ''
- visible : 元素当前值
- hidden : 元素当前值
- hasFocus : 元素当前值
- text : 元素当前值
- file : 元素当前值
- html : 元素当前值
- foreach : []
- if : false
- ifnot : false
- with : {}
- using : {}
- enable : 元素当前值
- disable : 元素当前值
- value : 元素当前值
- textInput : 元素当前值
- options : 元素当前值
- selectedOptions : 元素当前值
- checked : 元素当前值
- template : {} //因此，如果name使用变量并且没有定义，依然报错。
- component : {} //因此，如果name使用变量并且没有定义，依然报错。

@todo: 需要参考或改进[knockout-pre-rendered](https://github.com/ErikSchierboom/knockout-pre-rendered)，自动获取当前的HTML中的值做为初始化值?
@exports ko
@access public
@param {string} bindingName 需要拦截的绑定类型，例如attr,foreach,text....
@param {any} [defVar=''] 默认值
@method autoinit
@return undefined
*/
function autoinit (bindingName, defVar) {
  defVar = defVar || ''
  let bindingHandler = ko.bindingHandlers[bindingName]
  if (bindingHandler) {
    let existingInit = bindingHandler.init
    bindingHandler.init = initHandler.bind(bindingHandler, defVar, existingInit)
  }
}
window.ko.autoinit = autoinit

// 被textInput及value两个绑定使用。
function value (element) {
  return element.value
}

// default binding
autoinit('css')
autoinit('attr')
autoinit('style')
autoinit('let')
autoinit('file', (element) => { // 延时向element发出change事件，以触发自动更新到元素当前值。
  setTimeout(() => {
    $(element).trigger('change')
  }, 0)
})
autoinit('class', (element) => {
  return element.className
})
autoinit('visible', (element) => {
  return $(element).is(':visible')
})
autoinit('hidden', (element) => {
  return $(element).is(':hidden')
})
autoinit('hasFocus', (element) => {
  return $(element).is(':focus')
})
autoinit('text', (element) => {
  return element.textContent
})
autoinit('html', (element) => {
  return element.innerHTML
})
autoinit('foreach', [])
autoinit('if', false)
autoinit('ifnot', false)
autoinit('with', {})
autoinit('using', {})
autoinit('enable', (element) => {
  return !element.disabled
})
autoinit('disable', (element) => {
  return !!element.disabled
})
autoinit('value', value)
autoinit('textInput', value)
autoinit('options', (element) => {
  return $.map($(element).children('option'), function (option) {
    return option.value
  }) || []
})
autoinit('selectedOptions', (element) => {
  return $.map($(element).children('option:selected'), function (option) {
    return option.value
  }) || []
})
autoinit('checked', (element) => {
  return element.checked || false
})
autoinit('template', {})
autoinit('component', {})

// for (let name in ko.bindingHandlers) {
//   console.log(name)
// }

/**
ko模块的初始化代码，在DomReady之后，由chk模块调用。负责建立事件监听，以监听新节点的插入，并处理新加入的节点。处理过程:
- 首先检查hash中是否有viewModel串(以#?开头的部分,当作queryString格式)，并使用其内容初始化viewModel,然后建立后续hash变化的相同检查。
- 在进行KO处理之前，对每个加入的节点，发出同步事件(koprepare)，如果事件有监听，则监听代码负责预处理节点，如下响应会被加载，以更新attr,更新viewmodel...
  - 检查data-ns,如果有，更新viewmodel,加入对象，并更新元素,加入with绑定。
  - 检查data-bindvar,如果有，使用data-bindvar属性对viewmodel做初始化更新。(符合namespace)
  - 检查script[type="text/bindvar"],将内容当作viewmodel做初始化更新。(符合namespace,并且可以有函数[computed observer]。[计算型](https://knockoutjs.com/documentation/computed-reference.html)数据的定义，可以通过create option来创建，也可以直接在bindvar脚本中创建，此时this为同级{同ns}viewModel，如果接受参数，则write属性设置，否则pure属性设置。默认都会设置deferEvaluation)
  - 检查script[type="text/wwjs"],执行之
- 对含有data-bind的元素,执行applyBindings
- 更新ko的attr，提供如下两个改进:
 - 定义了'ko.attrChanged'事件，可以在一个元素上$ele.trigger(ko.attrChanged, infoName[, value])来触发attr更新内部值并notify。
 - 定义了'ko.attrMapper'对象，key为属性名,值为形如(element,value,toRemove)的回调函数。——这一特性目前只供内部使用，不要使用插件扩展。
- 增加了file绑定。参考了[knockoutjs-file-binding](https://github.com/TooManyBees/knockoutjs-file-binding)以及[knockout-file-bindings](https://github.com/adrotec/knockout-file-bindings)来支持文件绑定。默认的文件绑定从文件元素读取其内容，并转化为URL，可以直接在img.src中使用。

@exports ko
@access private
@method setup
@return undefined
*/
function setup () {
  VM.setup()
  // 构建事件监听，以保障事件响应顺序。
  EE.on('koprepare', ns.check)
  EE.on('koprepare', VM.check)
}

let depTasks = []
/**
ko可以从如下几个角度扩展:
- 增加新的[自定义绑定](https://knockoutjs.com/documentation/custom-bindings.html)。
- [extender](https://knockoutjs.com/documentation/extenders.html)扩展绑定变量的语义。
- [component](https://knockoutjs.com/documentation/component-binding.html#component-lifecycle)扩展。
以上几个层面的扩展都被wwjs所支持，为了确保绑定之前，绑定所依赖的资源已经被加载，通常我们在[wwjs script](module-chk_script.html)中来加载所需的依赖。并在加载代码中调用ko.dep(Promise)来让ko绑定动作延迟到Promise就绪。
@exports ko
@access public
@method dep
@param {Promise} [task=undefined] 指定需要加入ko依赖池的任务。
@return {array<Promise>} 返回任务依赖池。
*/
ko.dep = function (task) {
  if (task instanceof Promise) {
    depTasks.push(task)
  } else if (Function.isFunction(task)) {
    depTasks.push(task())
  }
  return depTasks
}

/**
ko相关的检查及处理函数。按照如下顺序检查并处理:
- 如果depTask不为空，等待其信号。
- ns#check::检查是否有[data-ns]，如果有处理之。
- VM#check::检查是否有[data-bindvar]属性。
- VM#check::检查是否有[script[type="text/bindvar"]]节点，如果有，处理之。
- self::检查是否有[data-bind]节点，如果有，应用绑定。
@exports ko
@access private
@method check
@return undefined
*/
function check (nodeArray) {
  let procBind = (nodeArray) => {
    let i, item, $item
    // let Notifiers = EE.listeners('koprepare')
    // console.log('Notifiers=', Notifiers)
    for (i = 0; i < nodeArray.length; i++) {
      item = nodeArray[i]
      $item = $(item)
      // if (item.nodeType !== 1) { continue }  //不再需要，已经被chk实现。
      // 2019-3-30之后，不再需要，调用顺序已经被保障。
      EE.emit('koprepare', $item)
      if ($item.is('[data-bind]') || $item.find('[data-bind]').length > 0) {
      // console.log(VM, nodeArray[i])
        if (!ko.dataFor($item.get(0))) { // 如果未绑定过，则开始绑定，否则忽略绑定初始化。
          ko.applyBindings(VM.get(), nodeArray[i])
        }
      }
    }
  }
  // console.log('nodeAdded:', nodeArray, 'ko.options=', ko.options)
  if (depTasks.length > 0) {
    state.push(nodeArray)
    return Promise.all(depTasks).then(() => {
      procBind(nodeArray)
      state.pop(nodeArray)
    }).catch((err) => {
      console.error(`无法处理KO绑定，因为其依赖处理失败:${err}`)
      EE.emit('ko.dep', err, depTasks)
      state.pop(nodeArray)
    })
  }
  return procBind(nodeArray)
}

setup.check = check
ko.check = check

export default setup
