# webpack性能优化

# 前言

在框架流行的今天，前端打包越来越重要，也越来越复杂，今天，我们不会浪费篇幅给大家讲如何写配置文件。而是关注如何能优化我们的打包的时间，以及打包后的代码体积等。

# 分析打包速度

优化webpack构建速度的第一步就是要知道将精力集中在哪里，首先，我们可以通过speed-measure-webpack-plugin测量你的webpack构建期间的各个阶段的花费时间。
```js
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin'

const smp = new SpeedMeasurePlugin()

export default smp.wrap(config)
```

## 影响打包速度的环节

### 开始打包，我们需要获取所有的依赖模块

搜索所有的依赖模块，这需要占用一定的时间，所以我们时间优化的第一项就是减少`搜索时间`

### 解析所有的依赖模块(编译成浏览器可运行的代码)

webpack根据我们配置的loader文件将对应的文件进行解析，日常开发中我们需要使用loader对js、css、图片、字体等文件进行相应处理，并且转换处理的文件也是十分大，由于js单线程的特性使得这些文件不能并发处理，而是需要一个个文件处理，所以我们时间优化的第二项就是减少`解析时间`

### 将所有依赖打包到一个文件

待所有文件解析完成后，打包到一个文件中，为了使浏览器加载的包更小(减少白屏时间),所以webpack会对代码进行相应的优化。

js 压缩是发布编译的最后阶段，时间耗费比较久，因为需要将js压缩成AST语法树，然后根据复杂的规则去解析和处理AST，最后将AST还原回JS。所以我们时间优化的第三项是`压缩时间`

### 二次打包

当我们只该懂了项目中的一个小小的文件，所有文件都会重新打包，但大部分文件并没有变更。所以我们时间优化的第四项是`二次打包时间`

## 优化搜索时间

>缩小文件搜索范围,减少不必要的编译工作

webpack在打包时，会从entry出发，解析入口文件的导入语句，再递归解析。在遇到导入语句时，webpack会做两件事。`根据导入语句寻找对应的文件`和`根据找到的文件的后缀，使用配置的loader文件去做对应解析`。这两件事情一旦项目文件数量增多，速度会显著降低，所以，即使我们无法避免上述两件事情，但是我们可以尽量少的减少发生来提高打包速度。

### 1、优化loader配置

使用loader时可以使用test、include、exclude三个配置项来命中要应用该规则的文件

### 2、优化resolve.modules

resolve.modules 用于配置 webpack 去哪些目录下寻找第三方模块，resolve.modules 的默认值是`['node_modules']`，含义是先去当前目录下的 ./node_modules 寻找，没有找到就去上一级目录中找，一路递归；

### 3、优化resolve.alias

resolve.alias 配置项通过别名来把原导入路径映射成新的导入路径，减少耗时的递归解析操作；

### 4、优化 resolve.extensions 配置

在导入语句中没带文件后缀时，webpack 会根据 resolve.extensions 自动带上后缀去尝试询问文件是否存在，所以配置 resolve.extensions 应注意：
* resolve.extensions 列表要尽可能小，不要把不存在的后缀添加进去
* 高频后缀名放在前面，以便尽快退出超找过程
* 在写代码时，尽可能带上后缀名，从而避免寻找过程

### 5、优化 resolve.mainFields 配置

有一些第三方模块会针对不同环境提供几分代码，路径一般会写在 package.json 中。webpack 会根据 mainFields 中配置去决定优先采用哪份代码，只会使用找到的第一个。

### 6、优化 module.noParse 配置

module.noParse 配置项可以让 webpack 忽略对部分没采用模块化的文件的递归处理，这样做的好处是能提高构建性能。原因是部分年代比较久远的库体积庞大且没有采用模块化标准，让 webpack 去解析这些文件没有任何意义

## 优化解析时间

