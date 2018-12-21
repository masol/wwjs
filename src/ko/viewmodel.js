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
// Created At : 2018-11-13T12:53:36.079Z by masol (masol.li@gmail.com)

'use strict'

import ko from 'knockout'
import EE from '../utils/evt'
import json from '../utils/json'
import cfg from '../utils/cfg'
import ObjectPath from 'objectpath'

// console.log(ObjectPath)

/**
与ko配合的全局数据模型对象。
@module ko/viewmodel
*/
let viewModel

/**
将viewModel重置为初始状态。如果已有绑定，这些绑定会被固化(也就是不再响应数据变动)，重置之后的vm只影响新加入的元素。这个函数在ko就绪时会被调用一次。
@exports ko/viewmodel
@method reset
@return {undefined}
*/
function reset () {
  viewModel = ko.mapping.fromJS({})
}

/**
按照条件获取对应的数据模型。之所以命名为viewModel是为了强调这个模型主要用于控制UI——其数据更新的周期默认依赖绘制(RequestAnimationFrame)。
注意，获取时未考虑未初始化的foreach绑定带来的名称空间计算。如有需要，再加入此特性支持。
@exports ko/viewmodel
@method get
@param {String|Element} [pathOrEle=''] 需要获取的路径，传入一个元素或Javascript的对象访问语句，用于获取对应的ViewModel。默认从模型的根路径开始。
@param {String} [format] 需要获取的格式，当前支持`json`,`observable`。如果不给参数，默认返回`observable`格式。
@param {Element} [parent=$container] 给出父元素。只有在地一个参数为path时才会被使用，用来确定path所指定的根路径。
@return {Object} 获取到的ViewModel.
*/
function get (pathOrEle, format, parent) {
  let vm = viewModel
  if (pathOrEle instanceof Element) {
    // 元素可能尚未初始化，寻找包含自身在内的地一个包含data-ns元素的父，未考虑未初始化的foreach
    let elem = pathOrEle
    let $data, nsName, $ctx
    let path = []
    for (; elem && elem !== document; elem = elem.parentNode) {
      $ctx = ko.dataFor(elem)
      if ($ctx) {
        $data = $ctx.$data
      }
      nsName = elem.getAttribute('data-ns')
      if (nsName) {
        path.push(nsName)
      }
      if ($data) {
        break
      }
    }
    $data = $data || viewModel
    let i = path.length - 1
    for (; i >= 0; i--) {
      let $dp = $data[path[i]]
      if (typeof $dp === 'object') {
        $data = $dp
      } else if (typeof ($dp) === 'function') {
        $data = $dp()
      } else {
        $data = undefined
      }
      if (!$data) {
        EE.emit('error', 'vm.get.invalidPath', pathOrEle)
        break
      }
    }
    vm = $data
  } else if (typeof pathOrEle === 'string') {
    let current = get(parent)
    const pathParts = ObjectPath.parse(pathOrEle)
    let i = 0
    for (; i < pathParts.length; i++) {
      const part = pathParts[i]
      current = current[part]
      if (!current) {
        break
      }
    }
    vm = current
  }
  if (vm && format === 'json') {
    return ko.mapping.toJS(vm)
  }
  return vm
}

// 深度检查value中的值在$data中是否存在，如果不存在，加入到filterValue中. Array类型被忽略，只有一个和有n个都认为被初始化了。
function deepFilter (filterValue, value, $data) {
  let key
  for (key in value) {
    if (!$data[key]) { // observable value.
      filterValue[key] = value[key]
    } else if (typeof value[key] === 'object') {
      deepFilter(filterValue[key], value[key], $data[key]())
    }
  }
}

/**
在指定的路径(元素代表的路径)更新数据。对于数字/时间/字符串等基础类型，相同的值不会触发界面更新。对于数组内元素，如果元素的`key`属性相同，会被视为相同元素更新，否则会被删除重新加入。
@exports ko/viewmodel
@method set
@param {object} value 需要设置的数据。
@param {object} [$data=null] 更新的对象，默认从根路径(全局viewmodel对象)下开始更新。这个对象可以通过元素的`dataFor(ele)`来获取。
@param {Boolean} [overwritten=false] 如果目标属性已经存在，是否覆盖？
@return {Boolean} 如果成功更新，则返回true.
*/
function set (value, $data, overwritten) {
  let key, models, v
  $data = $data || get()
  // console.log('$data=', $data)
  // 过滤方式: 完全利用ko.mapping.formJS来工作，以防止ko.mapping.toJS工作不正常。
  let filterValue = value
  if (!overwritten) {
    filterValue = {}
    deepFilter(filterValue, value, $data)
  }

  try {
    // 输入三个参数,第二个是mapping option，以确保将$data当作target,而不是判定其是否包含`__ko_mapping__`属性。
    ko.mapping.fromJS(filterValue, {}, $data)
  } catch (ex) {
    if (cfg.vmtypecvt && ex instanceof TypeError) {
      // console.log(ex)
      // @FIXME: 此时,ko.mapping.toJS工作不正常了,需要进入ko.mapping.toJS代码来，打开上面的log来检查细节
      // 类型不同时，重新设置为新类型.
      models = ko.mapping.fromJS(filterValue)
      // console.log('models=', models, 'exceptions = ', ex)
      for (key in models) {
        // if (key === '__ko_mapping__') {
        //   continue
        // }
        v = models[key]
        // console.log('key=', key, 'v=', v)
        // console.log('before assign 1')
        if (typeof ($data[key]) === 'function') {
          $data[key](v)
        } else {
          $data[key] = v
        }
        // console.log('after assign 2')
      }
    } else {
      EE.emit('error', 'vm.typeerror', ex)
    }
  }
}

function procBindvar () {
  let ele = this
  // console.log('data-bindvar=', ele.getAttribute('data-bindvar'))
  const bindObj = json.parse(ele.getAttribute('data-bindvar'))
  // console.log('bindObj=', bindObj)
  if (bindObj.value) {
    // console.log(1, 'get(ele)=', get(ele))
    set(bindObj.value, get(ele), false)
    // console.log(get(null, 'json'))
  } else {
    if (cfg.debug) {
      console.error(`分析data-bindvar的值时发生错误:${bindObj.error}`)
    }
    EE.emit('error', 'bindvar', bindObj.error)
  }
}

EE.on('koprepare', ($ele) => {
  if ($ele.is('[data-bindvar]')) {
    procBindvar.call($ele[0])
  }
  let nsItems = $ele.find('[data-bindvar]')
  // console.log('nsItems=', nsItems)
  if (nsItems.length > 0) {
    nsItems.each(procBindvar)
  }
})

export default {
  get: get,
  set: set,
  reset: reset
}
