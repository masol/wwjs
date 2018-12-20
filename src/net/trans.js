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
// Created At : 2018-12-20T08:53:28.949Z by masol (masol.li@gmail.com)

'use strict'

/**
@module net/trans
@desc 负责将其它格式转化为net可以执行的格式.
*/

/**
@exports net/trans
@method reg
@desc 注册一个处理器，通常由插件在加载时调用。
@param {string} name 转化处理器，可以是@开头的标准库，或者一个URL来加载处理器。如果空或者未定义，则采用默认转化器，直接返回cmd
@param {function} handler 转化器函数，接受(cmd)参数，并返回Promise<cmd>。
@return {function|undefined} 返回本名称下，历史注册的处理器。
*/
function reg (name, handler) {
}

/**
获取一个处理器对象。
@exports net/trans
@method get
@param {string} name 转化处理器，可以是@开头的标准库，或者一个URL来加载处理器。如果空或者未定义，则采用默认转化器，直接返回cmd
@param {boolean} [autoload=false] 如果转化器不存在，是否自动加载?
@return {function|undefined} 返回本名称下，注册的处理器。
*/
function get (name, autoload) {
}

/**
@exports net/trans
@method tran
@desc 将给定的cmd按照给定名称的tran来转化。
@param {string} name 转化处理器，可以是@开头的标准库，或者一个URL来加载处理器。如果空或者未定义，则采用默认转化器，直接返回cmd
@param {any} cmd 命令对象，类型由处理器来决定，通常是字符串或对象。
@return {Promise<object|array>} 如果转化成功，返回标准的object或array格式。
*/
function tran (name, cmd) {
  return cmd
}

export default {
  get: get,
  reg: reg,
  tran: tran
}
