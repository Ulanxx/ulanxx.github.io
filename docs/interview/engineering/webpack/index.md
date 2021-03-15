---
title: Webpack
order: 1
group:
  title: 工程化
  order: 3
---

# webpack

## 0. 什么是 webpack 和 grunt 和 gulp 有什么区别

webpack 是一个模块打包器，可以递归打包项目中的所有模块，进行分析转化编译输出，最终生成几个打包后的文件。和其他工具最大的区别在于他支持 code-splitting、模块化、全局分析。

## 1. loader 和 plugin

- **_loader_**：它是一个转换器，将 A 文件进行编译成 B 文件，比如：将 A.less 转换为 A.css，单纯的文件转换过程。

- **_plugin_** 是一个扩展器，它丰富了 webpack 本身，针对是 loader 结束后，webpack 打包的整个过程，它并不直接操作文件，而是基于事件机制工作，会监听 webpack 打包过程中的某些节点，执行广泛的任务。

## 2. 打包原理

Webpack 处理项目时，它会递归地构建一个依赖关系图，其中包含应用程序所需要的每个模块，然后将这些模块打包成一个或者多个 bundle。

**打包原理：**

1. 识别入口文件
2. 通过逐层识别模块依赖（commonjs、amd、es6 module），webpack 都会进行分析，来获取代码的依赖关系。
3. webpack 做的就是分析代码、转换代码、编译代码、输出代码
4. 最终形成打包后的代码。

## 3. 基本配置

- entry: 入口文件
- output：在哪里输出
- bundledevtool：开发者工具
- source-map: 转化代码映射成源文件的规则
- devServer：创建开发服务器
- plugins:

  - CleanWebpackPlugin 删除 dist 目录,
  - HtmlWebpackPlugin 生成 html 文件

- loader

  - style-loader、css-loader

- 注意，对于 loader 的执行顺序，是从后往前的。

## 4. 常用 loaders￼

- 样式：style-loader、css-loader、less-loader、sass-loader 等
- 文件：raw-loader、file-loader 、url-loader 等
- 编译：babel-loader、ts-loader 等
- 校验测试：mocha-loader、jshint-loader 、eslint-loader 等

## 5. 常用 plugin

- html-webpack-plugin：多入口时，当你的  index.html  引入多个 js，如果这些生成的 js 名称构成有  [hash] ，那么每次打包后的文件名都是变化的。
- imagemin-webpack-plugin：图片压缩
- clean-webpack-plugin：每次进行打包需要手动清空目标文件夹
- commons-chunk-plugin：提取重复被引入的文件，单独生成一个或多个文件，避免多入口重复打包文件
- copy-webpack-plugin:一些静态资源（图片、字体等），在编译时，需要拷贝到输出文件夹
- DllPlugin：拆分 bundles，加载构建速度

## 6. Tree-shaking 

Tree-shaking 的本质是消除无用的 js 代码，实际情况中，虽然依赖了某个模块，但其实只使用其中的某些功能。通过 tree-shaking，将没有使用的模块摇掉，这样来达到删除无用代码的目的。

找到你整个代码里真正使用的代码，打包进去，那么没用的代码自然就剔除了。tree shaking 得以实现，是依赖是 es6 的模块特性。
关于 es6 module 的特性，大概有如下几点：

1. 必须写在最外层，不能写在函数里
2. import 的语句具有和 var 一样的提升(hoist)特性。
   tree shaking 首先会分析文件项目里具体哪些代码被引入了，哪些没有引入，然后将真正引入的代码打包进去，最后没有使用到的代码自然就不会存在了。

## 7. babel

1. 使用 babylon 解析器，将 JS 代码解析成 AST 抽象语法树。
2. 根据一定规则转换、修改 AST
3. 使用 babel-generator 将修改后的 AST 转化成普通代码

## 8. webpack3 和 4 的区别

1. 新增了 mode 参数：表示开发和生产，production 侧重于打包后的文件大小，development 侧重于构建速度
2. 移除 loaders，必须使用 rules
3. 移除了 commonsChunkPlugin（提取公共代码），用 `optimization.splitChunks`和`optimization.runtimeChunk`代替
4. 支持 es6 的方式导入 json 文件，可以过滤无用代码

## 9. 利用 webpack 优化前端代码

1. 提取公共代码。webpack4 移除了 CommonsChunkPlugin (提取公共代码)，用 optimization.splitChunks 和 optimization.runtimeChunk 来代替
2. 压缩代码。（development 和 production）在 webpack 中 Tree-shaking 是通过 uglifySPlugin 来 Tree-shaking JS
3. 使用 loader 的时候，使用 exclude 排除 node_modules 中的文件
4. 使用 TreeShaking 插件：Tree-shaking 概念最早由 Rollup.js 提出，后来在 webpack2 中被引入进来，但是这个这一特性能够被支持得益于 ES6 modules 的静态特性。ES6 的模块声明相比于传统 CommonJS 的同步 require 有着本质区别。这种 modules 设计保证了依赖关系是提前确定的，使得静态分析成为了可能，与运行时无关。（除那些引用的但却没有使用的代码）

## 10. 什么是长缓存？在 webpack 中如何做到长缓存优化？

1. 浏览器在用户访问页面的时候，为了加快加载速度，会对用户访问的静态资源进行存储，但是每一次代码升级或是更新，都需要浏览器去下载新的代码，最方便和简单的更新方式就是引入新的文件名称。
2. 在 webpack 中可以在 output 纵输出的文件指定 chunkhash,并且分离经常更新的代码和框架代码。
3. 通过 NameModulesPlugin 或是 HashedModuleIdsPlugin 使再次打包文件名不变。

## 11. webpack 的生命周期

可以安装 lifecycle-webpack-plugin 查看生命周期信息
