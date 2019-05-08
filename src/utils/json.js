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
import stringify from 'serialize-javascript'

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

/**
使用[serialize](https://github.com/yahoo/serialize-javascript)库来支持JSON超集，此超集支持Map,Function,Regex等JSON不支持的特性，但是丧失了跨语言能力。
@exports utils/json
@method stringify
@param {object} obj 需要转为JSON的对象，可以包含function.
@param {object} [option={}] 配置参数:
 - space(0): 与[JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)中的space相同，指明返回字符串中的空格数。
 - isJSON(false): 指明是否是一个基础JSON，此时会调用JSON.stringify。
 - unsafe(false): 是否需要将HTML字符转义，以将返回内容可以放到attr或<script>标签中。
@return {string} 返回一个字符串，可以通过evalJSON返回为原始对象(包含函数)
@example
wwjs.JSON.stringify({
    str  : 'string',
    num  : 0,
    obj  : {foo: 'foo'},
    arr  : [1, 2, 3],
    bool : true,
    nil  : null,
    undef: undefined,
    date: new Date("Thu, 28 Apr 2016 22:02:17 GMT"),
    map: new Map([['hello', 'world']]),
    set: new Set([123, 456]),

    fn: function echo(arg) { return arg; },
    re: /([^\s]+)/g
});
// 将产生如下结果:
// '{"str":"string","num":0,"obj":{"foo":"foo"},"arr":[1,2,3],"bool":true,"nil":null,date:new Date("2016-04-28T22:02:17.156Z"),new Map([["hello", "world"]]),new Set([123,456]),"fn":function echo(arg) { return arg; },"re":/([^\\s]+)/g}'
*/

// @TODO 不使用JSONPath,JsPath之类的库，将viewmodel中的getVmfrompath函数移到这里。或者采用语法更接近的[jmespath.js](https://github.com/jmespath/jmespath.js)来改写(需要支持便利json时，通过函数而不是setter/getter来获取，以可以直接操作viewmodel)。

export default {
  stringify: stringify,
  parse: parse,
  eval: evalJSON
}
