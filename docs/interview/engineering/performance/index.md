---
title: 性能优化
order: 1
group:
  title: 工程化
  order: 3
---

# 性能优化

## 1. 前端性能优化

前端性能优化首先我们要确定一个目标就是响应到绘制时间控制，帧率控制，我们首先会在 Google PageSpeed insights 跑一下分，然后根据优化建议来，这里面可能占比比较多的就是为使用的 JavaScript 脚本、图片格式、阻塞渲染的资源、DOM 规模过大这种。那我们在实操的时候基本会围绕请求前、请求中、请求后来进行性能优化。

请求前：

1. 代码优化：
   React 代码优化的方式可能就是减少不必要的 re-render，减小浏览器渲染压力，组件层级、页面组件动态加载、离屏元素滑动到某一个位置再展示这种代码层级优化。

   还包括使用 worker 来处理阻塞逻辑。

   loading 页、骨架屏来让加载更顺滑。

2. 让浏览器请求资源更小：这里面可能涉及到一些打包的，比如压缩代码、tree-shaking、scope-hosting、图片压缩、webp、资源 CDN，这种我们尽量让资源包更小。
3. 浏览器像服务器请求资源包，涉及到的一些 DNS 解析的优化，可能就在运维层了。

请求中：可能涉及一些 HTML 解析渲染的优化、包括 html 模板的优化，下一页面的 prefetch、本页面资源的 preload、script 设置 defer、async 这种。

请求后：就是如何让页面下一次进来更快，那就涉及到资源缓存问题，那浏览器资源的缓存实质上也就是 HTTP 缓存，也就是强缓存和协商缓存的应用，服务器端会给每个资源设置 cache-control 和 expires 字段，如果命中在有效期内，就不会像服务器发起资源请求，浏览器直接使用本地缓存，否则浏览器会携带资源的版本号 (Etag 或者 last-modified)像服务端询问资源是否可以使用，如果服务器检查没有变化，就返回 304，依然使用本地资源。

    还有就是使用service-worker，来拦截请求，处理缓存逻辑。

## 2. RN 性能优化

1.  减少 re-render

    对于 react 来说，减少 re-render 可以说是收益最高的事情了。

    1. shouldComponentUpdate
    2. PureComponent/React.memo

       **_把组件细分为很小的子组件，然后统一用 PureComponent 进行渲染时机的管理 或者 使用 immutable 对象，再配合 PureComponent 进行数据比较_**

2.  减轻渲染压力

    RN 底层依赖的是 Yoga 这个跨平台布局库，那我们 View 嵌套的时候在 Native 层是一个黑盒，我们不知道里面的层级和绘制关系，那我们要做的就是尽量减少组件层级，通过 fragment 或者空标签，包括减少 GPU 绘制，减少背景色的重复设置，避免 GPU 绘制的细节很多，我们一般不做这么精细化的处理。

3.  图片的优化：图片要有三级缓存，这个可以自己封装也可以使用第三方库，我们用的是`react-native-fast-image`，多图加载时内存暴涨的问题我们可以通过 Image 有一个 resizeMethod 解决，当图片实际尺寸和容器尺寸不一致，使用什么样的策略调整图片尺寸。
    还有就是 webp、图床这样的控制。

4.  动画性能优化：

    1.  `useNativeDrive:true` 开启原生动画驱动

        ```
          Animated.timing(this.state.animatedValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true // <-- 加上这一行
            }).start();
        ```

        - 通过启用原生驱动，我们在启动动画前就把其所有配置信息都发送到原生端，利用原生代码在 UI 线程执行动画，而不用每一帧都在两端间来回沟通。如此一来，动画一开始就完全脱离了 JS 线程，因此此时即便 JS 线程被卡住，也不会影响到动画了。
          这个属性也有着局限性，只能使用到只有非布局相关的动画属性上，例如 transform 和 opacity。布局相关的属性，比如说 height 和 position 相关的属性，开启后会报错。而且前面也说了，`useNativeDriver 只能用在可预测的动画上，比如说跟随手势这种动画，useNativeDriver 就用不了的`。

    2.  `setNativeProps`：setNativeProps 这个属性，相当于直接操作浏览器的 DOM，例如有一个根据滑动距离修改页面文字的功能，如果把文字存在 setState 里，就会进行大量 setState，我们可以用 setNativeProps，避免 react 端重绘，相当于直接修改 DOM 上的数字，让动画更加流畅。

    3.  使用`InteractionManager`: 在 React Native 里，JS 线程太忙了，啥都要干，我们可以把一些繁重的任务放在 InteractionManager.runAfterInteractions() 里，确保在执行前所有的交互和动画都已经处理完毕。

    4.  如果要用 React Native 构建复杂的手势动画，使用 react-native-gesture-handler 和 react-native-reanimated，是一个不错的选择，可以大幅度提高动画的流畅度。

5.  长列表的优化

    长列表的优化核心思想：渲染当前展示和即将展示的 View，距离远的 View 用空白 View 展示，从而减少长列表的内存占用

    - ScrollView：会把视图里的所有 View 渲染，直接对接 Native 的滚动列表
    - VirtualizedList：虚拟列表核心文件，使用 ScrollView，长列表优化配置项主要是控制它
    - FlatList：使用 VirtualizedList，实现了一行多列的功能，大部分功能都是 VirtualizedList 提供的
    - SectionList：使用 VirtualizedList，底层使用 VirtualizedSectionList，把二维数据转为一维数据

    一般长列表我们还是使用 FlatList 配合属性完成。

    - initialNumToRender：首批应该渲染的元素数量，刚刚盖住首屏最好。
    - windowSize：渲染区域高度，一般是视口高度的整数倍，我一般设置为 3，上面扩展 1 个屏幕高度，下面扩展一个屏幕高度，这个区域里的内容都保存在内存里。将 windowSize 设置为一个较小值，能有减小内存消耗并提高性能，但是快速滚动列表时，遇到未渲染的内容的几率会增大，会看到占位的白色 View。大家可以把 windowSize 设为 1 测试一下，100% 会看到占位 View。所以，我们在长列表的时候设置的 3 或 5，减少快速滚动白屏的出现。
    - removeClippedSubviews：裁剪子视图，设置为 true（Android 0.59+默认开启此功能）
    - maxToRenderPerBatch：渲染最大数量
    - updateCellsBatchingPeriod：渲染时间间隔

    **调参是门玄学，结合 GPU 分析调试就好了。**

6.  Bundle 加载以及白屏问题：Native 容器预热，bundle 拆分

    容器预热还是通过 RCTBridge 将 Bundle 先加载到内存里。
