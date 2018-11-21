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
  const existBase = '/bootstrap/4.1.3/js/bootstrap.bundle.min.js'
  const existBase2 = '//bootstrap/latest/css/bootstrap.min.css'
  const notExistFile = `@${notExistBase}`
  const existFile = `@${existBase}`
  const existFile2 = `@${existBase2}`

  it('类定义中，依赖成功不回调，失败可以回调类方法', function (done) {
    let sig = 0
    let sig2 = 0
    let fullfillTest = false; let fullFileTest2 = false
    const allFullfilled = () => {
      if (fullFileTest2 && fullfillTest) {
        chai.expect(($(`head > script[src*='${existBase}']`)).length).to.be.equal(1, '正确资源被加载了多次？')
        chai.expect(($(`head > script[src*='${notExistBase}']`)).length).to.be.equal(1, '错误资源被加载了多次？')
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
    wwjs.wwclass.reg('Test', Test)
    wwjs.wwclass.reg('Test2', Test2)

    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwtest1" data-wwclass="Test"></div><div id="wwtest2" data-wwclass="Test2"></div>`)
      // t0 = performance.now()
    }, 0)
  })

  it('元素动态加载解析正确，并且同时多个元素请求只会加载一次', function (done) {
    EE.on('error', function (type, errFiles) {
      if (type === 'wwclass.get') {
        chai.expect(errFiles.length).to.be.equal(1, '元素被加载了多次？')
        chai.expect(errFiles[0]).to.be.equal(`_wwcls_TestNotExist`, '元素bundleName规则有误？')
        chai.expect($(`head > script[src*='/@wwclass/TestNotExist/4.1.2/index.min.js']`).length).to.be.equal(1, 'script标签插入错误？')
        done()
      }
    })
    setTimeout(() => {
      wwjs.ui.$container().append(`<div data-wwclass="TestNotExist@4.1.2"></div><div data-wwclass="TestNotExist@4.1.2"></div>`)
      // t0 = performance.now()
    }, 0)
  })

  it('请求元素的不同版本正确收到警告', function (done) {
    let warnCount = 0
    EE.on('warn', function (type, name, requestVer, regVer) {
      // console.log('arguments=', arguments)
      if (type === 'elems.verMismatch' && name === 'Test3') {
        chai.expect(regVer).to.be.equal('1.2.3', '注册的版本号错误？')
        chai.expect(name).to.be.equal('Test3', '请求的元素类名称有误？')
        if (requestVer !== '2.1.2' && requestVer !== '4.1.2') {
          chai.expect(false, '请求的版本号错误？')
        }
        warnCount++
        if (warnCount === 2) {
          done()
        }
      }
    })
    class Test3 extends wwjs.wwclass {
      static version = '1.2.3'
    }
    wwjs.wwclass.reg('Test3', Test3)

    setTimeout(() => {
      wwjs.ui.$container().append(`<div data-wwclass="Test3"></div><div data-wwclass="Test3@2.1.2"></div><div data-wwclass="Test3@4.1.2"></div>`)
      // t0 = performance.now()
    }, 0)
  })

  it('有资源依赖的函数返回promise，解析为原函数返回值．依赖资源未加载时是异步，已加载后成为同步调用', function (done) {
    let sig = 0
    class Test4 extends wwjs.wwclass {
      static version = '1.2.3'
      @wwjs.wwclass.dep([existFile2])
      test () {
        sig = 2
        return 1100
      }
    }
    wwjs.wwclass.reg('Test4', Test4)

    let bindCount = 0
    let checkFirstEle = false

    const fullfilled = () => {
      if (bindCount === 3 && checkFirstEle) {
        chai.expect(($(`head > link[href*='${existBase2}']`)).length).to.be.equal(1, 'test函数的依赖资源没有被加载？')
        done()
      }
    }
    EE.on('elems.inst', function (ele, inst, reqfullclass) {
      // console.log('inst', arguments)
      if (reqfullclass.startsWith('Test4')) {
        sig = 1
        bindCount++
        fullfilled()
        if (reqfullclass === 'Test4') { // 只针对地一个元素做细节检查．
          const result = inst.test()
          chai.expect(sig).to.be.equal(1, '依赖加载时，调用被wrap的函数不是异步了?')
          // eslint-disable-next-line no-unused-expressions
          chai.expect(result instanceof Promise).to.be.true
          result.then((value) => {
            chai.expect(sig).to.be.equal(2, '依赖加载时，调用被wrap的函数不是异步了?异步函数没有把值改到２')
            sig = 1
            inst.test()
            chai.expect(sig).to.be.equal(2, '依赖加载后，调用被wrap的函数还是异步?，应该是同步的')
            chai.expect(value).to.be.equal(1100, '有dep的函数返回值错误？')
            checkFirstEle = true
            fullfilled()
          })
        }
      }
    })

    setTimeout(() => {
      wwjs.ui.$container().append(`<div data-wwclass="Test4"></div><div data-wwclass="Test4@2.1.2"></div><div data-wwclass="Test4@4.1.3"></div>`)
      // t0 = performance.now()
    }, 0)
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