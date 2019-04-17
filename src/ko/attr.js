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
  ko.attrMapper = ko.attrMapper || {}
  // 改写ko中attr.js，将其改写为双向绑定。
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
    if (!Object.isEmpty(attrMap)) {
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
  // @TODO 改写ko中update，拦截更新的属性名，并检查是否是一个剖面处理，如果是，处理之。
  // 从ko中获取代码： https://github.com/knockout/knockout/blob/master/src/binding/defaultBindings/attr.js
  var attrHtmlToJavaScriptMap = { 'class': 'className', 'for': 'htmlFor' }
  ko.bindingHandlers.attr.update = function (element, valueAccessor, allBindings) {
    var value = ko.utils.unwrapObservable(valueAccessor()) || {}
    ko.utils.objectForEach(value, function (attrName, attrValue) {
      attrValue = ko.utils.unwrapObservable(attrValue)

      // Find the namespace of this attribute, if any.
      var prefixLen = attrName.indexOf(':')
      var namespace = 'lookupNamespaceURI' in element && prefixLen > 0 && element.lookupNamespaceURI(attrName.substr(0, prefixLen))

      // To cover cases like "attr: { checked:someProp }", we want to remove the attribute entirely
      // when someProp is a "no value"-like value (strictly null, false, or undefined)
      // (because the absence of the "checked" attr is how to mark an element as not checked, etc.)
      var toRemove = (attrValue === false) || (attrValue === null) || (attrValue === undefined)
      if (toRemove) {
        namespace ? element.removeAttributeNS(namespace, attrName) : element.removeAttribute(attrName)
      } else {
        attrValue = attrValue.toString()
      }

      // In IE <= 7 and IE8 Quirks Mode, you have to use the JavaScript property name instead of the
      // HTML attribute name for certain attributes. IE8 Standards Mode supports the correct behavior,
      // but instead of figuring out the mode, we'll just set the attribute through the JavaScript
      // property for IE <= 8.
      if (ko.utils.ieVersion <= 8 && attrName in attrHtmlToJavaScriptMap) {
        attrName = attrHtmlToJavaScriptMap[attrName]
        if (toRemove) { element.removeAttribute(attrName) } else { element[attrName] = attrValue }
      } else if (!toRemove) {
        namespace ? element.setAttributeNS(namespace, attrName, attrValue) : element.setAttribute(attrName, attrValue)
      }

      // Treat "name" specially - although you can think of it as an attribute, it also needs
      // special handling on older versions of IE (https://github.com/SteveSanderson/knockout/pull/333)
      // Deliberately being case-sensitive here because XHTML would regard "Name" as a different thing
      // entirely, and there's no strong reason to allow for such casing in HTML.
      if (attrName === 'name') {
        ko.utils.setElementName(element, toRemove ? '' : attrValue)
      }

      // 这里开始检查并调用attrMapper中的剖面处理代码。
      let handler = ko.attrMapper[attrName]
      if (Function.isFunction(handler)) {
        handler(element, toRemove ? undefined : attrValue, toRemove)
      }
    })
  }
}
