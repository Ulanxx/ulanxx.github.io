---
title: 前端监控
order: 1
group:
  title: 工程化
  order: 3
---

# 前端监控

## 1. 前端错误的类型有哪些？

1. 代码错误
2. 资源加载错误（图片、js、css）

## 2. 错误的捕获方式

### 1. 代码错误的捕获方式

1. try...catch
2. window.onerror 相比 try catch 来说 window.onerror 提供了全局监听异常的功能。
3. promise.catch 可以捕获异步错误，但是当我们写了 Promise 却没有 catch 错误的时候，需要全局添加一个 unhandledrejection 的监听，用来全局监听 uncatch promise error.

```
window.addEventListener("unhandledrejection", function(e){})
```

### 2. 资源加载错误的捕获方式

1. img 标签、script 标签都可以添加 onerror 事件，用来捕获资源加载错误；
2. performance.getEntries 获取网站成功加载的资源数量信息，然后在通过 document.getElementsByTagName 获取需要加载的所有资源集合，再去过滤。

## 3. 上报错误的原理

1. 采用 ajax 通信上报
2. 利用 Image 对象上报（推荐）- 埋点上报的基本原理

```
// 发送一个请求，上报错误，在network中查看，要上报的信息携带在url上
(new Image()).src = 'http://baidu.com/test?=sss'
```
