/// //////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
/// //////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-30T07:33:13.725Z by masol (masol.li@gmail.com)

'use strict'

function clearReq (self) {
  if (self.curReq) {
    self.curReq.abort()
    self.curReq = null
  }
}
function clearDataReq (self) {
  if (self.curDataReq) {
    self.curDataReq.abort()
    self.curDataReq = null
  }
}

window.wwimport('ready', () => {
  /**
  @class View
  @extends wwjs.wwclass
  */
  class View extends wwjs.wwclass {
    constructor (ele) {
      super(ele)
      this.watch('src', { render: true })
      this.watch('datasrc')
      this.curURL = ''
      this.curReq = null
      this.curDataURL = ''
      this.curDataReq = null
    }
    finalize () {
      clearReq(this)
      clearDataReq(this)
    }
    onsrcChanged (old, newValue) {
      let self = this
      if (self.curURL !== self.props.src) {
        self.curURL = self.props.src
        clearReq(self)
        clearDataReq(self)
        if ((self.$ele.attr('data-noblock') === 'true')) {
          wwjs.ui.block(self.$ele, true)
        }
        self.curReq = $.ajax({
          type: (self.$ele.attr('data-type') || 'GET').toUpperCase(),
          url: self.curURL
        })
      }
    }
    doRender () {
      // 如果没有绘制部分，请删除本函数．
      return this.render`<!-->这里是自己的模板代码<--!>`
    }
  }

  wwjs.wwclass.reg('view', View)
})
