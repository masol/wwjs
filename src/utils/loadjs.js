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
// Created At : 2018-11-19T12:08:32.567Z by masol (masol.li@gmail.com)

'use strict'

import loadjs from 'loadjs'
/**
加载器模块，基于[loadjs](https://github.com/muicss/loadjs)。基于两个考虑:
- 经实战，很多库在标准es module下会有问题，说明ES Module尚未普及。例如Bootstrap 4.1.3。因此废弃了[systemjs](https://github.com/systemjs/systemjs)支持。
- 尺寸考量，loadjs比[requirejs](https://requirejs.org/)轻量很多。
@module utils/loadjs
*/

export default loadjs
