// ////////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// ////////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-13T07:13:47.688Z by masol (masol.li@gmail.com)

'use strict'

import EventEmitter from 'eventemitter3'

const EE = new EventEmitter()
window.EE = EE

export default EE
