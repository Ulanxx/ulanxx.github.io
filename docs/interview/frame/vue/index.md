---
title: Vue
order: 1
group:
  title: 框架
  order: 3
---

# vue

1. vue 中的 mvvm 模式
vue 是数据驱动的，vue 自身将 DOM 和数据进行绑定，一旦创建绑定，DOM 和数据保持同步，
每当数据变化，DOM 会跟着变化。
ViewModel 层是 Vue 的核心，她就是 Vue 的实例，Vue 的实例是绑定在 html 元素上的，可以是 body，也可以是某个元素。
ViewModel 通过双向绑定把 View 和 Model 层连接了起来，这样开发者就只要关注在数据变化。
两个核心就是：依赖收集和更新派发。

2. v-show 和 v-if
v-show 只是设置了 css：disable: none，但是这个 dom 还是在你的 html 中。
但是 v-if 在 vnode 生成的时候就没有。

3. 如何让 css 只在组件中起作用。
style 里加 scoped
主要通过 postcss 转译实现，给 HTML 的 DOM 节点加一个不重复属性 data-v-469af010 标志唯一性
PostCSS 给一个组件中的所有 dom 添加了一个独一无二的动态属性，
然后，给 CSS 选择器额外添加一个对应的属性选择器来选择该组件中 dom，这种做法使得样式只作用于含有该属性的 dom——组件内部 dom。
```
.example[data-v-5558831a] {
 color: red;
}
```
引用了第三方组件，需要在组件中局部修改第三方组件的样式，而又不想去除 scoped 属性造成组件之间的样式污染，就需要 scoped 穿透。 1.在定义一个没有 scoped 的 style 2.通过 >>> 可以使得在使用 scoped 属性的情况下，穿透 scoped，修改其他组件的值 3.通过外层 dom 定义唯一 class 来区分。

4. 指令 keep-alive
如果把切换出去的组件保留在内存中，可以保留它的状态或避免重新渲染。

5. v-el 是干嘛的？获取元素的。

6. vue 的生命周期
```
创建前/后
beforeCreate：创建前，在\_init 执行前
created:创建后，主要做的事儿是 init props/data/watcher/events...，这个时候\$el 属性还没有显示出来
载入前/后
beforeMount:挂载之前，主要是编译模板，讲 template 编译成 render 函数，把 data 里面的数据和模板生成 html。
mounted：将编译好的 html 内容指向 DOM 对象，完成模板中的 html 渲染到指向的 el 元素。
更新前/后
beforeUpdate：在数据更新前，VirturlDOM 重新渲染和 patch 之前。
updated: VirtualDOM 重新渲染和 patch 之后调用，调用时，DOM 已经更新，可以执行依赖 DOM 的操作，大多数情况下避免在该状态期间更改 data，这样会造成无限循环。
该钩子在服务器渲染期间不被调用。
销毁前/销毁后
beforeDestroy：销毁之前，实例仍然可用
destoryed:小会之后，调用后，所有事件监听器被移除，所有子实例被销毁。该钩子服务器渲染期间不可使用。
```

7. vue 双向绑定的原理
采用数据劫持结合发布订阅的方式，通过 Object.defineProperty()来劫持各个属性的 setter 和 getter，
在数据变动时发布消息给订阅者，触发相应监听回调。
当把一个普通 JavaScript 对象传给 Vue 实例来作为它的 data 选项时，Vue 将遍历它的属性，用 Object.defineProperty，对这个 data 的属性劫持。getter 里进行依赖收集，setter 时候
获取 data 的变化，进行更新派发。

8. vue 组件间的参数传递
父->子：props
子->父：\$emit
兄弟组件:eventBus / Vuex

9. Vue 路由实现：hash 模式和 history 模式
hash 模式就是通过#拼在 url 后面的 hash 值来定位，hash 不被包括在 http 请求中，不会重新加载页面。
history 模式是采用 html5 的新特性，pushState/replaceState 对路由栈进行更改，popState 事件监听到路有变更。

10. vue 路由的钩子函数
beforeEach 主要有三个参数 to（即将进入的目标路由）、from（正要离开的路由）、next（控制网页的跳转）

11. vuex 是什么？怎么用？哪些功能场景使用？
只用来读取的状态集中放到 store 中，改变状态的方式是提交 mutations，这是一个同步的事务，异步逻辑封装在 action 中。
* 场景：共享状态与数据
* state：Vuex 使用单一状态树，每一个应用只有一个 state 实例。
* mutations：修改 store 中的状态
* * getters：用来过滤一些数据
* action:异步操作数据。

12. 自定义指令：directive，指令名称做 key，对象里有一个 inserted 函数，参数是一个 el，也就是可以拿到这个元素。

