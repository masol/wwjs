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
- debug : true 如果被定义为false，则关闭调试模式，不再在console输出错误信息。默认是true.
- libbase : "//libs.YOURDOMAIN.COM" , 如果被定义一个字符串(空字符串表示引用本地服务器地址)，则用来做外部引入库的根路径。默认是"//libs.wware.org" : 注意服务器的CORS设置。
- autoko: true 自动启用ko对mutation的监听处理。如果设置为false,则不启动自动监听处理，这在页面加载时，对平滑加载有帮助。
- nsprefix : "XXXX"  //如果未定义，默认为`wwns`，详情参考[ko/ns模块](module-ko_ns.html)
- container : "Selector" //定义第一顺位选择器，详情查看[utils/ui模块](module-utils_ui.html#~$container)
- vmtypecvt : false //设置给vm某个变量设置值时，当类型不同时，是否允许转换？默认是不允许类型转化的，设置为true可以自动转化。
- container: '#wwcontainer' //设置页面中wwjs checker处理的根元素的selector.
- cmdTimout: 10000 //设置等待命令注册的超时时间，默认是10秒，参考[net.cmd](module-net.html#~cmd)
- clsTimeout: 10000 //设置wwclass.get等待外部类加载的超时时间，默认是秒，参考[wwclass.get](wwclass.html#.get).
- strict : false //严格模式。在非严格模式下(默认)，支持如下特性(参考[ko.autoinit](module-ko.html#~autoinit)):
 - ko绑定时，发现未定义的变量，自动定义。
 - ko绑定初始化时，如果变量值为空，则自动初始化为对应的attr,text,html以及value的值。
- indicator : false|bgcolorstr|object // 设置indicator的背景颜色，默认为“#fff0”。如果设置为false,则禁用indicator。如果是object，内容如下：
 - bgcolor: 等同于indicator的bgcolorstr。
 - style : 用于设置indicator的style，默认为“working”。有效值为'progress','img','text'。
 - color: 用于设置indicator条或文字的颜色。
 - text: 只有类型为text时才有效，设置文本内容。
 - imgurl: 只有类型为img时才有效，设置img的URL地址。
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
const CMDTIMEOUT = 10000
const CLSTIMEOUT = 10000

cfg.libbase = '//libs.wware.org'
cfg.debug = true
cfg.autoko = true
cfg.cmdTimout = CMDTIMEOUT
cfg.clsTimeout = CLSTIMEOUT
cfg.container = '#wwcontainer'
if ((typeof window.wwcfg === 'object')) {
  for (let i in window.wwcfg) {
    cfg[i] = window.wwcfg[i]
  }
  // 如果等待命令注册的超时时间小于100毫秒(例如设置了非数字)，改回默认值。
  cfg.cmdTimout = parseInt(cfg.cmdTimout) || CMDTIMEOUT
  if (!(cfg.cmdTimout > 100)) {
    cfg.cmdTimout = CMDTIMEOUT
  }
  cfg.clsTimeout = parseInt(cfg.clsTimeout) || CLSTIMEOUT
  if (!(cfg.clsTimeout > 100)) {
    cfg.clsTimeout = CLSTIMEOUT
  }
  if (cfg.libbase[cfg.libbase.length - 1] === '/') {
    cfg.libbase = cfg.libbase.substr(0, cfg.libbase.length - 1)
  }
}

export default cfg