运行在 Node.JS 上的 webpack 是单线程模式，也就是说 webpack 打包只能逐个文件处理，当文件数量比较多时，打包时间就会比较漫长，所以我们需要开启多线程来提高解析速度。

### thread-loader（webpack4 官方推荐）

把这个 loader 放在其他 loader 之前，放置在其之后的 loader 就会在一个单独的 worker【worker pool】池里运行，一个 worker 就是一个 Node.JS 进程，每个单独进程处理时间上限为 600ms，各个进程的数据交换也会限制在这个时间内。

```js
import { Configuration } from 'webpack'

const config: Configuration = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['thread-loader', 'babel-loader']
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'thread-loader',
          'css-loader',
          'less-loader'
        ]
      }
    ]
  }
}
```
**注意:** 由于工作原理的限制，thread-loader 需要放在 style-loader 之后，原因是 thread-loader 后的 loader 没法存取文件，也没法获取 webpack 的选项配置。

webpack官方说每个 worker 大概都要花费 600ms，所以为了防止启动 worker 时的高延迟，提供了对 worker 池的优化:`预热`

```js
import threadLoader from 'thread-loader'

const jsWorkerPool = {
  // 产生的 worker 数量，默认是cpu核心数 - 1
  // 当 require('os').cpus() 是 undefined时则为 1
  worker: 2, 
  
  // 闲置时定时删除 worker 进程
  // 默认为 500ms
  // 可以设置为无穷大，监视模式(--watch)下可以保持 worker 持续存在
  poolTimeout: 2000 
}

const cssWorkerPool = {
  // 一个 worker 进程中并行执行工作的数量
  // 默认为 20
  wokerParallelJobs: 2,
  poolTimeout: 2000
}

threadLoader.warmup(jsWorkerPool, ['babel-loader'])
threadLoader.warmup(cssWorkerPool, ['css-loader'])

```

**注意:**请仅在耗时的 loader 上使用

## 优化压缩时间

webpack 4 默认使用 terser-webpack-plugin 压缩插件压缩优化代码，该插件使用 terser 来缩小 JavaScript。

### terser 是什么

>官方定义:用于 ES Next 的 JavaScript 解析器、mangler/compressor（压缩器）工具包。

### 为什么webpack选择terser

> 不再维护 uglify-es，并且 uglify-js 不支持 es6+。
>
> terser 时 uglify-es 的一个分支，主要保留了与 uglify-es 和 uglify-js@3 的 API 和 CLI 兼容性。

### 启动多进程

使用多进程来并行运行提高构建速度，默认并发数量为 os.cpus().length - 1

```js
import { Configuration } from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'

const config: Configuration = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true
      })
    ]
  }
}
```

## 优化二次打包时间

我们在实际开发中，可以将改动较少的文件缓存起来，二次打包直接读取缓存就可显著提升打包速度。

使用 webpack 缓存的方法有几种，例如`cache-loader`、`HardSourceWebpackPlugin` 或 `babel-loader` 的 `cacheDirectory` 标志。这些缓存方法都有启动开销，重新运行期间在本地节省的时间很大，但是初次启动实际上会更慢。

### cache-loader

和 thread-loader 用法一样，在性能开销比较大的 loader 之前添加此 loader，以将结果缓存到磁盘

```js
import { Configuration } from 'webpack'
import { resolve } from 'path'

const config: Configuration = {
  module: {
    rules: [
      {
        test: /\.js$/
        use: ['cache-loader', ...loaders],
    		include: resolve('src')
      }
    ]
  }
}
```
### HardSourceWebpackPlugin

使用此插件有两点需要注意:

* 第一次构建将花费正常时间
* 第二次构建将显著加快（大约提升 90% 的构建速度）

```js
import { Configuration } from 'webpack'
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin'

const config: Configuration = {
  plugins: [
    new HardSourceWebpackPlugin()
  ]
}
```

### DLLPlugin

