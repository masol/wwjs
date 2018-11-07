# 1. 环境准备(ubuntu)

 - 基础环境安装
```bash
  sudo add-apt-repository ppa:webupd8team/java
  sudo apt update
  sudo apt install oracle-java8-installer
  #请配置使用oracle java8以上。closure compiler依赖java。
  sudo update-alternatives --config java
  sudo apt-get install libssl1.0-dev nodejs-dev npm p7zip proxychains4
  sudo npm install -g jsdoc eslint babel-eslint eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-standard eslint-plugin-compat webpack webpack-cli webpack-dev-server standard-version
```
 - 部分构建如果遭遇GFW的阻拦，而无法成功构建。请配置proxychains，通过代理来构建。编辑`/etc/proxychains.conf`，在最下方加入`http            127.0.0.1 33211`(改为你自己的代理服务器),然后，执行的命令前面都加上`proxychains4 原始命令`。
 - Atom推荐包
  - [atom-beautify](https://atom.io/packages/atom-beautify)
   - 设置中找到`javascript`下的`Disable Beautifying Language`并勾选之。我们使用ctrl+alt+b来美化其它文件类型。使用`standard-formatter`(ctrl+alt+f)来美化符合`javascript-standard`推荐格式。
  - [standard-formatter](https://atom.io/packages/standard-formatter)
  - [atom-bracket-highlight](https://atom.io/packages/atom-bracket-highlight)
  - [atom-ternjs](https://atom.io/packages/atom-ternjs)
  - [change-case](https://atom.io/packages/change-case)
  - [highlight-selected](https://atom.io/packages/highlight-selected)
  - [linter-eslint](https://atom.io/packages/linter-eslint)
    - 勾选`Fix errors on save`以及`Use global ESLint installation`两个选项。
  - [todo-show](https://atom.io/packages/todo-show)
  - [toggle-quotes](https://atom.io/packages/toggle-quotes)

# 2. 发布过程
 - 首先执行`npm run test`并确保所有测试结果正确。
 - 使用命令`npm run release [--prerelease alpha|beta]`来为git自动tag，并更新CHANGELOG.md文件。我们采用了[standard version](https://github.com/conventional-changelog/standard-version)来维护版本，请参考其提供的[commit注释规范](https://conventionalcommits.org)
 - 执行命令`npm run clean;npm run dist`来打包发行版,这将包含最新的CHANGELOG.md内容。
 - 执行命令`npm publish`来将发行包更新到npm.wware.org。注意，你的npm registry必须指向npm.wware.org。详情参考wwpkg项目的README.md。

# 3. 内建环境
 - 加载器选择，我们首先需要一个轻量级加载器，然后是es6 module规范兼容的加载器。最后选择了[systemjs](https://github.com/systemjs/systemjs)。基于如下原因：
    - 相对于[johnnydepp](https://github.com/muicss/johnnydepp),[LoadJS](https://github.com/muicss/loadjs)，对es6规范支持好，并且支持AMD(通过extra)。通过[polyfill](https://www.npmjs.com/package/promise-polyfill)可以支持到ie8+。(PS:如果选择johnnydepp，我们可以减少18k的尺寸——除了systemjs的尺寸，还有必须内建的promise polyfill)
    - 相对于[requirejs](https://requirejs.org/)更轻量，并兼容es6规范。
    - 相对于[webpack-dynamic-import](https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import)，支持全局包管理，这对于wwpkg这样的全局包管理十分高效。
    - 由于polyfill的存在，自举工作分为两个环节：
       - window.System未就绪，这发生在wwjs的polyfill加载完成之前。为了弥补这一缺陷，请使用window.wwrequire函数。并在main html首页添加如下代码(在System就绪之后，会自动调用所有请求加载模块的缓冲，并替换window.wwimport)：
```
<script>
window.wwimport = function(mod,callback,errcb){
  window.wwimcache = window.wwimcache || [];
  window.wwimcache.push({id : id,suc : callback,err : errcb});
}
</script>
```
       - 所有的polyfill加载，必须使用webpack的code split(dynamic import)来实现，以规避使用window.System.
       - 在wwjs.ready函数的回调里执行，确保polyfill以及dom ready都已经就绪。

 - Promise polyfill使用[promise-polyfill](https://www.npmjs.com/package/promise-polyfill)而不是[es6-promise](https://www.npmjs.com/package/es6-promise)，理由： 1. 轻量， 2. 专门书写而不是抽取。
