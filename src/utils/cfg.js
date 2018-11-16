// / ///////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2013 by sanpolo CO.LTD                                    //
//                                                                          //
//  This file is part of WIDE                                               //
//                                                                          //
//  You should have received a copy of the WIDE License along with this     //
//  program.  If not, see <http://www.wware.org/wide/license.html>.         //
//                                                                          //
//  WIDE website: http://www.wware.org/                                     //
// / ///////////////////////////////////////////////////////////////////////////
// Created At : 2018-11-12T11:50:50.884Z by masol (masol.li@gmail.com)

'use strict'

/**
本模块检查全局的window.wwcfg配置。如果未配置，则给出默认设置。

配置wwjs的方式是，在引入wwjs之前，定义`window.wwcfg`全局对象，其中可以包括如下属性：
- debug : true 如果被定义为true，则启用调试模式，在console输出更多信息。默认是false.
- libbase : "//libs.YOURDOMAIN.COM" , 如果被定义一个字符串(空字符串表示引用本地服务器地址)，则用来做外部引入库的根路径。默认是"//libs.wware.org" : 注意服务器的CORS设置。
- nsprefix : "XXXX"  //如果未定义，默认为`wwns`，详情参考[ko/ns模块](module-ko_ns.html)
- container : "Selector" //定义第一顺位选择器，详情查看[utils/ui模块](module-utils_ui.html#~$container)
- vmtypecvt : false //设置给vm某个变量设置值时，当类型不同时，是否允许转换？默认是不允许类型转化的，设置为true可以自动转化。
@example
<script>
window.wwcfg  = {
  debug : true,
  nsprefx : 'MYNSPREFIX',
  libbase : "//libs.mydomain.com/someprefix"
}
</script>
<script async src="//libs.wware.org/wwjs/2.0.0/wwjs.min.js"></script>

@module utils/cfg
*/

let cfg = {}

cfg.libbase = '//libs.wware.org'
cfg.debug = false
if ((typeof window.wwcfg === 'object')) {
  for (let i in window.wwcfg) {
    cfg[i] = window.wwcfg[i]
  }
  if (cfg.libbase[cfg.libbase.length - 1] === '/') {
    cfg.libbase = cfg.libbase.substr(0, cfg.libbase.length - 1)
  }
}

export default cfg
