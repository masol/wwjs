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
// Created At : 2019-01-24T07:54:04.786Z by lizhutang (lizhutang@spolo.org)

'use strict'

/**
国际化支持的工作流，使用gettext工作链。
- 编辑期:
 1. 为需要显示的字符串使用`wwjs.i18n()`来获取对应的翻译文本。
 2. 在初始化时，通过wwjs.i18n.load(baseurl[,validLangs])来加载翻译。
- 然后，就是初始化时加载的翻译文本的创建过程:
 1. 使用[xgettext](https://www.gnu.org/software/gettext/manual/html_node/xgettext-Invocation.html)抽取(key=wwjs.i18n),创建po文件.示例命令行:`xgettext -kwwjs.i18n -j -omessage.po --from-code=utf-8 FILENAME`
 2. 使用[poedit](https://poedit.net/)翻译po文件.
 3. 使用[gettext-parser](https://github.com/smhg/gettext-parser)或[i18next](https://www.i18next.com/)将po翻译为json格式，保存在服务器。
 4. 每增加一个语言，修改初始化代码的validLangs来支持。
@module utils/i18n
*/

let currentLangs
let translations = {}
function getDefLang () {
  let langs = navigator.languages
    ? navigator.languages
    : (navigator.language || navigator.userLanguage)
  if (typeof langs === 'string') {
    langs = [langs]
  }
  return langs
}

/**
将指定的原始字符串翻译为当前语言环境的语言。
@exports utils/i18n
@access public
@param {string} key 原始字符串
@method i18n
@return {string} 返回翻译文本，如果当前不存在此字符串的翻译，返回原始字符串。
*/
let i18n = function (str) {
  return translations[str] || str
}

/**
将指定的翻译内容加入到当前翻译中。
@exports utils/i18n
@access public
@param {object} trans key:value的对象格式。加入到当前翻译中。
@method add
@return {undefined}
*/
i18n.add = function (trans) {
  if (typeof trans === 'object') {
    $.extend(translations, trans)
  }
}

/**
将指定的原始字符串翻译为当前语言环境的语言。
@exports utils/i18n
@access public
@param {string} baseURL 基础URL,如果给定了第二个参数，这是一个目录，后续跟`语言.json`构成全路径;否则，这是一个全路径，要求返回JSON格式。
@param {array} [validLangs=undefined] 给定baseURL下保存的有效语言，将根据当前语言环境来选择合适的语言。
@method load
@return {Promise<Object>} 返回一个Promise,最终解析为翻译对象。
@TODO: 实现i18n load.
*/
i18n.load = function (baseURL, validLangs) {
}

/**
重置语言环境，也可以用本函数来获取当前语言设置。
@exports utils/i18n
@access public
@param {boolean} [force=false] 是否强制清空当前翻译，无论语言是否变化。
@param {string} [lang=undefined] 重置当前语言,如果未给出语言，则使用当前浏览器的语言设置。
@method reset
@return {Array<string>} 返回重置后的语言选项。
*/
i18n.reset = function (force, lang) {
  if (!currentLangs) {
    currentLangs = getDefLang()
  }
  if (lang && (!currentLangs || currentLangs.length === 0 || currentLangs[0] !== lang)) {
    force = true
    currentLangs = [lang]
  }
  if (force) {
    translations = {}
  }
  return currentLangs
}

export default i18n
