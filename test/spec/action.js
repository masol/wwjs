/* eslint no-undef: 0 */

describe('action', function () {
  before(function (done) {
    wwimport('ready', () => {
      $('#wwcontainer').html('')
      done()
    }, (err) => { done(err) })
  })

  it('click正确派遣到默认处理器，并正确添加了"#waitfinish子节点"', function (done) {
    wwjs.ui.$container().append(`<div><a id="action_test_1" href="/test/compatible.html" data-action>TEST1</a></div>`)
    let event = jQuery.Event('click')
    console.log($('#action_test_1').length)
    $('#action_test_1').trigger(event)
    intvalCount = 0
    let intvalID = setInterval(function () {
      if (event.isDefaultPrevented() && $('#waitfinish').length === 1) {
        clearInterval(intvalID)
        done()
      }
      intvalCount++
      // console.log(intCount)
      if (intvalCount === 200) {
        // clearInterval(intvalID)
        // chai.expect(addCount).to.be.equal(1, '多次绘制导致元素被新加入了,不是增量更新了？')
        // chai.expect(renderCount).to.be.above(3, '没有引发多次绘制？')
        // chai.expect(requestCount).to.be.equal(201, '请求数不精准？')
        // EE.off('nodeAdd', testNodeAdded)
        // pThis._runnable.title = `watch有初始值的属性，默认会触发一次,并正确调用了渲染，固定请求了${requestCount}次更新，根据设备环境，只增量更新了${renderCount}次`
        // done()
      }
    }, 10)
  })
})
