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
    let sig2 = 0
    let fullfillTest = false; let fullFileTest2 = false
    const allFullfilled = () => {
      if (fullFileTest2 && fullfillTest) {
        done()
      }
    }
    let deperr = function (errArray) {
      if ($.isArray(errArray) && errArray.length === 1 && errArray[0].endsWith(notExistBase)) {
        sig2++
        chai.expect(sig2).to.be.equal(1, `类加载错误的通知有问题？`)
        fullFileTest2 = true
        allFullfilled()
      }
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
          fullfillTest = true
          allFullfilled()
        }
      }
    }

    @wwjs.wwclass.dep([notExistFile], deperr)
    class Test2 extends wwjs.wwclass {
    }
    wwjs.wwclass.reg(Test, 'Test')
    wwjs.wwclass.reg(Test2, 'Test2')

    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwtest1" data-wwclass="Test"></div><div id="wwtest2" data-wwclass="Test2"></div>`)
      // t0 = performance.now()
    }, 0)
  })

  it('依赖函数返回promise，并正确解析', function () {
  })
  it('同时创建多个元素只会加载一次,创建多个实例', function () {
  })
  it('watch可以正确接收属性改变事件，选项触发render', function () {
  })
  it('watch只在属性变化时才触发', function () {
  })
  it('watch可以正确接收子元素加入/删除事件，选项触发render', function () {
  })
  it('render方法利用的模板是增量更新', function () {
  })
  it('基类attr方法正确更新绑定的变量', function () {
  })
  it('析构函数触发', function () {
  })
})