DllPlugin 可以将特定的类库提前打包然后引入。这种方式可以极大的减少打包类库的次数，只有当类库更新版本才有需要重新打包，并且也实现了将公共代码抽离成单独文件的优化方案。接下来我们就来学习如何使用 DllPlugin
```js
// 单独配置在一个文件中
// webpack.dll.conf.js
const path = require('path')
const webpack = require('webpack')
module.exports = {
  entry: {
    // 想统一打包的类库
    vendor: ['react']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].dll.js',
    library: '[name]-[hash]'
  },
  plugins: [
    new webpack.DllPlugin({
      // name 必须和 output.library 一致
      name: '[name]-[hash]',
      // 该属性需要与 DllReferencePlugin 中一致
      context: __dirname,
      path: path.join(__dirname, 'dist', '[name]-manifest.json')
    })
  ]
}
```
然后我们需要执行这个配置文件生成依赖文件，接下来我们需要使用 DllReferencePlugin 将依赖文件引入项目中
```js
// webpack.conf.js
module.exports = {
  // ...省略其他配置
  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      // manifest 就是之前打包出来的 json 文件
      manifest: require('./dist/vendor-manifest.json'),
    })
  ]
}

//vue.config.js
const webpack = require('webpack')

module.exports = {
    ...
    configureWebpack: {
        plugins: [
          new webpack.DllReferencePlugin({
            context: process.cwd(),
            manifest: require('./public/vendor/vendor-manifest.json')
          })
        ]
    }
}
```

# 减少打包后的体积

## 按需加载

想必大家在开发 SPA 项目的时候，项目中都会存在十几甚至更多的路由页面。如果我们将这些页面全部打包进一个 JS 文件的话，虽然将多个请求合并了，但是同样也加载了很多并不需要的代码，耗费了更长的时间。那么为了首页能更快地呈现给用户，我们肯定是希望首页能加载的文件体积越小越好，`这时候我们就可以使用按需加载，将每个路由页面单独打包为一个文件`。当然不仅仅路由可以按需加载，对于`loadash`这种大型类库同样可以使用这个功能。

按需加载的代码实现这里就不详细展开了，因为鉴于用的框架不同，实现起来都是不一样的。当然了，虽然他们的用法可能不同，但是底层的机制都是一样的。都是当使用的时候再去下载对应文件，返回一个`Promise`，当 `Promise` 成功以后去执行回调。

## Scope Hoisting

**Scope Hoisting 会分析出模块之间的依赖关系，尽可能的把打包出来的模块合并到一个函数中去。**

比如我们希望打包两个文件
```js
// test.js
export const a = 1
// index.js
import { a } from './test.js'
```
对于这种情况，我们打包出来的代码会类似这样
```js
[  /* 0 */
  function (module, exports, require) {
    //...
  },
  /* 1 */
  function (module, exports, require) {
    //...
  }
]
```
但是如果我们使用 Scope Hoisting 的话，代码就会尽可能的合并到一个函数中去，也就变成了这样的类似代码:
```js
[
  /* 0 */
  function (module, exports, require) {
    //...
  }
]
```
这样的打包方式生成的代码明显比之前的少多了。如果在 Webpack4 中你希望开启这个功能，只需要启用`optimization.concatenateModules`就可以了。
```js
module.exports = {
  optimization: {
    concatenateModules: true
  }
}
```

## Tree Shaking
Tree Shaking 可以实现删除项目中未被引用的代码，比如:
```js
// test.js
export const a = 1
export const b = 2
// index.js
import { a } from './test.js'
```

对于以上情况,`test`文件中的变量`b`如果没有在项目中使用到的话，就不会被打包到文件中。

如果你使用 Webpack 4 的话，开启生产环境就会自动启动这个优化功能。

# 小结

在本篇文章中，我们了解了如何分析打包速度以及优化各个环节的打包时间，但是由于webpack迭代很快，各个版本实现的优化方式可能会有区别，所以我们没有使用过多的代码去展示，具体的实现各位同学可以查找具体的版本即可。

