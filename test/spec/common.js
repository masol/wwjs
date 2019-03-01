/* eslint no-undef: 0 */

describe('未归类测试', function () {
  before(function (done) {
    wwimport('ready', () => {
      done()
    }, (err) => { done(err) })
  })

  it('js加载失败正确调用失败函数,如果依赖被提前声明，则正确加载。', function (done) {
    const notExistBase = '/bootstraptest/4.1.3/js/bootstrap.bundle.min1.js'
    const notExistFile = `@${notExistBase}`
    const notExistFile2 = `@${notExistBase}.js`
    wwjs.loadjs.load(notExistFile, {
      error: (errFiles) => {
        chai.expect(errFiles[0]).to.be.equal(wwjs.loadjs.resolve(notExistFile), '依赖失败文件不正确?')
        wwimport(`done::${notExistFile2}`)
        wwjs.loadjs.load(notExistFile2, {
          error: (errFiles) => {
            chai.assert.isOk(false, '手动完成的依赖，依赖检查失败。')
          },
          success: () => {
            done()
          }
        })
      },
      success: () => {
        chai.assert.isOk(false, '不存在的css文件，调用到success回调。')
      }
    })
  })

  it('css加载失败正确调用失败函数,如果依赖被提前声明，则正确加载。', function (done) {
    const notExistBase = '/bootstraptest/4.1.3/js/bootstrap.bundle.min1.css'
    const notExistFile = `css!@${notExistBase}`
    const notExistFile2 = `css!@${notExistBase}.css`
    wwjs.loadjs.load(notExistFile, {
      error: (errFiles) => {
        chai.expect(errFiles[0]).to.be.equal(wwjs.loadjs.resolve(notExistFile), '依赖失败文件不正确?')
        wwimport(`done::${notExistFile2}`)
        wwjs.loadjs.load(notExistFile2, {
          error: (errFiles) => {
            chai.assert.isOk(false, '手动完成的依赖，依赖检查失败。')
          },
          success: () => {
            done()
          }
        })
      },
      success: () => {
        chai.assert.isOk(false, '不存在的css文件，调用到success回调。')
      }
    })
  })
})
