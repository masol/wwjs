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
})
