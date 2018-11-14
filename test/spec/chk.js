/* eslint no-undef: 0 */

describe('chk', function () {
  before(function (done) {
    wwimport('ready', () => {
      done()
    }, (err) => { done(err) })
  })

  const maxDiv = 1426

  it('异步加入多个元素，多次nodeBeforeAdd回调，一次nodeAdd回调(100ms+RAF延时),数量严格匹配', function (done) {
    let i, j, k, timeid, baCount, t0, naCount
    let pThis = this
    j = 0
    k = 0
    naCount = baCount = 0
    timeid = false
    EE.on('nodeBeforeAdd', function (nodeArray) {
      let hasTestNode = false
      $(nodeArray).each((idx, ele) => {
        if ($(ele).is('[data-wwtest]')) {
          j++
          hasTestNode = true
        }
      })
      if (hasTestNode) baCount++
    })
    EE.on('nodeAdd', function (nodeArray) {
      let hasTestNode = false
      $(nodeArray).each((idx, ele) => {
        if ($(ele).is('[data-wwtest]')) {
          k++
          hasTestNode = true
        }
      })
      if (hasTestNode) naCount++
      if (k >= maxDiv && !timeid) {
        let t1 = performance.now()
        timeid = setTimeout(() => {
          chai.expect(j).to.be.equal(maxDiv, `nodeBeforeAdd收到的元素通知不等于${maxDiv}`)
          chai.expect(k).to.be.equal(maxDiv, `nodeAdd收到的元素事件不等于${maxDiv}`)
          pThis._runnable.title = `异步加入${maxDiv}元素，${baCount}次nodeBeforeAdd回调，${naCount}次nodeAdd回调(100ms+${t1 - t0}ms RAF延时),数量严格匹配`
          done()
        }, 100)
      }
    })
    for (i = 0; i < maxDiv; i++) {
      setTimeout(() => {
        $('body .container').append(`<div id="wwtest${i}" data-wwtest="true"></div>`)
        t0 = performance.now()
      }, 0)
    }
  })

  it('异步删除多个元素，多次nodeBeforeRm回调，一次nodeRm回调(100ms+RAF延时)', function (done) {
    let i, j, k, timeid, baCount, t0, naCount
    let pThis = this
    j = 0
    k = 0
    naCount = baCount = 0
    timeid = false
    EE.on('nodeBeforeRm', function (nodeArray) {
      let hasTestNode = false
      $(nodeArray).each((idx, ele) => {
        if ($(ele).is('[data-wwtest]')) {
          j++
          hasTestNode = true
        }
      })
      if (hasTestNode) baCount++
    })
    EE.on('nodeRm', function (nodeArray) {
      let hasTestNode = false
      $(nodeArray).each((idx, ele) => {
        if ($(ele).is('[data-wwtest]')) {
          k++
          hasTestNode = true
        }
      })
      if (hasTestNode) naCount++
      if (k >= maxDiv && !timeid) {
        let t1 = performance.now()
        timeid = setTimeout(() => {
          chai.expect(j).to.be.equal(maxDiv, `nodeBeforeRm收到的元素通知不等于${maxDiv}`)
          chai.expect(k).to.be.equal(maxDiv, `nodeRm收到的元素事件不等于${maxDiv}`)
          pThis._runnable.title = `异步删除${maxDiv}元素，${baCount}次nodeBeforeRm回调，${naCount}次nodeRm回调(100ms+${t1 - t0}ms RAF延时),数量严格匹配`
          done()
        }, 100)
      }
    })
    for (i = 0; i < maxDiv; i++) {
      setTimeout(() => {
        let tmp = $('[data-wwtest]')
        chai.expect(tmp).to.have.lengthOf.above(0, `要删除的元素不存在了？`)
        $(tmp[0]).remove()
        t0 = performance.now()
      }, 0)
    }
  })

  const addedItem = 2
  it('加入事件中，Nodetype不为1的元素被忽略，而其它元素正常', function (done) {
    let j, k, timeid
    j = 0
    k = 0
    naCount = baCount = 0
    timeid = false
    EE.on('nodeBeforeAdd', function (nodeArray) {
      let hasTestNode = false
      $(nodeArray).each((idx, ele) => {
        chai.expect(ele.nodeType).to.be.equal(1, `收到了非元素类的加入事件,元素类型${ele.nodeType}`)
        if ($(ele).is('[data-wwtest]')) {
          j++
          hasTestNode = true
        }
      })
      if (hasTestNode) baCount++
    })
    EE.on('nodeAdd', function (nodeArray) {
      let hasTestNode = false
      $(nodeArray).each((idx, ele) => {
        chai.expect(ele.nodeType).to.be.equal(1, `收到了非元素类的加入事件,元素类型${ele.nodeType}`)
        if ($(ele).is('[data-wwtest]')) {
          k++
          hasTestNode = true
        }
      })
      if (hasTestNode) naCount++
      if (k >= addedItem && !timeid) {
        timeid = setTimeout(() => {
          chai.expect(j).to.be.equal(addedItem, `nodeBeforeAdd收到的元素通知不等于${addedItem}`)
          chai.expect(k).to.be.equal(addedItem, `nodeAdd收到的元素事件不等于${addedItem}`)
          done()
        }, 100)
      }
    })

    $('body .container').append(`<!-- 被过滤的元素 -->`)
    $('body .container').append(`<div id="wwtest1" data-wwtest="true"></div>`)
    $('body .container').append(`<div id="wwtest2" style="display:none" data-wwtest="true"></div>`)
    $('#wwtest2').text('test code')
  })

  it('删除事件中，Nodetype不为1的元素被忽略，而其它元素正常', function (done) {
    let j, k, timeid
    j = 0
    k = 0
    naCount = baCount = 0
    timeid = false
    EE.on('nodeBeforeRm', function (nodeArray) {
      let hasTestNode = false
      $(nodeArray).each((idx, ele) => {
        chai.expect(ele.nodeType).to.be.equal(1, `收到了非元素类的删除事件,元素类型${ele.nodeType}`)
        if ($(ele).is('[data-wwtest]')) {
          j++
          hasTestNode = true
        }
      })
      if (hasTestNode) baCount++
    })
    EE.on('nodeRm', function (nodeArray) {
      let hasTestNode = false
      $(nodeArray).each((idx, ele) => {
        chai.expect(ele.nodeType).to.be.equal(1, `收到了非元素类的删除事件,元素类型${ele.nodeType}`)
        if ($(ele).is('[data-wwtest]')) {
          k++
          hasTestNode = true
        }
      })
      if (hasTestNode) naCount++
      if (k >= addedItem && !timeid) {
        timeid = setTimeout(() => {
          chai.expect(j).to.be.equal(addedItem, `nodeBeforeRm收到的元素通知不等于${addedItem}`)
          chai.expect(k).to.be.equal(addedItem, `nodeRm收到的元素事件不等于${addedItem}`)
          done()
        }, 100)
      }
    })

    // 删除刚加入的三个元素
    $('body .container').html('')
  })
})
