// ///////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// ///////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-15T09:05:52.487Z by masol (masol.li@gmail.com)

'use strict'

/**
提供了JSON辅助函数
@module utils/json
*/

/**
对JSON.parse的一个try/catch封装，返回value/error对象以区分是否parse正确。
@exports utils/json
@method parse
@param {string} text 需要解析的字符串
@param {function} [reviver=null] 类似JSON.parse的reviver,如果给出一个转换函数，用于转换返回的数据。
@return {object} 如果成功，值保存在{value:XXXX}中，否则错误对象保存在{error:XXXX}中。
*/
function parse (text, reviver) {
  try {
    return {
      value: JSON.parse(text, reviver)
    }
  } catch (ex) {
    return {
      error: ex
    }
  }
}

/**
使用eval来parsing字符串，这允许JSON中包含function，返回value/error对象以区分是否parse正确。
@exports utils/json
@method eval
@param {string} text 需要解析的字符串
@param {object} [context={}] 解析text时使用的context,这个对象中定义的变量在text中可以当作全局变量使用。
@return {object} 如果成功，值保存在{value:XXXX}中，否则错误对象保存在{error:XXXX}中。
*/
function evalJSON (text, context) {
  try {
    return {
      value: (function (str) {
        // eslint-disable-next-line
        return eval(`(${str})`)
      }.call(context || {}, text))
    }
  } catch (ex) {
    return {
      error: ex
    }
  }
}

// @TODO 不使用JSONPath,JsPath之类的库，将viewmodel中的getVmfrompath函数移到这里。或者采用语法更接近的[jmespath.js](https://github.com/jmespath/jmespath.js)来改写(需要支持便利json时，通过函数而不是setter/getter来获取，以可以直接操作viewmodel)。

export default {
  parse: parse,
  eval: evalJSON
}
