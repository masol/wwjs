
var system = require('system')
var fs = require('fs')

/* eslint-disable */
/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor (testFx, onReady, onTimeout, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis || 3001
  // < Default Max Timeout is 3s

  var start = new Date().getTime()

  var condition = false

  var interval = setInterval(function () {
    if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
      // If not time-out yet and condition not yet fulfilled
      condition = (typeof (testFx) === 'string' ? eval(testFx) : testFx()) // < defensive code
    } else {
      if (!condition) {
        // If condition still not fulfilled (timeout but condition is 'false')
        console.log("'waitFor()' timeout")
        onTimeout ? onTimeout() : phantom.exit(1)
      } else {
        clearInterval(interval) // < Stop this interval
        // Condition fulfilled (timeout and/or condition is 'true')
        typeof (onReady) === 'string' ? eval(onReady) : onReady() // < Do what it's supposed to do once the condition is fulfilled
      }
    }
  }, 100) // < repeat check every 100ms
};

var page = require('webpage').create()

console.log('Running WWJS tests in Phantom.js')

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function (msg) {
  console.log(msg)
}

// Run the specs against the latest minified build
page.open('file:///' + fs.absolute('./' + (system.args[1] || 'test/runner.html')), function (status) {
  if (status !== 'success') {
    console.log('无法加载测试文件')
    phantom.exit()
  } else {
    waitFor(function () {
      return page.evaluate(function () {
        return document.body.querySelector('.symbolSummary .pending') === null
      })
    }, function () {
      var exitCode = page.evaluate(function () {
        var list = document.body.querySelectorAll('.results > #details > .specDetail.failed')
        if (list && list.length > 0) {
          console.log('')
          console.log(list.length + ' test(s) FAILED:')
          for (i = 0; i < list.length; ++i) {
            var el = list[i]

            var desc = el.querySelector('.description')

            var msg = el.querySelector('.resultMessage.fail')
            console.log('')
            console.log(desc.innerText)
            console.log(msg.innerText)
            console.log('')
          }
          return 1
        } else {
          console.log(document.body.querySelector('.alert > .passingAlert.bar').innerText)
          return 0
        }
      })
      phantom.exit(exitCode)
    }, function () {
      var exitCode = page.evaluate(function () {
        var specs = document.body.querySelectorAll('.results .specSummary')
        console.log('Last test completed:')
        console.log(specs[specs.length - 1].innerText)
      })
      phantom.exit(exitCode || 1)
    })
  }
})

/* eslint-enable */
