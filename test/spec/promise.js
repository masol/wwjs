/* eslint no-undef: 0 */

describe('Promise', function () {
  before(function (done) {
    wwimport('ready', () => {
      done()
    }, (err) => { done(err) })
  })

  it('Promise.pipe确保顺序工作，并且后一函数正确收到前一函数的返回值', function () {
    let t0 = performance.now()
    let t1
    return Promise.pipe([
      function (val) {
        chai.expect(val).to.equal(1)
        val++
        return new Promise(function (resolve) {
          setTimeout(() => {
            resolve(val)
          }, 10)
        })
      },
      function (val) {
        chai.expect(val).to.equal(2)
        val++
        return new Promise(function (resolve) {
          setTimeout(() => {
            resolve(val)
          }, 20)
        })
      },
      function (val) {
        chai.expect(val).to.equal(3)
        val++
        return new Promise(function (resolve) {
          setTimeout(() => {
            resolve(val)
          }, 20)
        })
      }
    ], 1).then(function (val) {
      t1 = performance.now()
      chai.expect(Math.abs(t1 - t0)).to.be.within(50, 100, 'setTimeout误差过大？')
      chai.expect(val).to.equal(4)
    })
  })

  it('Promise.whiledo确保顺序循环，并且后一次调用正确收到前一次执行的返回值', function () {
    let total = 0
    let t0 = performance.now()
    let t1
    return Promise.whiledo(function (val) {
      return val < 50
    }, function (val) {
      chai.expect(val).to.equal(total)
      total++
      return new Promise(function (resolve) {
        setTimeout(() => {
          resolve(val + 1)
        }, 10)
      })
    }, 0).then(function (val) {
      t1 = performance.now()
      chai.expect(Math.abs(t1 - t0)).to.be.within(500, 750, 'setTimeout误差过大？')
      chai.expect(val).to.equal(50)
      chai.expect(total).to.equal(50)
    })
  })

  it('Promise.delay确保延时存在', function () {
    let t0 = performance.now()
    let t1, t2, t3
    return Promise.all([
      Promise.delay(10, function () {
        t1 = performance.now()
        chai.expect(Math.abs(t1 - t0)).to.be.within(10, 20, '函数没有在delay结束时调用')
        return 121
      }).then(function (val) {
        t1 = performance.now()
        chai.expect(Math.abs(t1 - t0)).to.be.within(10, 20, 'setTimeout误差过大？')
        chai.expect(val).to.equal(121)
      }),

      Promise.delay(20, 132).then(function (val) {
        t2 = performance.now()
        chai.expect(Math.abs(t2 - t0)).to.be.within(18, 50, 'setTimeout误差过大？')
        chai.expect(val).to.equal(132)
      }).then(function () {
        t3 = performance.now()
        chai.expect(Math.abs(t3 - t0)).to.be.within(18, 50, 'setTimeout误差过大？')
      })
    ])
  })
})
