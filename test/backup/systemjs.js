// ////////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// ////////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-12T10:55:56.618Z by masol (masol.li@gmail.com)

'use strict'

import 'systemjs/dist/s'
import 'systemjs/dist/extras/amd'
import cfg from './cfg'
// import 'systemjs/dist/extras/named-register'

const System = window.System

const systemJSPrototype = System.constructor.prototype
const instantiate = systemJSPrototype.instantiate
const resolve = systemJSPrototype.resolve
const origImport = systemJSPrototype.import

/* 添加json @see https://github.com/Jamaks/systemjs2-json-plugin/blob/master/index.js */
function loadJson (url, parent, loader) {
  return fetch(url)
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Fetch error: ' + res.status + ' ' + res.statusText + (parent ? ' loading from  ' + parent : ''))
      }
      return res.text()
    })
    .then(function (source) {
      return loader.transform.call(this, url, JSON.parse(source))
    })
    .then(function (source) {
      return [[], function (_export) {
        return {
          setters: [],
          execute: function () {
            _export(source)
          }
        }
      }]
    })
}

let head = false
const isWebkit = !!window.navigator.userAgent.match(/AppleWebKit\/([^ ;]*)/)

/* 添加css @see https://github.com/systemjs/plugin-css/blob/master/css.js */
function systemJS2LoadCss (url, parent, loader) {
  const waitSeconds = 100
  if (!head) {
    head = document.getElementsByTagName('head')[0]
  }

  // Because IE8?
  function filter (arrayLike, func) {
    var arr = []
    forEach(arrayLike, function (item) {
      if (func(item)) { arr.push(item) }
    })
    return arr
  }

  // Because IE8?
  function forEach (arrayLike, func) {
    for (var i = 0; i < arrayLike.length; i++) {
      func(arrayLike[i])
    }
  }

  function webkitLoadCheck (link, callback) {
    setTimeout(function () {
      for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i]
        if (sheet.href === link.href) { return callback() }
      }
      webkitLoadCheck(link, callback)
    }, 10)
  }

  function cssIsReloadable (links) {
    // Css loaded on the page initially should be skipped by the first
    // systemjs load, and marked for reload
    var reloadable = true
    forEach(links, function (link) {
      if (!link.hasAttribute('data-systemjs-css')) {
        reloadable = false
        link.setAttribute('data-systemjs-css', '')
      }
    })
    return reloadable
  }

  var findExistingCSS = function findExistingCSS (url) {
    // Search for existing link to reload
    var links = head.getElementsByTagName('link')
    return filter(links, function (link) { return link.href === url })
  }

  function noop () {}

  function loadCSS (url, existingLinks) {
    return new Promise(function (resolve, reject) {
      var timeout = setTimeout(function () {
        reject(new Error('Unable to load CSS'))
      }, waitSeconds * 1000)
      var _callback = function (error) {
        clearTimeout(timeout)
        link.onload = link.onerror = noop
        setTimeout(function () {
          if (error) { reject(error) } else { resolve('') }
        }, 7)
      }
      var link = document.createElement('link')
      link.type = 'text/css'
      link.rel = 'stylesheet'
      link.href = url
      link.setAttribute('data-systemjs-css', '')
      if (!isWebkit) {
        link.onload = function () {
          _callback()
        }
      } else {
        webkitLoadCheck(link, _callback)
      }
      link.onerror = function (event) {
        _callback(event.error || new Error('Error loading CSS file.'))
      }
      if (existingLinks.length) { head.insertBefore(link, existingLinks[0]) } else { head.appendChild(link) }
    })
    // Remove the old link regardless of loading outcome
      .then(function (result) {
        forEach(existingLinks, function (link) { link.parentElement.removeChild(link) })
        return result
      }, function (err) {
        forEach(existingLinks, function (link) { link.parentElement.removeChild(link) })
        throw err
      })
  };
  // dont reload styles loaded in the head
  var links = findExistingCSS(url)
  if (!cssIsReloadable(links)) { return Promise.resolve('') }
  return loadCSS(url, links)
}

const prefixes = [
  'css!',
  'json!'
]

systemJSPrototype.instantiate = function (url, parent) {
  const loader = this
  // console.log('url =', url)

  if (url === 'jquery') {
    return [[], function (_export) {
      return {
        setters: [],
        execute: function () {
          _export({ $: window.$, jQuery: window.$ })
        }
      }
    }]
  }

  let type = ''
  for (let i = 0; i < prefixes.length; i++) {
    const pre = prefixes[i]
    if (String(url).startsWith(pre)) {
      type = pre
      url = String(url).substr(pre.length)
    }
  }

  if (cfg.debug) {
    console.log(`import类型${type},并且最终URL为${url}`)
  }
  switch (type) {
    case 'json!':
      return loadJson(url, parent, loader)
    case 'css!':
      return systemJS2LoadCss(url, parent, loader)
        .then(function (source) {
          return loader.transform.call(this, url, source)
        })
        .then(function (source) {
          return [[], function (_export) {
            return {
              setters: [],
              execute: function () {
                _export({ id: url })
              }
            }
          }]
        })
  }
  return instantiate.call(this, url, parent)
}
// Hookable transform function!
systemJSPrototype.transform = function (_id, source) {
  return source
}

systemJSPrototype.resolve = function (_id, source) {
  switch (_id) {
    case 'jquery':
      return _id
  }
  let url = String(_id)
  let prefix = ''
  for (let i = 0; i < prefixes.length; i++) {
    const pre = prefixes[i]
    if (url.startsWith(pre)) {
      prefix = pre
      url = String(url).substr(pre.length)
    }
  }

  if (url.length > 0 && url[0] === '@') {
    url = cfg.libbase + url.substr(1)
  }
  // console.log('url =', url)

  return prefix + resolve.call(this, url, source)
}

// 为System添加load函数，以load数组形式的多个依赖。
function load (depArray) {
  if (Array.isArray(depArray)) {
    let i, deps
    deps = []
    for (i = 0; i < depArray.length; i++) {
      let id = depArray[i]
      if (Array.isArray[id]) {
        deps.push(System.load(id))
      } else {
        deps.push(id)
      }
    }
    return Promise.all(deps).then((deps) => {
      let curs = []
      for (i = 0; i < deps.length; i++) {
        let id = deps[i]
        if (Array.isArray[id]) {
          curs.push(id)
        } else {
          curs.push(System.import(id))
        }
      }
      return Promise.all(curs)
    })
  } else if (typeof (depArray) !== 'string') {
    return System.import(depArray)
  }
}

systemJSPrototype.import = function (id, parent) {
  if (Array.isArray(id)) {
    return load(id)
  }
  return origImport.apply(this, arguments)
}

// console.log(System)

export default System
