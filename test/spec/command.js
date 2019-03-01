/* eslint no-undef: 0 */

describe('net.Command', function () {
  before(function (done) {
    wwimport('ready', () => {
      done()
    }, (err) => { done(err) })
  })

  it('调用已注册命令函数，正确执行，并可以正确处理异常', function (done) {
    const testResult = '12312'
    const errorMsg = 'abcd'
    const param1 = 'test123'
    const param2 = 'test234'
    let cmd = {
      cmdName: function ([passparam1, passparam2]) {
        chai.expect(passparam1).to.be.equal(param1, `函数调用方式传入的参数不正确`)
        chai.expect(passparam2).to.be.equal(param2, `函数调用方式传入的参数不正确`)
        return testResult
      },
      passObject: function ([passparam1, passparam2]) {
        chai.expect(passparam1).to.be.equal(param1, `函数调用方式传入的参数不正确`)
        chai.expect(passparam2).to.be.equal(param2, `函数调用方式传入的参数不正确`)
        return testResult
      },
      throwException: function () {
        throw new Error(errorMsg)
      }
    }
    wwjs.net.reg('@/@wwcmd/test', cmd)
    let result = wwjs.net.run([`@/@wwcmd/test#cmdName`, param1, param2])
    Promise.resolve(result).then((result) => {
      chai.expect(result).to.be.equal(testResult, `返回值不等于函数的返回值`)
      Promise.resolve(wwjs.net.run({ 'command': `@/@wwcmd/test#passObject`, 'params': [param1, param2] })).then(function (result) {
        chai.expect(result).to.be.equal(testResult, `返回值不等于函数的返回值`)
        Promise.resolve(wwjs.net.run(`@/@wwcmd/test#throwException`)).catch(function (err) {
          chai.expect(err.message).to.be.equal(errorMsg, `函数返回的异常没有正确接收`)
          done()
        })
      })
    })
  })

  it('正确调用远程命令', function (done) {
    let result = wwjs.net.run([`@/@wwcmd/wwcompiler/1.0.1/wwcompiler.min.js#build`, `<div class="container-fluid">
  <div class="row">
    <div class="col">
      <div>这里是占位文字，方便您快速修改：WIDE是WWARE的集成开发环境。在人工智能技术的支持下，可以快速开发复杂逻辑的智能应用。支持开发标准HTML5应用，微信/易信应用，APP(Android，iOS，WinPhone)，智能电视，标准PC软件(Windows,Linux,Mac OS)的开发。其假想用户为领域专家，以函数编程为主要思路，会用计算器就可以快速开发复杂逻辑的应用。整个开发过程不要求有任何的计算机语言基础。
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <div>这里是占位文字，方便您快速修改：WIDE是WWARE的集成开发环境。在人工智能技术的支持下，可以快速开发复杂逻辑的智能应用。支持开发标准HTML5应用，微信/易信应用，APP(Android，iOS，WinPhone)，智能电视，标准PC软件(Windows,Linux,Mac OS)的开发。其假想用户为领域专家，以函数编程为主要思路，会用计算器就可以快速开发复杂逻辑的应用。整个开发过程不要求有任何的计算机语言基础。
      </div>
    </div>
  </div>
</div>`])
    Promise.resolve(result).then((result) => {
      // console.log('command result:', result)
      chai.expect(typeof result).to.be.equal('object', `未能返回正确的结果`)
      chai.assert.isOk(typeof result.content === 'string' && result.content.length > 0, '函数调用返回的结果不正确')
      done()
    })
  }).timeout(11000)
})
