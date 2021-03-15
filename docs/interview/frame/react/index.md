---
title: React
order: 1
group:
  title: 框架
  order: 3
---

# react

## 1. 虚拟 DOM

虚拟 DOM 就是一个 JS 对象，通过类似 tag、props、children 的属性属性来解释一个 DOM 节点。

虚拟 DOM 的优势：

1.  减少 DOM 操作

    - 比如你有 1000 个节点要添加，真实 DOM 的操作是一个个操作的，而虚拟 DOM 我可以构建好通过一次操作。
    - 如果我要添加 1000 个节点，但是我 DOM 里已经有 999 个了，借助 DOM diff 就可以把多于的操作都省掉，只添加 1 个就好了。

2.  跨平台：虚拟 DOM 不仅仅转化成 DOM 还可以转化成小程序、RN，只要有一个 js 的解释器，因为虚拟 DOM 只是一个 JS 对象。

## 2. diff 算法

Diff 就是一个 patch 函数，用来查看新旧 tree 的差别，从而做 DOM 的局部更新。

**_DOM diff 的大概逻辑是_**：新旧两棵树逐层对比，统计比较，找出那些节点需要更新，然后判断节点是一个组件还是标签，如果是组件就看组件类型是否相同，不同直接替换，组件类型相同则只更新组件属性然后深入组件递归继续 diff，如果是标签，则看标签名是否相同，不相同直接替换，相同也是只更新属性，然后深入标签递归 diff。

## 3. setState

首先 setState 可以是同步也可以是异步的，在原生事件回调里是同步的，在 setTimeout 里也是同步的。

### 当你调用 setState 的时候发生了什么事儿？

1.  将传递给 setState 的对象合并到组件的当前状态，并触发调和过程。
    调和过程分两个阶段：

        1.  render 阶段
            - 根据新的 props 和 state 生成新的 DOM 树，并和旧的 DOM 树进行 Diff 比较
            - 根据对比差异生成 patch，预生成新增的 Dom 对象，先挂载到 fiber 上。
        2.  Fiber 的异步调度阶段
            fiber 是调和过程的最小单元，Fiber 内记录了组件数据，要执行的任务，以及 schedule 任务调度相关（见下节）信息，执行更新任务的整个流程就是在反复寻找工作单元并运行它们。

            每个 fiber 其实就是一个储存了很多上下文信息的虚拟 DOM，因为他对应了组件实例以及 DOM 元素，
            所以 fiber 也会形成 fibertree，但是不是一个树形，而是一个链表结构。

            当交互事件调用 setState 后，会批量触发更新，在整个交互事件回调执行完之前 state 都不会发生变更。
            回调执行完毕后，开始更新任务，并触发调度。调度器会给这些更新任务一一设置优先级，并且在浏览器
            空闲的时候去执行他们，当然如果检测到有任务过期会立即触发更新。

            如果在执行更新的时候，有新任务进来，会判断两个任务的优先级高低，加入新任务优先级高，那么打断
            旧的任务，重新开始，否则继续执行任务。

            其数据结构如下

                ```
                Fiber = {
                    tag: WorkTag,
                    key: null | string,
                    elementType: any, // 从ReactElement 获取
                    type: any,   // 一般与elementType相同，只对于lazy component 为null
                    stateNode: any,
                    return: Fiber | null,
                    child: Fiber | null,
                    sibling: Fiber | null,
                    index: number,
                    ref: null | (((handle: mixed) => void) & {_stringRef: ?string}) | RefObject,
                    pendingProps: any, // This type will be more specific once we overload the tag.
                    memoizedProps: any, // The props used to create the output.
                    updateQueue: UpdateQueue<any> | null,
                    memoizedState: any,
                    contextDependencies: ContextDependencyList | null,
                    mode: TypeOfMode,
                    effectTag: SideEffectTag,
                    nextEffect: Fiber | null,
                    firstEffect: Fiber | null,
                    lastEffect: Fiber | null,
                    expirationTime: ExpirationTime,
                    childExpirationTime: ExpirationTime,
                    alternate: Fiber | null,
                }
            ```

## 4. key 的作用

key 帮助 react 识别哪些元素改变了，比如添加或者删除，因此给数组中的每一个元素赋予一个确定的标识，用来进行同层比较，如果同层 key 不相同直接删除节点进行 rerender。

