'use strict'

// const loader = require('johnnydepp')

function install (callback) {
  let mutationReady = false
  // let fetchReady = false

  const polyfillReady = () => {
    if (mutationReady) {
      if (window._debug && typeof callback !== 'function') {
        console.error(`传入polyfill::install参数callback不是一个有效函数`)
      }
      callback()
    }
  }

  // 同步方式为Promise做polyfill.
  if (typeof Promise === 'undefined') {
    // 这里不能使用webpack split code引入promise-polyfill.因为运行库依赖于promise!!
    // import(/* webpackChunkName: "promise-polyfill" */'promise-polyfill').then(function () {
    //   console.log(arguments)
    //   console.log('loadover')
    // })
    window.Promise = require('promise-polyfill').default
    console.log('window.Promise=', window.Promise)
  }

  // if (typeof fetch === 'undefined') {
  //   window.System.import('//libs.wware.org/whatwg-fetch/latest/fetch.umd.js').then(function (arg1, arg2, arg3) {
  //     fetchReady = true
  //     polyfillReady()
  //   }).catch(function (err) {
  //     window.alert(`当前浏览器不支持fetch,并且无法加载whatwg-fetch文件,错误信息：${err}`)
  //   })
  // }

  if (!window.MutationObserver && !window.WebKitMutationObserver) {
    window.System.import('//libs.wware.org/mutationobserver-shim/latest/mutationobserver.min.js').then(function (arg1, arg2, arg3) {
      mutationReady = true
      polyfillReady()
    }).catch(function (err) {
      window.alert(`当前浏览器不支持mutationobserver,并且无法加载mutationobserver-shim文件,错误信息：${err}`)
    })
  } else {
    mutationReady = true
  }
  polyfillReady()
}

module.exports.install = install
