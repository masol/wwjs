// / //////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// / //////////////////////////////////////////////////////////////////////////
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

/**
检查依赖库变量，是否有以`@`开头的URL,如果有，按照`cfg.libbase`中定义的路径替换。
@exports utils/loadjs
@method resolve
@param {string|array} deps bundle依赖库。
@return {string|array} 使用`cfg.libbase`替换以`@`开头的库地址之后的字符串或数组(数组内元素已被替换)。
*/
function resolve (deps) {
  if (typeof (deps) === 'string') {
    if (/^(css!@|img!@)/.test(deps)) {
      return deps.replace('@', cfg.libbase)
    } else if (deps.length > 0 && deps[0] === '@') {
      return cfg.libbase + deps.substr(1)
    }
  } else if ($.isArray(deps)) {
    let i = 0
    for (i; i < deps.length; i++) {
      deps[i] = resolve(deps[i])
    }
  }
  return deps
}
loadjs.resolve = resolve

/**
依次对所有依赖的字符串元素调用`loadjs.done`
@exports utils/loadjs
@method alldone
@param {string|array} bundles bundleName或者url描述的依赖库。
@return {undefined}
*/
function alldone (deps) {
  if (typeof (deps) === 'string') {
    loadjs.done(loadjs.resolve(deps))
  } else if ($.isArray(deps)) {
    let i = 0
    for (i; i < deps.length; i++) {
      deps[i] = alldone(deps[i])
    }
  }
}

loadjs.depDone = alldone

function checkLoaded (attrName, eleSet, path) {
  if (eleSet && eleSet.length) {
    for (let i = 0; i < eleSet.length; i++) {
      var ele = eleSet[i]
      if (ele[attrName] === path) {
        return true
      }
    }
  }
  return false
}
const loadChecker = {
  'script': (path) => {
    return checkLoaded('src', document.scripts, path)
  },
  'style': (path) => {
    return checkLoaded('href', document.styleSheets, path)
  }
}
function defaultBefore (path, scriptEl) {
  // debugger
  scriptEl.crossOrigin = 'anonymous'
  scriptEl.setAttribute('defer', 'defer')
  scriptEl.removeAttribute('async')
  let checker = loadChecker[scriptEl.tagName]
  if ($.isFunction(checker)) {
    return !checker(path)
  }
}

/**
请使用`loadjs.load()`而不是`loadjs()`，这会提供如下两个特征:
- 自动resolve所有依赖库。
- 为依赖库添加bundlename以方便bundle复用: bundle规则由参数`bundleTpl`决定。
- 自动添加`scriptEl.crossOrigin = 'anonymous'`以允许跨域访问。
@exports utils/loadjs
@method load
@param {string|array} deps 依赖库的路径，这里只能使用URL，不能使用bundleName。
@param {function|object} [options] 加载成功的回调函数或者更详细的加载定义对象。如果是对象，格式如下:
{
'success' : Function
'error' : Function
'before' : Function // 如果未指定，自动添加`scriptEl.crossOrigin = 'anonymous'`的函数。如果指定，不再添加。
'bundleTpl' : String //bundleName的格式，默认是每个库没有resolve之前的名字:`${name}`
}
@return {undefined}
*/
loadjs.load = function (deps, options) {
  if (!$.isArray(deps)) {
    deps = [deps]
  }
  if (!$.isFunction(options)) {
    options = options || {}
    // 添加默认的before处理。
    if (!options.before) {
      options.before = defaultBefore
    }
    // options.async 默认为false。
    if (options.async !== true) {
      options.async = false
    }
  }

  const bundleNameArray = []
  for (let i = 0; i < deps.length; i++) {
    const url = loadjs.resolve(deps[i])
    const bundleTpl = options.bundleTpl
    const bundleName = bundleTpl ? window.Template(bundleTpl, { name: url }) : url
    bundleNameArray.push(bundleName)
    if (!loadjs.isDefined(bundleName)) {
      // 这里不能直接传入options.否则其中如果定义了回调的话，与后面ready的回调相叠加，会被调用两次。
      loadjs(url, bundleName, {
        before: options.before,
        async: options.async
      })
    }
  }
  return loadjs.ready(bundleNameArray, options)
}

/**
给出类似npm包格式的字符串，拼接出完整url。拼接后的格式为:
`@/${prefix}/${name}/${version}/${fname}`
@exports utils/loadjs
@method url
@param {String} name  类似npm包格式的字符串。如果未指定版本号，默认为`latest`
@param {String} [prefix='@wwclass'] 包前缀，用于支持多个包类型。
@param {String} [fname='index.min.js'] 文件名。
@return {String} 拼接后的完整URL，带有`@`前缀。
**/
loadjs.url = function (name, prefix, fname) {
  const nameParts = name.split('@')
  const version = nameParts[1] || false
  name = nameParts[0]
  // console.log('wwclsMap[name]=', wwclsMap[name])
  return `@/${prefix || '@wwclass'}/${name}/${version || 'latest'}/${fname || 'index.min.js'}`
}

export default loadjs
