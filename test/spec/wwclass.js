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

  const notExistBase = '/bootstrap/4.1.3/js/bootstrap.bundle.min1.js'
  const notExistFile = `@${notExistBase}`
  const existFile = `@/bootstrap/4.1.3/js/bootstrap.bundle.min.js`

  it('类定义中，依赖成功不回调，失败可以回调类方法', function (done) {
    let sig = 0
    let deperr = function (errArray) {
      sig++
    }
    // 类依赖失败的回调不能调用实例方法，而静态方法类未定义，只能前置定义失败方法。
    @wwjs.wwclass.dep([existFile], deperr)
    class Test extends wwjs.wwclass {
      constructor () {
        super()
        // console.log('arguments=', arguments)
        // console.log(Test)
        // 这句调用会出发依赖加载，并导致deperr方法被执行。
        this.test()
      }
      @wwjs.wwclass.dep([notExistFile], 'deperr')
      test () {
        return 1100
      }
      deperr (err) {
        if ($.isArray(err) && err.length === 1 && err[0].endsWith(notExistBase)) {
          sig++
          chai.expect(sig).to.be.equal(1, `加载成功，也调用了错误回调？`)
          done()
        }
      }
    }
    wwjs.wwclass.reg(Test, 'Test')

    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwtest1" data-wwclass="Test"></div>`)
      // t0 = performance.now()
    }, 0)
  })
})
