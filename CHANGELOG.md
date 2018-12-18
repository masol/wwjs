# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.9.0"></a>
# [1.9.0](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/compare/v1.8.0...v1.9.0) (2018-12-18)


### Features

* evt中添加onNodeAdd函数，以方便chk的扩展。 ([4ccf379](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/4ccf379))
* 元素加载添加了data-delay-load属性，以方便本地加载的元素扩展。 ([a51a5ed](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/a51a5ed))
* 命令集支持了str.lib格式的缩写. ([9d8449a](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/9d8449a))
* 基于尺寸考虑，使用cash-dom替换jquery. ([dbdcb2c](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/dbdcb2c))
* 支持了window.Template函数，在不支持es6 template literial的浏览器下，自动加载编译器。 ([dcd9fe7](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/dcd9fe7))



<a name="1.8.0"></a>
# 1.8.0 (2018-12-05)


### Features

* chk按照元素类型过滤，只提供nodeType===1的元素加入/删除通知。 ([0977159](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/0977159))
* systemjs支持加载.json及.css后缀的url(区分大小写)。 ([fa2ac86](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/fa2ac86))
* ui中添加block空方法 ([1273e83](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/1273e83))
* wwjs中增加了ko集成,当前尺寸120K，是否需要将ko条件引入？ ([1f744d2](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/1f744d2))
* 只要定义了doRender方法，即便没有任何初始值，初始化时也会被触发一次． ([3fc00b7](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/3fc00b7))
* 增加cfg.js来管理配置. ([2282c31](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/2282c31))
* 增加了es6-sting的检查及polyfill. ([0a101af](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/0a101af))
* 完成了ns,script,ko,viewmodel的结构 ([a0efdf5](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/a0efdf5))
* 支持了chk框架，只对元素的加入/删除做通知。 ([f2a4bb8](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/f2a4bb8))
* 支持了watch及render．并书写测试用例测试通过． ([006e5d6](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/006e5d6))
* 改进chk结构，使用EventEmiiter来解耦，不再使用注册机制。 ([de553e8](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/de553e8))
* 构建了兼容性测试基础，并修正代码，使得qq浏览器以及360浏览器的IE内核工作正常。 ([7666d5a](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/7666d5a))
* 测试体系依然转回mocha+chai。废弃jasmine测试。 ([48cc652](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/48cc652))
* 测试系统从mocha转为jasmine ([7edf028](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/7edf028))
* 添加input[type]的检查以及补丁． ([324f442](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/324f442))
* 独立出utils/ui子模块用于维护所有对HTML布局的假设。 ([3172ae6](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/3172ae6))
* 确定使用system.js作为内建加载器(支持amd extra)。 ([e6b3dce](http://wwjs@scm.spolo.org:/home/source/wwjs/wware/commits/e6b3dce))
