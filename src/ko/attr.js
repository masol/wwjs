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
// Created At : 2018-11-24T08:00:27.727Z by masol (masol.li@gmail.com)

'use strict'

export default () => {
  ko.attrChanged = 'attrChanged'
  // 改写ko中attr.js，将其改写为双向绑定．
  // 保持update不变，类似event以及value绑定，添加init方法．
  ko.bindingHandlers.attr.init = function (element, valueAccessor, allBindings) {
    // console.log('in attr.init', arguments)
    var value = ko.utils.unwrapObservable(valueAccessor()) || {}
    let attrMap = {}
    ko.utils.objectForEach(value, function (attrName, attrValue) {
      if (ko.isWritableObservable(attrValue)) {
        attrMap[attrName] = attrValue
      }
      // console.log(attrName)
      // console.log(attrValue)
    })
    if (!$.isEmptyObject(attrMap)) {
      // debugger
      ko.utils.registerEventHandler(element, ko.attrChanged, function (event, attrName) {
        let attrValue = attrMap[attrName]
        if (ko.isWritableObservable(attrValue) && String(attrValue()) !== element.getAttribute(attrName)) {
          // console.log('attrValue()=', attrValue())
          // console.log('change attrValue to ', element.getAttribute(attrName))
          // 我们需要能继续通知，因此不静默写入，而是让ko继续派遣变动事件．这会引发相同attr值再次被写入.
          // @TODO: ko内置的update更新元素attr之前不会检查是否变动，是否需要添加attr的update,以支持这一特性？
          // ko.expressionRewriting.writeValueToProperty(attrValue, allBindings, attrName, element.getAttribute(attrName))
          attrValue(element.getAttribute(attrName))
        }
        // console.log(`in ${ko.attrChanged}`, arguments)
      })
    }
  }
  // ko.expressionRewriting.twoWayBindings['attr'] = true
}