不传 key 也能用，因为 react 检测子组件没有 key 会默认给数组的索引作为 key。

- Key 相同，组件有所变化，react 只会更新组件对应变化的属性。
- Key 不同，组件会销毁之前的组件，将整个组件重新渲染。

如果列表项目的顺序可能会变化，我们不建议使用索引来用作 key 值，因为这样做会导致性能变差，还可能引起组件状态的问题。大多数情况下，我们使用数据中的 id 来作为元素的 key。

## 5. 受控组件与非受控组件

受控组件与非受控组件：是否受状态控制。
受控组件状态发生变化时，都会被写入到组件的 state 中。
非受控组件的样式不受状态变化的影响。如果一个表单组件没有 value prop 就可以称为非受控组件。

```
<h1>非受控组件</h1>
<input defaultValue="我是非受控组件" ref={this.noContrl}/>
```

## 6. React 合成事件和原生事件区别

React 合成事件一套机制：React 并不是将 click 事件直接绑定在 dom 上面，而是采用事件冒泡的形式冒泡到 document 上面，然后 React 将事件封装给正式的函数处理运行和处理。

## 7. PureComponent

PureComponent 可以进行性能优化，减少不必要的渲染次数。PureComponents 的原理是继承了 Component 类，自动加载 shouldComponentUpdate 函数，当组件更新时，shouldComponentUpdate 对 props 和 state 进行了一层浅比较，如果组件的 props 和 state 都没发生改变，render 方法就不触发，省去了 vDom 的生成和对比的过程。

在 PureComponent 前我们经常看到的优化 react 性能常见的手段是 react 生命周期函数 shouldComponentUpdate 里判断 props 或者 state 的数据是否发生变化，通过返回 true 和 false 来阻止不必要的 render。

PureComponent 并没有阻止不必要的 render，二是自动加载 shouldCompentUpdate，只对 props 进行浅比较。

```
export default function shallEqual(objA, objB){
    if(objA === objB){
        return true
    }

    if(typeof objA !== 'object' || objA === null ||
        typeof objB !== 'object' || objB === null){
        return false
    }

    const keysA = Object.keys(objA)
    const keysB = Object.keys(objB)

    if(keysA.length !== keysB.length){
        return false
    }

    for(let i = 0; i < keysA.length; i++){
        if(!objB.hasOwnProperty(keysA[i]) || objA[keys[i]]!==objB[keys[i]]){
            return false
        }
    }

    return true
}
```

浅比较：如果是对象的话并不能阻止无效的渲染，因为传入两个对象必然是 a===b 必然是 false，所以如果使用 PureComponent，state 应该是值类型。

**在什么时候不能用 PureComponent **

1. 如果每次 state 变化都需要刷新页面，那么没必要用 PureComponent 因为浅比较也要耗时。
2. 如果 state 和 props 是引用类型，那么比较不出来。

## 8. react 和 vue 的区别

1. 监听数据变化的实现原理不同。vue 是通过双向绑定，采用数据劫持结合发布者-订阅者模式的方式，通过 Object.defineProperty()来劫持各个属性的 setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调。React 是通过比较引用。
2. 数据流不同，vue 是双向绑定，react 提倡单向数据流。
3. 组建通信不同，主要体现在跨级组件，React 一般使用回调函数，Vue 一般是 Bus、事件通信。
4. 渲染方式不同，react 是通过 jsx 渲染模板，而 vue 是通过指令实现的模板渲染。
5. redux 和 vuex 解决的事情其实是一样的，但是 redux 使用的是不可变数据，每次更新都是新的 state 替代旧的 state。而 vuex 和 vue 的原理一样，也是 getter 和 setter 来追踪数据变化，所以修改 state 是直接修改。

## 9. react 最新 API

1.生命周期变化：
首先是去掉了三个生命周期：`componentWillMount、componentWillReceiveProps、componentWillUpdate`，当前已经 unsafe 了并且在 v17 要去掉了。

同时又加了两个 `static getDerivedStateFromProps、getSnapshotBeforeUpdate`

