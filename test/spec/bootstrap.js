/* eslint no-undef: 0 */

describe('Bootstrap', function () {
  before(function () {
  })

  if (!window.wwj) {
    it('bootstrap时,Ready是异步调用', function (done) {
      let test = 1
      let bootted = !!window.wwj
      wwimport('ready', () => {
        if (bootted) {
          chai.expect(test).to.equal(1)
        } else {
          chai.expect(test).to.equal(2)
        }
        done()
      }, (err) => { done(err) })
      test = 2
    })
  }

  it('bootstrap之后,Ready已经是同步调用了', function () {
    let test = 1
    wwjs.ready((err) => {
      chai.expect(err).to.equal(null)
      test = 2
    })
    chai.expect(test).to.equal(2)
  })
})
