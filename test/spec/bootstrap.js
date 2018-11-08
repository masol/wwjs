/* eslint no-undef: 0 */

describe('Bootstrap', function () {
  before(function () {
  })

  if (!window.wwj) {
    it('bootstrap时,Ready是异步调用', function (done) {
      let test = 1
      let bootted = !!window.wwj
      wwimport('ready', () => {
        if (bootted) {
          chai.expect(test).to.equal(1)
        } else {
          chai.expect(test).to.equal(2)
        }
        done()
      }, (err) => { done(err) })
      test = 2
    })
  }

  it('bootstrap之后,Ready已经是同步调用了', function () {
    let test = 1
    wwjs.ready((err) => {
      chai.expect(err).to.equal(null)
      test = 2
    })
    chai.expect(test).to.equal(2)
  })
  it('bootstrap之后,Promise工作正常', function () {
    let test = 1
    const pro = new Promise(function (resolve, reject) {
      setTimeout(function () {
        chai.expect(test).to.equal(2)
        resolve(true)
      }, 1)
    })
    test = 2
    return pro
  })
  it('MutationObserver监测节点加入并只被通知一次', function (done) {
    let bodyObserver
    let notifycount = 0
    let t0, t1
    let pThis = this
    function check (mutations) {
      mutations.forEach(function (mutation) {
        // 相应元素加入的事件，并执行wwclass初始化。
        if (mutation.addedNodes.length > 0) {
          let i = 0
          for (i; i < mutation.addedNodes.length; i++) {
            item = mutation.addedNodes[i]
            if (item.nodeType === 1 && $(item).attr('data-test') === 'abcdef') {
              t1 = performance.now()
              pThis._runnable.title = `MutationObserver监测节点加入并只被通知一次(${t1 - t0}ms)`
              notifycount++
              setTimeout(function () {
                chai.expect(notifycount).to.equal(1)
                $(item).remove()
                bodyObserver.disconnect()
                done()
              }, 500)
            }
          }
          // console.log(mutation.addedNodes)
        }
      })
    }
    var $container = $('body').first()
    if ($container.length > 0) {
      bodyObserver = new MutationObserver(check)
      var config = {
        childList: true,
        attributes: false,
        attributeOldValue: false, // 为了防止handler不检查属性相等，直接设置，这里检查old是否等于new。以防止递归。
        subtree: true,
        characterData: false,
        characterDataOldValue: false
      }
      bodyObserver.observe($container[0], config)
      t0 = performance.now()
      $('body').append('<div style="display:none" data-test="abcdef"></div>')
    }
  })
})
