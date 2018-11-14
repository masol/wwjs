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
// Created At : 2018-11-13T12:53:36.079Z by masol (masol.li@gmail.com)

'use strict'

import ko from 'knockout'

/**
@module ko/viewmodel
@desc
*/

let viewModel = {
  personName: ko.observable('Bob'),
  abcd: ko.observable('test'),
  personAge: ko.observable(123)
}

export default viewModel
