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
// Created At : 2018-11-19T12:08:32.567Z by masol (masol.li@gmail.com)

'use strict'

import loadjs from 'loadjs'
import $ from 'jquery'
import cfg from './cfg'
/**
加载器模块，基于[loadjs](https://github.com/muicss/loadjs)。基于两个考虑:
- 经实战，很多库在标准es module下会有问题，说明ES Module尚未普及。例如Bootstrap 4.1.3。因此废弃了[systemjs](https://github.com/systemjs/systemjs)支持。
- 尺寸考量，loadjs比[requirejs](https://requirejs.org/)轻量很多。
@module utils/loadjs
*/

function replaceLibs (deps) {
  if (typeof (deps) === 'string') {
    if (deps.length > 0 && deps[0] === '@') {
      return cfg.libbase + deps.substr(1)
    }
  } else if ($.isArray(deps)) {
    let i = 0
    for (i; i < deps.length; i++) {
      deps[i] = replaceLibs(deps[i])
    }
  }
  return deps
}

/**
请使用`loadjs.load()`而不是`loadjs()`，这会提供如下两个特征:
- 自动将@开头的路径替换为`cfg.libbase`的能力。
- 自动添加`scriptEl.crossOrigin = true`以允许跨域访问。
@exports utils/loadjs
@method load
@param {string|array} deps bundle依赖库。
@param {string} [bundleName=null] 定义一个bundleName,以方便后续`ready`使用。
@param {function|object} [options] 加载成功的回调函数或者更详细的加载定义对象。
@return {undefined}
*/
loadjs.load = function (deps, bundleName, options) {
  deps = replaceLibs(deps)
  let opt
  if (typeof (bundleName) === 'object') {
    opt = bundleName
  } else if (typeof (options) === 'object') {
    opt = options
  }
  if (!opt) {
    const wrapOpt = (param) => {
      if (typeof (param) === 'function') {
        return {
          success: param
        }
      }
      return null
    }
    opt = wrapOpt(bundleName)
    if (opt) bundleName = opt
    if (!opt) {
      opt = wrapOpt(options)
      if (opt) options = opt
    }
  }
  if (opt && !opt.before) {
    opt.before = (path, scriptEl) => {
      scriptEl.crossOrigin = true
    }
  }
  // console.log('in loadjs.load,arguments=', arguments)
  return loadjs(deps, bundleName, options)
}

export default loadjs
