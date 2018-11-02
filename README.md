# 1. 环境准备(ubuntu)

 - 基础环境安装
```bash
  sudo add-apt-repository ppa:webupd8team/java
  sudo apt update
  sudo apt install oracle-java8-installer
  #请配置使用oracle java8以上。closure compiler依赖java。
  sudo update-alternatives --config java
  sudo apt-get install libssl1.0-dev nodejs-dev npm p7zip proxychains4
  sudo npm install -g electron electron-builder yarn jsdoc gulp-cli prettyjson eslint eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-standard eslint-plugin-compat webpack webpack-cli webpack-dev-server
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
