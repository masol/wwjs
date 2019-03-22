'use strict'

import './modernizr'
import cfg from './cfg'
import loadjs from './loadjs'

const Modernizr = window.Modernizr

/**
@module utils/polifills
@desc 检查浏览器环境，并安装polyfill.
*/

/**
***本函数只是内部使用，这里只是为了说明安装了哪些polyfill，方便检索。我们目标支持版本为ie10+(ie9只是基础支持，确保可以运行，部分特效可能缺失——例如css动画)。<font color="red">预取机制不会早于polyfill执行：如果需要安装polyfill,则预取机制会在polyfill加载后开始工作,表现就是旧版IE加载速度略低，这是正常的</font>**

本函数检查浏览器环境，如果缺少依赖特性，按照下面对特性的定义，从网络下载polyfill并安装。执行完毕之后，在window下安装了对象window.Modernizr，可以使用这个对象来检查浏览器支持。

检查并安装polyfill的特性:
- [es6-promise](https://caniuse.com/#search=promise)。由于不再使用[systemjs](https://github.com/systemjs/systemjs)做loader,不再依赖此特性，当不被支持时，自动安装[promise-polyfill](https://github.com/taylorhakes/promise-polyfill,注意：没有使用[es6-promise](https://github.com/stefanpenner/es6-promise)的原因是尺寸，由于es6-promise从rsvp中抽取，尺寸过大。
- [Notification](https://caniuse.com/#search=Notification),如果不支持，自动安装[HTML5-Desktop-Notifications](https://github.com/ttsvetko/HTML5-Desktop-Notifications).
- [CSS3 object-fit/object-position](https://caniuse.com/#search=CSS3%20object-fit%2Fobject-position),如果不支持，自动安装[object-fit-images](https://github.com/bfred-it/object-fit-images)，图形布局中使用了本特性。
- [requestAnimationFrame](https://caniuse.com/#search=requestAnimationFrame)，目标浏览器只有ie9不被支持，由于这个特性不支持会导致wwjs无法运行，如果未支持，自动调用内建的[polyfill](https://gist.github.com/paulirish/1579671).
- [URL API](https://caniuse.com/#search=URL%20API),如果不被支持，自动安装[URL](https://github.com/webcomponents/URL)
- [Session history management](https://caniuse.com/#search=Session%20history%20management),目标浏览器下，只有ie9不被支持，由于这个特性不支持会导致wwjs无法运行，因此自动打补丁[html5-history-api](https://github.com/devote/HTML5-History-API)
- [ES6 String](https://caniuse.com/#search=ES6),如果不支持，自动补丁[string-polyfills](https://github.com/Sylvain59650/string-polyfills),注意只是String,不是全部class规范，没有使用[es6-shim](https://github.com/paulmillr/es6-shim)
- [classlist](https://caniuse.com/#search=classlist)，自动补丁[eligrey-classlist-js-polyfill](https://github.com/englishextra/eligrey-classlist-js-polyfill)
- [datalist](https://caniuse.com/#search=Datalist%20element)，自动补丁[datalist-polyfill](https://github.com/mfranzke/datalist-polyfill)
- [templatestrings](https://caniuse.com/#search=ES6%20Template%20Literals%20(Template%20Strings),提供了`window.Template`函数来支持动态模板。如果不支持，使用[es6-template-strings](https://github.com/medikoo/es6-template-strings)自动polyfill本函数，使用webpack[引入编译](https://scm.spolo.org/scm/index.html#repositoryBrowser;4nRCOxg5E4;null;es6tpl)一次，如果支持，使用本地函数[es6-dynamic-template](https://www.npmjs.com/package/es6-dynamic-template)
- [Html5 Input Types](https://caniuse.com/#search=input%20types),挨个检查，如果不支持，没有使用[hyperform](https://hyperform.js.org/)，而是按照如下列表安装polyfill.
  - [color](https://caniuse.com/#search=Color%20input%20type),安装
  - [date and time](https://caniuse.com/#search=Date%20and%20time%20input%20types),安装
  - [datetime] 本输入类型请不要使用，使用之前也应该检查环境，未安装此类型的补丁．
  - [range](https://caniuse.com/#search=range) 除了ie9,目标浏览器都已经支持．

提供了检查，但是没有安装polyfill的特性如下，需要自行调用wwimport确认安装。
- [ServiceWorker API](https://caniuse.com/#search=Service%20Workers),提供了检查，并且如果被支持，则加载[workbox](https://developers.google.com/web/tools/workbox/),默认是//libs.wware.org/wwsw/latest/wwsw.js(可以通过配置来配置本地址)，提供了全部图片、视频、html资源的本地静态化缓冲，这同时允许了离线模式。
- [Custom Elements](https://caniuse.com/#search=Custom%20Elements),提供了检查，但是polyfill没有安装，在使用webcomponents前自动加载polyfill.
- [WebRTC Peer-to-peer connections](https://caniuse.com/#search=WebRTC%20Peer-to-peer%20connections),如果不支持，需要自行安装[AdapterJS](https://github.com/Temasys/AdapterJS)
- [Beacon API](https://caniuse.com/#search=Beacon%20API),用于在页面结束前有机会向服务器发送消息，而忽略其回应。
- [webgl](https://caniuse.com/#search=webgl),如果不支持(只有ie9和ie10不被支持)，可以安装[cwebgl](https://github.com/cimaron/cwebgl)
- [Web Audio API](https://caniuse.com/#search=Web%20Audio%20API),如果不支持，自行安装[audiolib.js](https://github.com/jussi-kalliokoski/audiolib.js).
- 图像格式类检查，配合lazyloader,指示请求何种资源：
  - [Webp](https://caniuse.com/#search=WebP%20image%20format),本特性主要用来检查，以明确服务器返回何种格式的图像。配合lazyloader
  - [JPEG XR image format](https://caniuse.com/#search=JPEG%20XR%20image%20format),指示服务器返回何种格式的图像。配合lazyloader.
  - [JPEG 2000 image format](https://caniuse.com/#search=JPEG%202000),指示服务器返回何种格式的图像。配合lazyloader.

依赖特性被安全忽略的如下：
- [CustomEvent](https://caniuse.com/#search=CustomEvent),如果不支持，自动安装[EventListener](https://github.com/jonathantneal/EventListener)
- [Canvas](https://caniuse.com/#search=Canvas) 按照当前支持特性，IE9+都支持，因此此特性不再检查。[cwebgl](https://github.com/cimaron/cwebgl)的polyfill需要canvas支持。
- [Local Storage](https://caniuse.com/#search=localstorage)目标浏览器都已经支持。在客户端缓冲数据中心时被使用。
- [svg](https://caniuse.com/#search=svg) 目标浏览器都已经支持。在保持横纵比布局时使用。
- [video](https://caniuse.com/#search=video) 目标浏览器都已经支持。
- [Web Sockets](https://caniuse.com/#search=Web%20Sockets)，虽然IE9不被支持，但是我们使用[socket io](https://socket.io/)库来支持，因此不需要polyfill.
- [CSS Animation](https://caniuse.com/#search=CSS%20Animation),目标列表中只有ie9不被支持，特效被忽略。
- [Blob URLs](https://caniuse.com/#search=Blob%20URLs),目标列表中，只有ie9不被支持。
- [Data URIs](https://caniuse.com/#search=Data%20URI)，目标列表中，用于图像时是安全的。
- [Web Workers](https://caniuse.com/#search=Web%20Workers).
- [Application Cache](https://caniuse.com/#search=Application%20Cache),目标列表中，只有ie9不被支持。
- [Blob constructor](https://caniuse.com/#search=Blob%20constructor)，目标列表中，只有ie9不被支持。

额外提供的特性检查(Modernizr未提供，额外提供):
- wasm : [WebAssembly](https://caniuse.com/#search=WebAssembly)，在需要使用Java/C/C++/Go等其它语言书写的库时使用。如不支持，需要自行安装[polyfill](https://webassembly.js.org/)。安装完毕之后，通过System.import可以自动导入。
- defprop : [ES5 Object](https://caniuse.com/#search=ECMAScript%205)中的`defineProperty`，Modernizr提供的`es5object`检查尺寸太大(minimize之后增加330字节),如果没有，添加[fix-ie](https://github.com/Alhadis/Fix-IE)，而不是[es5-shim](https://github.com/es-shims/es5-shim)。这一特性视实际使用情况可能作出调整。
- weakmap : [WeakMap](https://kangax.github.io/compat-table/es6/#test-WeakMap)，如果浏览器不支持，自动安装[weakmap-polyfill](https://github.com/polygonplanet/weakmap-polyfill)

Modernizr的一个值组合(chrome Version 70.0.3538.77 (Official Build) snap (64-bit)):
@example
{
beacon: true
customelements: true
defprop: true
datalist: true
es6string: true
fetch: true
jpeg2000: false
jpegxr: false
history: true
mutationobserver: true
notification: true
object-fit: true
objectfit: true
peerconnection: true
promises: true
raf: true
requestanimationframe: true
serviceworker: true
templatestrings: true
urlparser: true
wasm: true
webaudio: true
webgl: true
webp: Boolean{
  alpha: true
  animation: true
  lossless: true
 }
weakmap:true
}
@exports utils/polifills
@access private
@method setup
@param {function} callback  回调函数，当polyfill都已经安装完毕之后，回调——注意，polyfill安装失败只是给出警告，也当作调用正常。回调参数是一个数组，给出安装失败的polyfill。
@return {undefined} 如果没有polyfill需要安装，在返回前调用回调函数。
*/
function setup (callback) {
  let feattested = {
    es6string: false,
    fetch: false,
    history: false,
    mutationobserver: false,
    objectfit: false,
    urlparser: false
  }
  let failedPF = []

  // console.log(window.Modernizr)

  const polyfillReady = () => {
    let i
    for (i in feattested) {
      if (!feattested[i]) {
        return
      }
    }
    if (cfg.debug && typeof callback !== 'function') {
      console.error(`传入polyfill::install参数callback不是一个有效函数`)
    }
    callback(failedPF)
  }

  let polyfillFinish = (featName, errPath) => {
    feattested[featName] = true
    if (errPath) {
      failedPF.push(featName)
      if (cfg.debug) {
        window.alert(`当前浏览器不支持${featName},并且无法加载polyfill文件,错误文件：${errPath}`)
      }
    }
    polyfillReady()
  }

  let noop = () => {}
  let checkFeature = (featName, polyfillURL, done) => {
    done = done || noop
    // console.log('Modernizr=', JSON.stringify(Modernizr))
    if (!Modernizr[featName]) {
      // let bundleName = `_wwpf_${featName}`
      // console.log(`try to load polyfill ${featName} load ok,arguments= `, arguments)
      // if (!loadjs.isDefined(bundleName)) {
      loadjs(loadjs.resolve(polyfillURL), {
        success: function () {
          // console.log(`polyfill ${featName} load ok,arguments= `, arguments)
          polyfillFinish(featName)
          done()
        },
        error: function (errPath) {
          // console.log(`polyfill ${featName} load failed with ${errPath}!!!,arguments= ${arguments}`)
          polyfillFinish(featName, errPath)
          done()
        }
      })
      // }
    } else {
      feattested[featName] = true
      done()
    }
  }

  Modernizr.wasm = (typeof WebAssembly === 'object' && typeof (WebAssembly.instantiate) === 'function')
  Modernizr.defprop = (Object.defineProperty !== 'undefined')
  Modernizr.weakmap = (window.WeakMap !== 'undefined')
  Modernizr.datalist = false
  // 测试代码从(https://stackoverflow.com/questions/7048102/check-if-html-element-is-supported)拷贝而来。
  if ('options' in document.createElement('datalist')) {
    // supported!
    Modernizr.datalist = true
  }

  // // 同步方式为Promise做polyfill.
  // if (!Modernizr.promises) {
  //   // 这里不能使用webpack split code引入promise-polyfill.因为运行库依赖于promise!!
  //   // import(/* webpackChunkName: "promise-polyfill" */'promise-polyfill').then(function () {
  //   //   console.log(arguments)
  //   //   console.log('loadover')
  //   // })
  //   window.Promise = require('promise-polyfill').default
  //   // console.log('window.Promise=', window.Promise)
  // }
  // require('./promise')

  checkFeature('defprop', '@/fix-ie/1.2.1/ie.lteIE9.js', () => {
    checkFeature('promises', '@/promise-polyfill/8.1.0/polyfill.min.js', () => {
      // console.log('promises load ok')
      require('./promise')
      checkFeature('fetch', '@/whatwg-fetch/3.0.0/fetch.umd.js')
    })
    checkFeature('classlist', '@/eligrey-classlist-js-polyfill/1.2.20180112/classList.min.js')
    checkFeature('datalist', '@/datalist-polyfill/1.23.3/datalist-polyfill.min.js')
    checkFeature('es6string', '@/string-polyfills/0.9.1/String.min.js')
    checkFeature('mutationobserver', '@/mutationobserver-shim/0.3.2/mutationobserver.min.js')
    checkFeature('urlparser', '@/%40webcomponents/url/0.7.1/url.js')
    checkFeature('objectfit', '@/object-fit-images/3.2.4/ofi.min.js')
    checkFeature('history', '@/html5-history-api/4.2.10/history.min.js')
    checkFeature('templatestrings', '@/es6tpl/1.0.2/es6tpl.min.js', () => {
      if (Modernizr.templatestrings) {
        window.Template = require('es6-dynamic-template')
        // see https://gist.github.com/malko/b8a432bbb2198ca5d38cd3dc27d40f24 to implement makeTemplate.
        window.makeTemplate = (templateString) => {
          // eslint-disable-next-line no-new-func
          return (templateData) => new Function(`{${Object.keys(templateData).join(',')}}`, 'return `' + templateString + '`')(templateData)
        }
      }
    })
    checkFeature('weakmap', '@/weakmap-polyfill/2.0.0/weakmap-polyfill.min.js')
  })

  // @TODO: 这可以安全的移除，只有IE9以下版本不支持这一函数。
  // @TODO: 将类型检查类代码移到utils/type.js中。
  if (typeof Array.isArray === 'undefined') {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]'
    }
  }
  // if (typeof Function.isFunction === 'undefined') {
  Function.isFunction = function (obj) {
    // underscore method:
    // return !!(obj && obj.constructor && obj.call && obj.apply);
    return !!(typeof obj === 'function')
  }
  // }

  Object.isEmpty = function (obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object
  }

  // 如果没有equestanimationframe(只有ie9,按照[这里](https://gist.github.com/paulirish/1579671)的方案polyfill)
  if (!Modernizr.equestanimationframe) {
    var lastTime = 0
    var vendors = ['ms', 'moz', 'webkit', 'o']
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (func, element) {
        var currTime = new Date().getTime()
        var timeToCall = Math.max(0, 16 - (currTime - lastTime))
        var id = window.setTimeout(function () { func(currTime + timeToCall) },
          timeToCall)
        lastTime = currTime + timeToCall
        return id
      }
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function (id) {
        clearTimeout(id)
      }
    }
  }

  polyfillReady()
}

export default setup
