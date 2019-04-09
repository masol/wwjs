# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.8.1"></a>
## [1.8.1](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.7.9...v1.8.1) (2019-04-09)


### Bug Fixes

* 修正doRender回调时，元素可能已销毁的bug——销毁的元素,doRender调用被忽略。同时缓冲了render属性返回的函数。 ([9ddc3bb](https://gitlab.wware.org/lizhutang/wwjs/commit/9ddc3bb))


### Features

* ko支持了依赖等待，可以通过wwjs脚本来扩展ko. ([8b8766f](https://gitlab.wware.org/lizhutang/wwjs/commit/8b8766f))
* wwimport可以使用`done:XXXX`来手动完成依赖指定。 ([edadea3](https://gitlab.wware.org/lizhutang/wwjs/commit/edadea3))
* 在polyfill中添加了Array.isArray以及Object.isEmpty以及Function.isFunction支持，并从对jQuery的调用中移到polyfill中。 ([9df02e1](https://gitlab.wware.org/lizhutang/wwjs/commit/9df02e1))
* 开始支持action，并添加了utils/str保存便捷函数。 ([035bcf5](https://gitlab.wware.org/lizhutang/wwjs/commit/035bcf5))
* 支持了hash串中更新viewModel(#?之后的内容) ([9cd5b67](https://gitlab.wware.org/lizhutang/wwjs/commit/9cd5b67))
* 支持了script[type="text/bindvar"]用于可以有函数定义(computed observer)初始化。 ([4eb7214](https://gitlab.wware.org/lizhutang/wwjs/commit/4eb7214))
* 支持了state维护，以检查页面是否处于元素依赖加载状态(dom chk)中. ([60e72b5](https://gitlab.wware.org/lizhutang/wwjs/commit/60e72b5))
* 支持了window.makeTemplate来动态makeTemplate. ([f7714b2](https://gitlab.wware.org/lizhutang/wwjs/commit/f7714b2))
* 改进mapping.js。支持自动mapping function类型到computedObserver。并添加测试用例来测试之。 ([a04f3d6](https://gitlab.wware.org/lizhutang/wwjs/commit/a04f3d6))
* 改进net模块及其描述，将trans作为net模块的一个特殊应用。 ([d5389f4](https://gitlab.wware.org/lizhutang/wwjs/commit/d5389f4))
* 检查datalist是否被支持，如果未被支持，自动polyfill. ([36e059a](https://gitlab.wware.org/lizhutang/wwjs/commit/36e059a))
* 调整net模块，更清晰的语义。 ([5e06400](https://gitlab.wware.org/lizhutang/wwjs/commit/5e06400))



<a name="1.7.9"></a>
## [1.7.9](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.7.8...v1.7.9) (2019-02-24)


### Bug Fixes

* 修正加载脚本默认async=false未起作用的bug.当前版本async配置不再有效，恒定async为false. ([bbd7fd5](https://gitlab.wware.org/lizhutang/wwjs/commit/bbd7fd5))
* 修正测试用例发现的loadjs.load加载时会回调两次的bug. ([6566e3e](https://gitlab.wware.org/lizhutang/wwjs/commit/6566e3e))


### Features

* 支持了i18n子模块。 ([fcd49ee](https://gitlab.wware.org/lizhutang/wwjs/commit/fcd49ee))
* 派生类可以实现一个init函数，并返回Promise,创建实例时，wwjs在构造函数之后立即调用init，并等待Promise解析之后继续执行其它部分。 ([a0a4f3e](https://gitlab.wware.org/lizhutang/wwjs/commit/a0a4f3e))
* 默认的加载，1，禁用async。2，禁止重复加载相同url的内容. ([c30d2df](https://gitlab.wware.org/lizhutang/wwjs/commit/c30d2df))



<a name="1.7.8"></a>
## [1.7.8](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.7.7...v1.7.8) (2019-01-21)


### Bug Fixes

* 修正元素文件异步注册引发的创建错误。 ([a4c234f](https://gitlab.wware.org/lizhutang/wwjs/commit/a4c234f))



<a name="1.7.7"></a>
## [1.7.7](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.7.6...v1.7.7) (2019-01-21)


### Bug Fixes

* 修正加载的元素为返回异步时引发的加载不正确。 ([e92f08d](https://gitlab.wware.org/lizhutang/wwjs/commit/e92f08d))



<a name="1.7.6"></a>
## [1.7.6](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.7.5...v1.7.6) (2019-01-21)



<a name="1.7.5"></a>
## [1.7.5](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.7.4...v1.7.5) (2019-01-21)


### Features

* wwimport导入数组时，回调会在全部选项结束时回调。 ([c63bab4](https://gitlab.wware.org/lizhutang/wwjs/commit/c63bab4))



<a name="1.7.4"></a>
## [1.7.4](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.7.3...v1.7.4) (2019-01-18)


### Features

* ui中新增加两个函数，uniq以及uniqId。详见文档。 ([df068e1](https://gitlab.wware.org/lizhutang/wwjs/commit/df068e1))



<a name="1.9.0"></a>
# [1.9.0](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.7.3...v1.9.0) (2019-01-18)


### Features

* ui中新增加两个函数，uniq以及uniqId。详见文档。 ([df068e1](https://gitlab.wware.org/lizhutang/wwjs/commit/df068e1))



<a name="1.8.0"></a>
# [1.8.0](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.7.3...v1.8.0) (2019-01-18)


### Features

* ui中新增加两个函数，uniq以及uniqId。详见文档。 ([df068e1](https://gitlab.wware.org/lizhutang/wwjs/commit/df068e1))



<a name="1.7.3"></a>
## [1.7.3](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.9.2...v1.7.3) (2019-01-18)



<a name="1.9.2"></a>
## [1.9.2](https://gitlab.wware.org/lizhutang/wwjs/compare/v2.0.0...v1.9.2) (2019-01-02)



<a name="2.0.0"></a>
# [2.0.0](https://gitlab.wware.org/lizhutang/wwjs/compare/v1.9.0...v2.0.0) (2019-01-02)


### Features

* loadjs.load方法正确处理bundleName，并管理依赖。 ([efcfe21](https://gitlab.wware.org/lizhutang/wwjs/commit/efcfe21))
* ns对象中添加template函数，以支持在指定元素对应的名称空间下展开模板。 ([b7d218c](https://gitlab.wware.org/lizhutang/wwjs/commit/b7d218c))
* wwclass支持了apply,call静态方法，以调用元素对应实例的一个方法。 ([5dd7c3a](https://gitlab.wware.org/lizhutang/wwjs/commit/5dd7c3a))
* wwclass支持了method方法以添加method,并增加了测试用例来测试这一特性。 ([9abf5da](https://gitlab.wware.org/lizhutang/wwjs/commit/9abf5da))
* 使用objectpath库来实现viewModel::get函数. ([00f11ec](https://gitlab.wware.org/lizhutang/wwjs/commit/00f11ec))
* 网络协议的命令执行添加了transform支持，用于处理不同格式的cmd. ([4251282](https://gitlab.wware.org/lizhutang/wwjs/commit/4251282))


### BREAKING CHANGES

* 移除str.lib方法，本方法移到loadjs.url.



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
