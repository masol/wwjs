/* eslint no-undef: 0 */

describe('wwclass元素机制', function () {
  before(function (done) {
    wwimport('ready', () => {
      wwjs.ui.$container().html('')
      done()
    }, (err) => { done(err) })
  })
  after(function (done) {
    wwimport('ready', () => {
      wwjs.ui.$container().html('')
      done()
    }, (err) => { done(err) })
  })

  it('类定义中，依赖检查失败可以回调类方法', function (done) {
    let sig = 0
    class Test extends wwjs.wwclass {
      @wwjs.wwclass.dep(['@/bootstrap/4.1.3/js/bootstrap.bundle.min.js'], 'deperr')
      test () {
        return 1100
      }
      deperr (err) {
        if (err instanceof Error) {
          sig = 1
          chai.expect(sig).to.be.equal(1, `依赖错误函数执行顺序有误？`)
          done()
        }
      }
    }
    wwjs.wwclass.reg('Test', Test)

    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwtest1" data-wwclass="Test"></div>`)
      // t0 = performance.now()
    }, 0)
  })
})
