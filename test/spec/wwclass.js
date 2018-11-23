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

  it('类定义中，依赖成功不回调失败处理，失败可以回调类方法形式的失败处理', function (done) {
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
      constructor (ele) {
        super(ele)
        chai.expect(ele).to.be.an.instanceof(Element, `构造函数传入错误参数${ele}？`)
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
      constructor (ele) {
        super(ele)
        chai.expect(ele).to.be.an.instanceof(Element, `构造函数传入错误参数${ele}？`)
      }
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
      @wwjs.wwclass.dep([existFile2])
      test2 () {
        sig = 2
        return 1200
      }
      @wwjs.wwclass.dep([existFile2])
      test3 () {
        sig = 2
        return 1300
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
            inst.test3().then((value) => {
              chai.expect(value).to.be.equal(1300, '有dep的函数返回值错误？')
              checkFirstEle = true
              fullfilled()
            })
            chai.expect(sig).to.be.equal(2, '依赖加载后，调用被wrap的函数还是异步?，应该是同步的')
          })
        }
      }
    })

    setTimeout(() => {
      wwjs.ui.$container().append(`<div data-wwclass="Test4"></div><div data-wwclass="Test4@2.1.2"></div><div data-wwclass="Test4@4.1.3"></div>`)
      // t0 = performance.now()
    }, 0)
  })
  it('watch有初始值的属性，默认会触发一次,并正确调用了渲染，并且渲染是增量更新', function (done) {
    let sig = 0
    let addCount = 0
    let renderCount = 0
    let requestCount = 0
    let pThis = this
    let intID
    const testNodeAdded = function (nodeArray) {
      let i = 0
      for (i; i < nodeArray.length; i++) {
        let item = nodeArray[i]
        if (item.getAttribute('id') === 'pintest4') {
          addCount++
          $('#wwTest5').attr('data-test', addCount)
        }
      }
    }
    EE.on('nodeAdd', testNodeAdded)

    class Test5 extends wwjs.wwclass {
      static version = '1.2.3'
      constructor (ele) {
        super(ele)
        this.watch('data-test', { render: true })
      }
      ontestChanged (oldValue, newValue) {
        let self = this
        // console.log(arguments)
        // console.log('self.props.test=', self.props.test)
        chai.expect(self.props.test).to.be.equal(newValue, '进入事件回调之后，属性值未修改？')
        if (oldValue === undefined) {
          sig = 1
          chai.expect(newValue).to.be.equal('1234', '默认值没有触发属性变动？')
          $('#wwTest5').attr('data-test', '5678')
          // console.log($('#wwTest5'))
          // console.log(22)
        } else if (sig === 1) {
          // chai.expect(sig).to.be.equal(1, '默认值没有调用属性变动函数？')
          chai.expect(newValue).to.be.equal('5678', '改写Dom元素的属性值没有触发属性变动？')
          sig = 2
        } else {
          let intCount = 0
          if (!intID) {
            intID = setInterval(function () {
              intCount++
              // console.log(intCount)
              if (intCount === 200) {
                clearInterval(intID)
                chai.expect(addCount).to.be.equal(1, '多次绘制导致元素被新加入了,不是增量更新了？')
                chai.expect(renderCount).to.be.above(3, '没有引发多次绘制？')
                chai.expect(requestCount).to.be.equal(201, '请求数不精准？')
                EE.off('nodeAdd', testNodeAdded)
                pThis._runnable.title = `watch有初始值的属性，默认会触发一次,并正确调用了渲染，固定请求了${requestCount}次更新，根据设备环境，只增量更新了${renderCount}次`
                done()
              }
              $('#wwTest5').attr('data-test', intCount)
              chai.expect(addCount).to.be.equal(1, '多次绘制导致元素被新加入了,不是增量更新了？')
            }, 3)
          }
        }
      }
      onRequestRender () {
        requestCount++
      }
      doRender () {
        let self = this
        renderCount++
        self.render`<p id='pintest4' data-test="${self.props.test}"><span>${self.props.test}</span></p>`
      }
    }
    wwjs.wwclass.reg('Test5', Test5)

    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwTest5" data-wwclass="Test5" data-test="1234"></div>`)
      // t0 = performance.now()
    }, 0)
  }).timeout(5000)

  it('watch无初始值的属性，没有默认触发，并正确监听了属性变化', function (done) {
    let notifycount = 0
    let renderCount = 0

    class Test6 extends wwjs.wwclass {
      static version = '1.2.3'
      constructor (ele) {
        super(ele)
        this.watch('data-test')
      }
      ontestChanged (oldValue, newValue) {
        notifycount++
      }
      doRender () {
        let self = this
        renderCount++
        self.render`<p id='pintest6'><span>${self.props.test}</span></p>`
      }
    }

    setTimeout(() => {
      chai.expect(notifycount).to.be.equal(0, '无初始值的元素被请求绘制了？')
      chai.expect(renderCount).to.be.equal(1, '即便没有任何值更新，只要定义了doRender方法，初始化之后，也应该请求绘制一次．')
      done()
    }, 200)
    wwjs.wwclass.reg('Test6', Test6)

    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwTest6" data-wwclass="Test6"></div>`)
      // t0 = performance.now()
    }, 0)
  })

  it('watchAdd可以正确接收子元素加入/删除事件，演示如何与数组元素绑定，做到增量更新', function (done) {
    let childAdded = 0
    let treeAdded = 0
    class Test7 extends wwjs.wwclass {
      constructor (ele) {
        super(ele)
        this.props.data = [{ v: 'a' }, { v: 'b' }, { v: 'c' }]
        this.watchAdd('.test')
        this.watchAdd('[data-add1]', this.onTreeAdd, { tree: true })
      }
      fullfilled () {
        if (childAdded === 1 && treeAdded === 3) {
          this.props.data[0].v = 123122
          this.props.data[1].v = 3222221
          this.props.data.push({ v: 'add new item' })
          this.requestRender()
          setTimeout(function () {
            chai.expect(treeAdded).to.be.equal(4, '节点不是增量更新？')
            done()
          }, 50)
          // done()
        }
      }
      onChildAdd (eleArray) {
        let self = this
        // console.log(self)
        eleArray.forEach((ele) => {
          childAdded++
          // eslint-disable-next-line
          chai.expect($(ele).hasClass('test')).to.be.true
          // console.log('onChildAdd=', ele)
          self.fullfilled()
        })
      }
      onTreeAdd (eleArray) {
        let self = this
        eleArray.forEach((ele) => {
          treeAdded++
          // console.log('onTreeAdd=', ele)
          self.fullfilled()
        })
      }
      doRender () {
        let self = this
        self.render`<div></div><span></span><p class="test">
        <span>
  ${self.props.data.map(
    (item) => {
      return wwjs.hyper.wire(item)`<li data-add1="${item.v}">${item.v}</li>`
    })}</span></p><!--test-->`
      }
    }

    wwjs.wwclass.reg('Test7', Test7)

    setTimeout(() => {
      wwjs.ui.$container().append(`<div data-wwclass="Test7"></div>`)
      // t0 = performance.now()
    }, 0)
  })

  it('props属性的更新，可以正确同步绑定的KO变量', function () {
  })
  it('析构函数触发', function (done) {
    class Test11 extends wwjs.wwclass {
      static version = '1.2.3'
      constructor (ele) {
        super(ele)
        this.watch('data-test')
      }
      finalize () {
        let ele = this.$ele[0]
        let self = this
        setTimeout(() => {
          // eslint-disable-next-line
          chai.expect(wwjs.wwclass.getInstance(ele)).to.be.undefined
          chai.expect(ele).to.be.instanceof(Element)
          // eslint-disable-next-line
          chai.expect(self.$ele).to.be.undefined
          done()
        }, 0)
      }
      ontestChanged (oldValue, newValue) {
      }
      doRender () {
        let self = this
        self.render`<p id='pintest11'><span>${self.props.test}</span></p>`
      }
    }

    setTimeout(() => {
      $('#wwTest11').remove()
    }, 20)
    wwjs.wwclass.reg('Test11', Test11)

    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwTest11" data-wwclass="Test11"></div>`)
      // t0 = performance.now()
    }, 0)
  })
})
