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

function isView (data) {
  var htmlPrefix = '<!doctype html>'
  var idx = 0
  while (idx < data.length && data[idx] === ' ') idx++
  var isHtml = false
  if (data.slice(idx, htmlPrefix.length) === htmlPrefix) {
    isHtml = true
  }
  return !isHtml
}

window.wwimport('ready', () => {
  /**
  @class View
  @classdesc View支持如下几个属性:
  - src: 指定View获取的url,如果src变化，则立即尝试获取数据．如果服务器组装，请不要设置src值，直接向view中填写内容.
  - data-forcelocal: 指定view中的a[href]的链接，强制刷新本view．a[href]中也可以通过设置属性`data-refview`为false来强制链接点击不是刷新view.
  @extends wwjs.wwclass
  */
  class View extends wwjs.wwclass {
    constructor (ele) {
      super(ele)
      let self = this
      self.watch('src', { render: true })
      self.watch('datasrc')
      self.curURL = ''
      self.curReq = null
      self.curDataURL = ''
      self.curDataReq = null
      // 拦截view中a的点击事件，以view的形式显示

      self.$ele.on('click', 'a[href]', function (e) {
        var $evt = $(this)
        var forcelocal = (self.$ele.attr('data-forcelocal') === 'true')
        var refview = $evt.attr('data-refview')
        if (refview === 'true' || (forcelocal && refview !== 'false')) {
          event.preventDefault()
          // set view url from $evt.attr("href");
          self.props.src = $evt.attr('href')
          // $.wwclass.helper.updateProp(self.$ele, 'data--url', $evt.attr('href'))
          return false
        }
        return true
      })
    }
    finalize () {
      clearReq(this)
      clearDataReq(this)
    }
    /**
    当src属性变化时，负责刷新view的内容.
    */
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
        self.curReq.done(function (data, textStatus, jqXHR) {
          if (isView(data)) {
            self.reder`${data}`
          } else {
            // 不是view, 使用iframe显示内容
            wwjs.ui.createIframe(self.$ele, data)
          }
        }).always(function () {
          wwjs.ui.block(self.$ele, false)
          clearReq(self)
        })
      }
    }
  }

  wwjs.wwclass.reg('view', View)
})