13. $route和$router 的区别
* $route是路由信息对象，包括path、params、hash、query、fullPath、name等路由信息
* $router 是路由实例，包含了路由的跳转方法，钩子函数。

14. 常用修饰符
* .prevent 提交事件不再冲在页面
* .stop 阻止点击事件冒泡
* .self 当前事件在该元素本身而不是子元素的时候会触发

15. key 值的作用？
当 Vue 用 v-for 正在更新已经渲染过的元素列表时，默认采用就地复用的策略，如果数据项的顺序被改变，Vue 将不会移动 DOM 元素来匹配数据项的顺序，而是简单复用此处的每一个元素，并且确保它在特定的索引下显示已被渲染过的每个元素，主要是为了高效的更新 VDOM。

源码里面 sameVNode 函数实现，第一层比较的就是 key，如果 key 相同，再去看其他属性，如果 key 不同，则认为新旧 VNode 不是同一个 Node。

16. computed：主要是用于数据的计算，当数据改变的时候 computed 也会改变，但是如果放到 method 里获取 data，当数据被赋值，如果数据没改变，methods 也会被重新计算，但是 computed 会缓存 oldValue，直接获取 oldValue 而不是重新计算。

17. 怎么实现组件化
不管是根组件，还是组件，都是通过 createComponent 创建 VNode，然后执行 vm.\_update，在通过 patch 把 VNode 转化成真正的 DOM 节点，patch 是调用 createElm，生成 dom

18. mixin 和 mixins 的区别
* mixin 是全局混入，会影响到每个组件的实例，通常插件都是这样进行初始化。
* mixins 通常用于组件扩展，可以将相同的业务逻辑剥离出来放在 mixins 里，然后扩展组件。另外需要注意的是 mixins 混入的钩子函数会优先于组件的钩子函数执行，并且在遇到同名选项的时候也会有选择的进行合并。

19. keep-alive 的作用，
如果你需要在组件切换的时候保存一些组件的状态防止多次渲染，就可以使用 keep-alive 组件包裹需要保存的组件。
对于 keep-alive 组件来说，它拥有两个独立的生命周期钩子函数，分别为 activated 和 deactivated，用
keep-alive 包裹的组件在切换时不会销毁，而是缓存到内存中并执行，deactivated 钩子函数，命中缓存渲染后会执行 activate 钩子函数。

20. 组件中 data 什么时候可以使用对象？
组件复用时所有组件实例都会共享 data，如果 data 是对象的话，就回造成一个组件修改 data 以后
会影响到其他所有组件，所以需要将 data 写成函数，每用到一次函数就获得新的数据。
如果是 new Vue 的方式，就没关系了。

21. 响应式原理
Vue 内部使用了 Object.defineProperty()来实现数据响应式，通过这个函数可以检测到 get 和 set 事件。
但是仅仅有 get、set 还不够，只有先执行了依赖收集，才能在属性更新的时候派发更新。
所以我们要先进性依赖收集。
`<div>{{name}}</div>`
在解析如上模板代码时，遇到{{name}}就会进行依赖收集。
通过Dep类用于解耦属性的依赖收集和派发更新操作。
在set的时候会执行dep.notify()进行派发更新。
对于数组来说Object.defineProperty如果下标改变并不能触发更新，所以vue重写了array的函数，主要是通过splice函数。

22. compile 的过程
* 将模板解析为 AST
* 优化 AST
* 将 AST 转化为 render 函数。

23. vue 不能追踪数组变化，索引变化
Vue 不能检测到对象属性的添加或删除
由于 JavaScript 的限制， Vue 不能检测以下变动的数组：当你利用索引直接设置一个项时，例如： `vm.items[indexOfItem] = newValue `当你修改数组的长度时，例如： `vm.items.length = newLength`

```
解决方法：
1、方案一：利用 Vue.set(object,key,value)
对象：Vue.set(vm.obj,"sex","man")
2、方案二：利用 this.$set(this.object,key,value)
对象：this.$set(this.obj,"sex","man")；
数组：this.\$set(this.arr,index,newVal)；
3、方案三：利用 Object.assign({},this.obj)
对象：
this.obj = Object.assign({},this.obj,{"sex","man"})；

数组： vm.items.splice(newLength)
对象：this.someObject = Object.assign({}, this.someObject, { a: 1, b: 2 })
```

简而言之，组件的配置（options）和实例（instance）是需要分开的。
最根本原因是 js 对于对象（以及数组等）是传引用的，
因为如果直接写一个对象进去，那么当依此配置初始化了多个实例之后，这个对象必定是多个实例共享的。
