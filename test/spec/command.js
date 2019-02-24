/* eslint no-undef: 0 */

describe('net.Command', function () {
  before(function (done) {
    wwimport('ready', () => {
      done()
    }, (err) => { done(err) })
  })

  it('调用已注册命令函数，正确执行', function (done) {
    const testResult = '12312'
    const errorMsg = 'abcd'
    let cmd = {
      cmdName: function () {
        return testResult
      },
      throwException: function () {
        throw new Error(errorMsg)
      }
    }
    wwjs.net.reg('@/@wwcmd/test', cmd)
    let result = wwjs.net.run(`@/@wwcmd/test#cmdName`)
    Promise.resolve(result).then((result) => {
      chai.expect(result).to.be.equal(testResult, `返回值不等于函数的返回值`)
      Promise.resolve(wwjs.net.run(`@/@wwcmd/test#throwException`)).catch(function (err) {
        chai.expect(err.message).to.be.equal(errorMsg, `函数返回的异常没有正确接收`)
      })
      done()
    })
  })
})
