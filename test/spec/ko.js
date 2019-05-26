/* eslint no-undef: 0 */

describe('KO数据绑定', function () {
  before(function (done) {
    wwimport('ready', () => {
      // wwjs.ui.$container().html('')
      $('#wwcontainer').html('')
      done()
    }, (err) => { done(err) })
  })
  after(function (done) {
    wwimport('ready', () => {
      // wwjs.ui.$container().html('')
      $('#wwcontainer').html('')
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

  it('viewModel设置值和得到值一致,非覆盖设置不会改变值，覆盖设置会改变，类型可以自动转化(不推荐使用自动转化)', function (done) {
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

  it('脚本型bindvar(script[type="text/bindvar"])工作正常，不会覆盖已经定义的值，只会设置未定义的值以用于初始化，可以定义函数类型，并且此时get工作正常', function (done) {
    wwjs.vm.set({
      'test': testValue
    }, '', true)
    chai.expect(wwjs.vm.get('', 'json').test).to.be.equal(testValue, `vm.set之后立即获取到的值不一致`)
    let t0
    let pThis = this
    let ivid = setInterval(function () {
      let $wwtest2 = $('#wwtest22')
      if ($wwtest2.length > 0) {
        let spans = $wwtest2.find('span')
        // console.log('$(spans[1]).text()=', $(spans[1]).text())
        if (spans.length === 2 && $(spans[0]).text() === testValue && $(spans[1]).text() === '32') {
          wwjs.vm.set({
            'test23': 33
          }, '', true)
          // console.log(wwjs.vm.get('', 'json'))
          // console.log('wwjs.vm.get().test24=', wwjs.vm.get().test24)
          // console.log('wwjs.vm.get().test24()=', wwjs.vm.get().test24())
        } else if (spans.length === 2 && $(spans[0]).text() === testValue && $(spans[1]).text() === '43') {
          let t1 = performance.now()
          clearInterval(ivid)
          // console.log(wwjs.vm.get('', 'json'))
          // chai.expect(wwjs.vm.get('', 'json')).to.deep.equal({ test: testValue, test2: 22 }, `vm.set之后立即获取到的值不一致`)
          pThis._runnable.title = `脚本型bindvar(script[type="text/bindvar"])工作正常，不会覆盖已经定义的值，只会设置未定义的值以用于初始化，可以设置computed Observable,并且此时get工作正常。(${t1 - t0}ms延时)`
          done()
        }
      }
    }, 1)
    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwtest22">
      <span data-bind="text : test"></span>
      <span data-bind="text : test24"></span>
      <script type="text/bindvar">
        {"test":11,
        "test23":22,
        "test24":function(){
          // console.log('this=',this)
          return this.test23() + 10
        }}
      </script>
      </div>`)
      t0 = performance.now()
    }, 0)
  })

  it('data-ns元素的子data-bindvar自动归入此名称下，并且一次事件中可以嵌套加入NS', function (done) {
    let t0
    let pThis = this
    let ivid = setInterval(function () {
      let $wwtest3 = $('#wwtest3')
      if ($wwtest3.length > 0) {
        let spans = $wwtest3.children('span')
        if (spans.length === 2 && $(spans[0]).text() === '33' && $(spans[1]).text() === '44') {
          let $wwtest4 = $('#wwtest4')
          if ($wwtest4.length > 0) {
            let spans = $wwtest4.children('span')
            if (spans.length === 2 && $(spans[0]).text() === '55' && $(spans[1]).text() === '66') {
              let t1 = performance.now()
              clearInterval(ivid)
              let $wwtest3Json = wwjs.vm.get($wwtest3[0], 'json')
              chai.expect($wwtest3Json.test).to.be.equal(33, `匿名名称空间下的test值不正确`)
              chai.expect($wwtest3Json.test2).to.be.equal(44, `匿名名称空间下的test2值不正确`)
              chai.expect($wwtest3Json).to.deep.equal({ test: 33, test2: 44, CUSTOMNAME: { test: 55, test2: 66 } }, `vm.set之后立即获取到的值不一致`)
              chai.expect(wwjs.vm.get($wwtest4[0], 'json')).to.deep.equal({ test: 55, test2: 66 }, `vm.set之后立即获取到的值不一致`)
              pThis._runnable.title = `data-ns元素的子data-bindvar自动归入此名称下，并且一次事件中可以嵌套加入NS。(${t1 - t0}ms延时)`
              done()
            }
          }
        }
      }
    }, 1)

    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwtest3" data-ns><span data-bind="text : test"></span><span data-bind="text : test2"></span><div data-bindvar={"test":33,"test2":44}></div>
      <div id="wwtest4" data-ns="CUSTOMNAME"><span data-bind="text : test"></span><span data-bind="text : test2"></span><div data-bindvar={"test":55,"test2":66}></div></div></div>`)
      // wwjs.ui.$container().append(``)
      t0 = performance.now()
    }, 0)
  })

  // it('手动测试文件绑定', function (done) {
  //   setTimeout(() => {
  //     wwjs.ui.$container().append(`<input type='file' id="wwtestfile" data-bind="file:testimg">`)
  //     // wwjs.ui.$container().append(``)
  //     t0 = performance.now()
  //   }, 0)
  // }).timeout(10000000)

  it('attr绑定"testnoexist() + 1"自动添加testnoexist变量，并初始化为元素对应属性.', function (done) {
    let ivid = setInterval(function () {
      // console.log(wwjs.vm.get($('#wwtest11'), 'json'))
      if ($('#wwtest11').length === 1 && wwjs.vm.get($('#wwtest11')).testnoexist) {
        // console.log(wwjs.vm.get($('#wwtest11')).testnoexist)
        chai.expect(wwjs.vm.get($('#wwtest11')).testnoexist()).to.be.equal('', `自动初始化的变量值不正确。`)
        chai.expect(wwjs.vm.get($('#wwtest11')).testnoexist2()).to.be.equal('1234', `自动初始化的变量值未初始化为元素对应属性。`)
        clearInterval(ivid)
        done()
      }
    }, 1)
    setTimeout(() => {
      wwjs.ui.$container().append(`<div id="wwtest11" data-bind="attr : {'data-test':testnoexist() + 1,'data-test2':testnoexist2}" data-test2="1234"></div>`)
    }, 0)
  })

  // it('bindvar在深度对象的检查上工作正常', function (done) {
  // })
})
