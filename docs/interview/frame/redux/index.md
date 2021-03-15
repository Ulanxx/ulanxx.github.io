---
title: Redux
order: 1
group:
  title: 框架
  order: 3
---

# redux

## 1. Redux 三大原则

- 单一数据源（整个应用的 state 都存储在一颗 state tree 中）
- state 只读（唯一改变是通过触发 action，然后通过 action 的 type 进而分发 dispatch，不能直接改变 state。）
- 状态修改均由纯函数完成，为了描述 action 如何改变 state tree，需要编写 reducers。

## 2. reducer 为什么要返回一个新的 state

因为 combineReducer 会对返回的 state 进行一层浅比较，如果是返回之前 state 不会进行页面的 render，所以要返回一个新的。这也是因为 state 更新频繁，但是深比较是很消耗的一件事，干脆就返回新的，如果没有更改，就返回旧 state

## 3. 什么是中间件

常情况下，我们点击一个 button，分发一个 action，reducer 收到 action 之后更新 state，并通知 view render。但是如果点击 button 后，需要先去请求数据，只有等数据返回之后，才能重新渲染 view，此事我们希望 dispatch 或 reducer 有异步请求的功能，再比如，需要异步请求数据返回后，打印一条日志，在请求数据。redux 中间件就是在 dispatch 分发 action 时对这个 dispatch 进行包装，先执行中间件函数再向下分发。

## 4. react thunk 的理解

react thunk 是 redux 的中间件，其实就是处理 action，使其支持异步操作。由于原生的 dispatch 只接受一个对象形式的 action，不接受其他 action，而且原生 dispatch 是同步模式，action 发出以后，reducer 立即算出 State。那我们想 action 发出之后，进行某些操作，操作结束再执行 reducer，这个过程就是异步，需要 react-thunk 配合。
