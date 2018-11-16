/* eslint no-undef: 0 */

describe('UI数据绑定', function () {
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

  const testValue = 'test中文2#$1'

  it('基础绑定正常', function (done) {
    wwjs.vm.set({
      'test': testValue
    }, null, true)

    let t0
    let pThis = this
    let ivid = setInterval(function () {
      let text = $('#wwtest1').text()
      if (text === testValue) {
        let t1 = performance.now()
        clearInterval(ivid)
        pThis._runnable.title = `异步加入文字绑定元素，正确设置文本值。(${t1 - t0}ms延时)`
        done()
      }
    }, 1)
    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwtest1" data-bind="text : test"></div>`)
      t0 = performance.now()
    }, 0)
  })

  it('viewModel设置值和得到值一致,非覆盖设置不会改变值，覆盖设置会改变，类型可以自动转化', function (done) {
    wwjs.vm.set({
      'test': testValue
    }, '', true)
    chai.expect(wwjs.vm.get('', 'json').test).to.be.equal(testValue, `vm.set之后立即获取到的值不一致`)
    const testValue2 = 'testValue2'
    const testValue3 = { 'test': 'abcd' }
    wwjs.vm.set({
      'test': testValue2
    }, '', false)
    chai.expect(wwjs.vm.get('', 'json').test).to.be.equal(testValue, `vm.set非覆盖模式，但是覆盖了？`)
    wwjs.vm.set({
      'test': testValue2
    }, '', true)
    chai.expect(wwjs.vm.get('', 'json').test).to.be.equal(testValue2, `vm.set覆盖模式，但是没有覆盖？`)
    wwjs.vm.set({
      'test': testValue3
    }, '', true)
    if (wwjs.config.vmtypecvt) {
      chai.expect(wwjs.vm.get('', 'json').test).to.deep.equal(testValue3, `vm.set改变类型没有被设置上?`)
      chai.expect(wwjs.vm.get().test().test()).to.be.equal('abcd', `改变类型时没有全部转为Observable`)
    } else {
      chai.expect(wwjs.vm.get('', 'json').test).to.be.equal(testValue2, `vm.set改变类型被设置上了?`)
    }
    done()
  })

  it('bindvar工作正常，不会覆盖已经定义的值，只会设置未定义的值以用于初始化，并且此时get工作正常', function (done) {
    wwjs.vm.set({
      'test': testValue
    }, '', true)
    chai.expect(wwjs.vm.get('', 'json').test).to.be.equal(testValue, `vm.set之后立即获取到的值不一致`)
    let t0
    let pThis = this
    let ivid = setInterval(function () {
      let $wwtest2 = $('#wwtest2')
      if ($wwtest2.length > 0) {
        let spans = $wwtest2.find('span')
        if (spans.length === 2 && $(spans[0]).text() === testValue && $(spans[1]).text() === '2') {
          let t1 = performance.now()
          clearInterval(ivid)
          chai.expect(wwjs.vm.get('', 'json')).to.deep.equal({ test: testValue, test2: 2 }, `vm.set之后立即获取到的值不一致`)
          pThis._runnable.title = `bindvar工作正常，不会覆盖已经定义的值，只会设置未定义的值以用于初始化，并且此时get工作正常。(${t1 - t0}ms延时)`
          done()
        }
      }
    }, 1)
    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwtest2"><span data-bind="text : test"></span><span data-bind="text : test2"></span><div data-bindvar={"test":1,"test2":2}></div></div>`)
      t0 = performance.now()
    }, 0)
  })

  // it('bindvar在深度对象的检查上工作正常', function (done) {
  // })
})
