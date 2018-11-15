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

/**
与ko配合的全局数据模型对象。
@module ko/viewmodel
*/

let viewModel = {
  personName: ko.observable('Bob'),
  abcd: ko.observable('test'),
  personAge: ko.observable(123)
}

function parsingRootPath (path) {
  let fenge = []
  let i, k
  for (i = 0, k = 0; i < path.length; i++) {
    if (path[i] === '.' && k === 0) {
      fenge.push(i)
    } else if (path[i] === '[') {
      k++
    } else if (path[i] === ']') {
      k--
    }
  }
  fenge.push(path.length)
  var result = []
  i = 0
  for (let begin, end; i < fenge.length; i++) {
    begin = i === 0 ? 0 : fenge[i - 1] + 1
    end = fenge[i]
    result.push(path.substring(begin, end))
  }

  for (let begin, a, i = result.length - 1; i >= 0; i--) {
    begin = result[i].indexOf('[')
    if (begin >= 0 && result[i][result[i].length - 1] !== ']') {
      console.error('root路径格式不对')
      return false
    }
    a = {}
    if (begin >= 0) {
      a.objName = result[i].substring(0, begin)
      a.index = result[i].substring(begin + 1, result[i].length - 1)
      a.index = isNaN(parseInt(a.index, 10)) ? a.index : parseInt(a.index, 10)
    } else {
      a.objName = result[i]
      a.index = false
    }
    result[i] = a
  }
  return result
}

// copy from wwclass.js version 1
// @TODO 改进从path获取vm的方法
function getVmFromPath (path) {
  function judge (obj, judgeStr) {
    /* eslint no-eval: 0 */
    return eval(judgeStr)
  }
  var rootPath = parsingRootPath(path)
  var rootVm = viewModel
  if (!rootPath) {
    return rootVm
  }

  try {
    for (var i = 0; i < rootPath.length; i++) {
      if (rootPath[i].index === false) {
        rootVm = rootVm[rootPath[i].objName]
      } else if (typeof rootPath[i].index === 'string') {
        rootVm = rootVm[rootPath[i].objName]()
        var linshi = ko.mapping.toJS(rootVm)
        for (var i1 = 0; i1 < linshi.length; i1++) {
          if (judge(linshi[i1], rootPath[i].index)) {
            break
          }
        }
        if (i1 === linshi.length) {
          throw new Error("can't find rootVm")
        } else {
          rootVm = rootVm[i1]
        }
      } else {
        rootVm = rootVm[rootPath[i].objName]()[rootPath[i].index]
      }
    }
  } catch (e) {
    rootVm = false
    console.error('get root vm error', e)
  }
  return rootVm
}

/**
按照条件获取对应的数据模型。之所以命名为viewModel是为了强调这个模型主要用于控制UI——其数据更新的周期默认依赖绘制(RequestAnimationFrame)。
@exports ko/viewmodel
@method get
@param {String|Element} [pathOrele] 需要获取的路径，可以传入一个元素，用于获取其对应的ViewModel。默认从根路径下开始获取。
@param {String} [format] 需要获取的格式，当前支持`json`,`observable`。如果不给参数，默认返回`observable`格式。
@return {Object} 获取到的ViewModel.
*/
function get (pathOrele, format) {
  let vm
  if (pathOrele) {
    if (pathOrele instanceof Element) {
      let $ctx = ko.dataFor(pathOrele)
      if ($ctx) {
        vm = $ctx.$data
      }
    } else if ($.isString(pathOrele)) {
      vm = getVmFromPath(pathOrele)
    }
  }
  vm = vm || viewModel
  if (format === 'json') {
    return ko.mapping.toJS(vm)
  }
  return vm
}

/**
在给定模型上更新数据
@exports ko/viewmodel
@method set
@param {object} value 需要设置的数据。
@param {object} [$data=get()] 更新的根对象，默认从根路径下开始更新。
@param {Boolean} [overwritten=false] 如果目标属性已经存在，是否覆盖？
@return {Boolean} 如果成功更新，则返回true.
*/
function set (value, $data, overwritten) {
  $data = $data || get()
  if (overwritten) {
    ko.mapping.fromJS(value, $data)
  } else {
    let models = ko.mapping.fromJS(value)
    $.each(models, (key, value) => {
      if (!$data.hasOwnProperty(key)) {
        $data[key] = value
      }
    })
  }
}

function procBindvar () {
  let ele = this
  const bindObj = json.parse(ele.getAttribute('data-bindvar'))
  if (bindObj.value) {
    set(bindObj.value, get(ele), false)
  }
}

EE.on('koprepare', ($ele) => {
  let nsItems = $ele.find('[data-bindvar]')
  if (nsItems.length > 0) {
    nsItems.each(procBindvar)
  }
  if ($ele.is('[data-ns]')) {
    procBindvar.call($ele[0])
  }
})

export default {
  get: get,
  set: set
}
