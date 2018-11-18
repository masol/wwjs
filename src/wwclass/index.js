// / //////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// / //////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-18T08:42:52.706Z by masol (masol.li@gmail.com)

'use strict'

import * as lit from 'lit-html'

console.log(lit.html)
console.log(lit.render)

// function readonly (target, key, descriptor) {
//   console.log(target)
// }

class wwclass {
//  @readonly
  test () {
    return lit.html`this is only a test`
  }
}

/**
wwclass是wwjs的元素类，它没有像[webcomponents](https://www.webcomponents.org/)那样利用[custom-element](https://caniuse.com/#search=Custom%20Elements)机制。而是使用mutation监听需要的属性变更，来模拟一个元素，同时兼顾了对KO的事件更新。内部的模板机制，推荐使用[lit-html](https://github.com/Polymer/lit-html)，内置并暴露在`wwjs.lit`名称空间下。
@module wwclass
*/
export default {
  lit: lit,
  wwcls: wwclass
}