为啥要改？官方好像是要在 v17 退出 Async Rendering，也就是在 mount 前可打断，如果打断这几个生命周期又要重新执行刷新，那里面逻辑就不可控了，所以现在是 unsafe，到 v17 要干掉。
`static getDerivedStateFromProps`，每次 rerender 的时候，组件获取新的 props 和 state 都触发，每次接受新的 props 都会返回一个对象作为新的 state，返回 null 则说明不需要更新 state。
`getSnapshotBeforeUpdate`：update 发生的时候，在 render 之后，组件 dom 渲染之前，返回一个值作为 componentDidUpdate 的第三个参数

## 10. hook

useState、

useEffect：挂载成功和重新渲染都会调用
`useEffect 副作用函数->创建资源、销毁资源，页面请求。`

```
useEffect(()=>{
 fetch()
 const subscription = source.subscribe()
 return ()=>{
     subscription.unsubscribe()
 }
},[])
```

useLayoutEffect 和 useEffect 使用原理相同，唯一区别在于 useLayoutEffect 不会延时触发。

useContext：接收一个 context 对象，并返回该 context 的当前值。

useReducer：这个也就是 hook 说可以替代 redux 的方案。。

useMemo:u seMemo 主要是用来 render 优化，如果我们的 render 中某个值获取依赖一个函数，那每次 render 的时候都会调用这个函数，如果这个函数计算非常复杂，则会造成页面阻塞，使用 useMemo 包装后，这个函数就是当包装的 state 改变的时候，这个函数才执行

`useCallback 缓存函数的引用，useMemo 缓存计算数据的值。`

## 11. fiber

在 React15 的时候，我们如果有组件需要更新的话，那么就会递归向下遍历整个虚拟 DOM 树来判断需要更新的地方。这种递归的方式弊端在于无法中断必须所有组件都更新完才会停止。
那么如果大组件更新，就会阻塞主线程，造成用户交互、动画的更新等等都不能及时响应。

React 的组件更新的过程其实就是一个持续调用函数的过程，这个过程会形成一个虚拟的调用栈，
加入我们控制这个调用栈的执行，把整个更新任务拆解开，尽可能的放到浏览器空闲的时候去执行更新。
就能解决以上问题。

fiber 是一个工作单元，执行更新任务的整个流程就是在反复寻找工作单元并运行它们。
其实就是把整个调用栈拆解出每个工作单元。
每个 fiber 其实就是一个储存了很多上下文信息的虚拟 DOM，因为他对应了组件实例以及 DOM 元素，
所以 fiber 也会形成 fibertree，但是不是一个树形，而是一个链表结构。

当交互事件调用 setState 后，会批量触发更新，在整个交互事件回调执行完之前 state 都不会发生变更。
回调执行完毕后，开始更新任务，并触发调度。调度器会给这些更新任务一一设置优先级，并且在浏览器
空闲的时候去执行他们，当然如果检测到有任务过期会立即触发更新。

如果在执行更新的时候，有新任务进来，会判断两个任务的优先级高低，加入新任务优先级高，那么打断
旧的任务，重新开始，否则继续执行任务。

## 12. react-router 与浏览器路由的区别

- 浏览器路由：hash、history

  - hash 的实现就是基于 location.hash 实现的，url 中#以及#后面的部分的变更，改变 url 的 hash 值是不会刷新页面的，那就可以通过改变 hash，然后监听 hashchange 事件，展示和隐藏 UI，达到一个前端路由的变化。
  - history ： history.pushState() history.replaceState() API 可以在不进行刷新的情况下，操作浏览器的历史纪录。

- react-router
  react-router 引入和 history 的库，这个库提供了 action、goBack、go、location、push 和 replace 方法。这个库是根据不同的浏览器做了不同实现，旧版本的浏览器中使用 hash，高版本浏览器中使用 html5 里的 history，可以监听到路由变化，从而做到 SPA 应用中的路由切换。

## 13. 组件设计原则

目的就是提高复用性

1. 单一职责：实现类要职责单一，颗粒度小
2. 开闭原则：对扩展开放，对修改关闭

## 14. JS 编译原理

其实就是一个编译转换的过程，根据模块依赖与作用域，编译器将代码转成 AST，然后再做转换成解释器可以读懂的形式，解释器解释给特定平台。

## 15. React 原理解析

[React 原理解析](https://yuchengkai.cn/react/#%E4%BB%8B%E7%BB%8D)
