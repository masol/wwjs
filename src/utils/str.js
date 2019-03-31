/// ///////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
/// ///////////////////////////////////////////////////////////////////////////
// Created At : 2019-03-31T13:46:20.358Z by lizhutang (lizhutang@spolo.org)

'use strict'

/**
由于浏览器兼容性问题，这里增加部分str的便捷函数。
@module utils/str
@desc
*/

/**
正则表达式(RegEx对象)的Negative lookbehind(例如/->(?>!\\->)/g或者/;(?>!\\;)/g)特性，当前吧本(2019-03-30)只有chrome支持。因此在做分割处理时，如果支持转义，则必须使用后置转义，这对使用者不友好，因此支持了本函数。
@exports utils/str
@access public
@method split
@param {String} str 给出需要转义的字符串。
@param {String} [sep=' '] 给出分割字符串。
@param {String} [escape='\\'] 给出转义字符串
@return {Array<String>}
*/
function split (str, sep, escape) {
  let ret = []
  sep = sep || ' '
  escape = escape || '\\'
  if (typeof str === 'string') {
    let tmpArray = str.split(sep)
    for (let i = 0; i < tmpArray.length; i++) {
      let s = tmpArray[i] || ''
      while (s.endsWith(escape) && i + 1 < tmpArray.length) {
        i++
        s = s.slice(0, -escape.length)
        s += tmpArray[i]
      }
      s = s.trim()
      ret.push(s)
    }
  }
  return ret
}

export default {
  split: split
}
