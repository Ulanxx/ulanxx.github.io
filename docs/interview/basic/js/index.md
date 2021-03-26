---
title: Javascript
order: 1
group:
  title: 前端基础
  order: 3
---

# Javascript 

## 0. 值类型和引用类型

js 中变量类型有哪些：值类型和引用类型

- 值类型：空间固定，保存在栈中，保存和复制都是值本身，typeof 可以检测值类型。（string number boolean undefined symbol null）
- 引用类型：占用空间不固定，保存在堆中，堆内存是动态内存，保存与复制的是执行对象的一个指针，使用 instanceof 检测。Object、Array、Function(Array/Function 都在 Object 的原型链上)

```
const a = {name: 'test'}
堆内存中持有的是对象元数据，栈内存里只有的是堆内存数据的引用地址。复制时，引用类型复制的是地址，值类型复制的是值。
```

## 1. 什么是作用域？

作用域就是变量的访问规则，也就是规定了那些变量可以被访问，哪些变量不可以被访问。

JS 中有哪些作用域？

- 全局作用域：挂载在 window 上，通过 var 声明在最外层。
- 函数作用域：通过 return 访问函数内部变量，通过闭包访问函数内部变量
- 块级作用域：循环、if 等{}代码块里。
- 词法（静态）作用域：函数内部访问变量，总是寻找最近的那个作用域。
- 动态作用域：作用域是基于调用栈，而不是代码中的作用域嵌套，js 中除了 this 都是词法作用域。

### 插播一个 this

```
var a = 10;
var obj = {
    a: 99,
    fn1:()=>{ console.log(this.a) },
    fn2:function(){ console.log(this.a) }
}
obj.fn1(); //10
obj.fn2(); //99
```

箭头函数本身没有 this，指向他定义时候的上下文，而不同函数的 this 指向它的调用对象。

## 2. 闭包

函数 A 内部有一个函数 B，函数 B 能访问到函数 A 内部变量，函数 B 就是闭包。

函数闭包的意义是让我们可以间接访问函数内部的变量。

```
for(var i = 1; i<= 5; i++){
    setTimeout(()=>{
        console.log(i)
    },i * 1000)
}

for(var i = 1;i<=5; i++){
    ;(function(i){
        setTimeout(()=>{
            console.log(i)
        },i * 1000)
    })(i)
}

for(let i = 1;i<=5; i++){
    setTimeout(()=>{
        console.log(i)
    },i * 1000)
}
```

闭包应用：

- 防抖函数
- 使用闭包设计单例模式

```
class CreateUser{
    constructor(name){
        this.name = name
        this.getName()
    }
    getName() {
        return this.name
    }
}
// 代理实现单例模式
let ProxyMode = (function() {
    let instance = null
    return function(name) {
        if(!instance){
            instance = new CreateUser(name)
        }
    	return instance
    }
})()

let a = ProxyMode('aaa')
let b = ProxyMode('bbb')
// 因为单例模式只实例化一次，所以下面实例是相等的
console.log(a === b) // true
```

- 私有变量
  比如 redux 的设计，store 的唯一性就是通过闭包实现，只能通过 getStore 获取 store 实例，而不能直接操作。

## 3. 原型和继承

JS 继承的原理就是原型 prototype，这种实现继承的方式，我们称之为原型继承。

JS 中一些全局内置函数，分别为 Function/Array/Object

```
1.__proto__ === Number.prototype // true
'1'.__proto__ === String.prototype // tue
true.__proto__ === Boolean.prototype // true
```

一个对象的`__proto__` 总是指向它构造函数的 prototype。
`Object.prototype.__proto__` 为 null，这是原型链的终点。

### _原型链是什么？_

当我们访问一个对象的属性的时候，首先会在当前对象的 prototype 进行查找，如果找不到就会访问该对象的`__proto__`，如果`__proto__`有了就返回，如果没有就递归上述过程，知道`__proto__`为 null，这种查找属性的方式我们称为原型链上的查找，这条链我们称为原型链。

## 4. 用 ES5 实现一个继承

- 原型链继承：子类的原型指向父类的实例。
  `SubType.prototype = new SuperType()`
- 借用构造函数继承：

```
function Parent(value){
    this.val = value
}
Parent.prototype.getValue = function(){
    console.log(this.val)
}
function Child(value){
    Parent.call(this, value)
}

Child.prototype = new Parent()
```

> ES6 中我们会使用 class 继承，class 实现集成的核心在于 extends 表明哪个父类，并在子类的构造中调用 super，因为这段代码可以看做 `Parent.call(this, val)`

## 5. new 的实现

1. 新建一个空对象
2. 然后将这个空对象的`__proto__`指向构造函数的`prototype`
3. 调用构造函数去填充我们创建的空对象 4.更改 this 指向，将 this 指向我们刚刚创建的新对象

```
function new(constructor, ...args){
    const obj = {}
    obj.__proto__ = constructor.prototype
    const ret = constructor.call(obj, ...args)
    return ret instanceof Object? ret: obj
}

```

## 6. 深拷贝、浅拷贝

- 浅拷贝是精确拷贝，如果基本类型拷贝的就是值，如果是引用类型拷贝就是内存地址
- 深拷贝是将一个对象从内存汇总完整的拷贝一份，从堆内存中开辟一个新的区域用于存放新对象，且修改新对象不会影响源对象。

`浅拷贝实现`

1. Object.assign()方法可以把任意多个源对象自身的可枚举属性拷贝给目标对象，然后返回目标对象。
2. 展开运算符
3. Array.prototype.slice()

```
function cloneShallow(source){
    let target = {}
    for(let key in source){
        if(Object.prototype.hasOwnProperty.call(source,key)){
            target[key] = source[key]
        }
    }
}
```

`深拷贝实现`

1. JSON.parse(JSON.stringify())
2. 递归：遍历对象、数组直到里面是基本数据类型，然后再去复制

```
function isObject(obj){
    return Object.prototype.toString.call(obj) === '[object Object]'
}

function deepClone(source){
    if(!isObject(source)) return source
    let target = Array.isArray(source)?[]:{}
    for(let key in source){
        if(Object.prototype.hasOwnProperty(source,key)){
            if(isObject(source[key])){
                target[key] = deepClone(source[key])
            }else{
                target[key] = source[key]
            }
        }
    }
    return target
}
```

## 7. 判断数组和对象的类型

1. `typeof` 判断基本数据类型，但是不能判断数组。
2. `instanceof` 是根据原型链判断
   ，但是由于数组也在 Object 的原型链上，所以不能精确判断数组和对象。

3. 通过 Object.prototype.toString.call(arg) 判断变量类型
   通过 apply 也可以判断。

   ```
   Object.prototype.toString.call(function(){}) //  "[object Function]"
   Object.prototype.toString.call() // "[object Undefined]"
   Object.prototype.toString.call([]) // "[object Array]"
   ```

JS 获取类型

```
/**
 * Returns the type of the argument
 * @param {Any}    val    Value to be tested
 * @returns    {String}    type name for argument
 */
function getType (val) {
    if (typeof val === 'undefined') return 'undefined';
    if (typeof val === 'object' && !val) return 'null';
    return ({}).toString.call(val).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}


// test for types
var out = [];

out.push(getType('string'));              // string
out.push(getType(9));                     // number
out.push(getType(true));                  // boolean
out.push(getType([]));                    // array
out.push(getType({}));                    // object
out.push(getType(null));                  // null
out.push(getType(undefined));             // undefined
out.push(getType(function(){}));          // function
out.push(getType(new Date()));            // date
out.push(getType(new RegExp('a-z')));     // regexp
out.push(getType(new Error()));           // error

```

## 8. instanceof 实现

```
function instanceof(left, right){
    let prototype = right.prototype
    let proto = left.__proto
    while(true){
        if(proto === prototype){
            return true
        }
        if(proto === null){
            return false
        }
        proto = proto.__proto__
    }
}
```

## 9. 箭头函数

1. 箭头函数不会创建自己的 this
2. 箭头函数的 this 指向永远不变，不会通过 apply/call/bind 动态修改 this 指向
3. 箭头函数没有 arguments
4. 箭头函数没有原型
5. 箭头函数不能作为构造函数使用

## 10. for in? for of？iterator?

1. for in: 用于数组循环返回的是数组下标和挂载在原型上的键。用于对象不仅可以循环枚举自身属性，还可以枚举原型链中的属性。

2. for of

- 可以遍历具有 iterator 接口的数据，一个数据只要部署了 Symbol.iterator 属性，就被视为具有 iterator 接口，`也就是说for...of循环内部调用时数据结构的Symbol.iterator`。
- iterator 的实现思想源于单向链表。
- forEach 循环中无法用 break 或 return 命令终止，单 for...of 可以。
- for...in 遍历数组遍历的是键名，所以适合遍历对象，for...of 遍历数组遍历的是键值。

- iterator: 一个数组结构只要具有 Symbol.iterator 属性，就认为是`可遍历的`，原生具备 iterator 接口的数据结构如下：

  1. Array
  2. Map
  3. Set
  4. String
  5. 函数的 arguments 对象
  6. NodeList 对象

```
function Car(name){
    this.name = name
}
const newCar = new Car('Bens')
Car.prototype.price = 160000
for(let key in newCar){
    console.log(key)
}
// name , price
for(let v of newCar){
    console.log(v)
}
// Uncaught TypeError: newCar is not iterable

```

**_Object 默认是没有 iterator 接口的_**

## 11. call/apply/bind 的区别与实现

- 相同点： 三者都是用来改变函数的上下文，也就是 this 指向的。
- 不同点：
  - fn.bind：不会立即调用，而是返回一个绑定后的新函数，this 指向第一个函数参数，后面可能更多参数，这些参数都是 fn 函数的参数。
  - fn.call：立即调用，返回函数执行结果，this 指向第一个函数，后面可能更多参数，并且这些都是 fn 函数的参数。
  - fn.apply：立即调用，返回的函数的执行结果，this 指向第一个参数，第二个参数是个数组，这个数组里内容是 fn 函数的参数。

## 12. promise 实现原理（怎么实现取消？怎么实现 promise all、race 等？）

说到底 Promise 还是回调函数，只不过把回调函数封装到内部，使用 then 方法的链式调用。

```
const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

function MyPromise(fn) {
  const that = this
  that.state = PENDING
  that.value = null
  that.resolvedCallbacks = []
  that.rejectedCallbacks = []
  function resolve(value) {
    if (that.state === PENDING) {
      that.state = RESOLVED
      that.value = value
      that.resolvedCallbacks.map((cb) => cb(that.value))
    }
  }

  function reject(value) {
    if (that.state === PENDING) {
      that.state = REJECTED
      that.value = value
      that.rejectedCallbacks.map((cb) => cb(that.value))
    }
  }
  try {
    fn(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  const that = this //对传入的两个参数做判断，如果不是函数将其转为函数
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => v // onFulfilled = v => v
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : (r) => {
          throw r
        }
  if (that.state === PENDING) {
    that.resolvedCallbacks.push(onFulfilled)
    that.rejectedCallbacks.push(onRejected)
  } else if (that.state === RESOLVED) {
    onFulfilled(that.value)
  } else {
    onRejected(that.value)
  }
}

new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功的回调数据')
  }, 1000)
}).then((value) => {
  console.log('Promise.then: ', value)
})

```

Promise.all

```
Promise.all = function(promises){
    return new Promise((resolve, reject)=>{
        let resolvedCounter = 0
        let resolvedValues = new Array(promises.length)
        for(let i = 0;i< promises.length;i++){
            Promise.resolve(promise[i]).then((value)=>{
                resolvedCounter++
                resolvedValues[i] = value
                if(resolvedCounter === promises.length){
                   return resolve(resolvedValues)
                }
            }, (reject) => {
                return reject(reason)
            })
        }
    })
}
```

Promise.race：返回一个 Promise，Promises 里有一个解决或 2 拒绝，返回的 promise 就回解决

```
Promise.race = function(promises){
    return new Promise((resolve, reject)=>{
        for(let i = 0;i < promises.length; i++){
            Promise.resolve(promises[i]).then((value)=>{
                return resolve(reason)
            },(reason)=>{
                return reject(reason)
            })
        }
    })
}
```

## 13. JS 中的事件机制以及在浏览器和 Node 中的区别。

进程：CPU 资源分配的最小单位
线程：CPU 调度的最小单位
一个应用可能是一个进程，一个进程里可能会分配不同的线程去做不同的事儿。
比如浏览器打开一个 Tab 页就是一个进程，一个进程可以有多个线程，渲染线程、JS 引擎线程、Http 请求线程。

浏览器内核是多线程由不同的线程组成：

- GUI 渲染线程
- JavaScript 引擎线程
- 定时触发器线程
- 事件触发线程
- 异步 http 请求线程

### 浏览器中的 EventLoop

事件循环中异步队列有两种：宏任务队列和微任务队列。
宏任务：setTimeout、setInterval、setImmediate、script（整体代码）、I/O、UI 渲染
微任务：process.nextTick、new Promise().then(回调)

**_先执行宏任务，当某个宏任务执行完后，会查看是否有微任务队列，如果有，先执行微任务队列中的所有任务，如果没有，会再读取宏任务丢列中排在最前的任务，执行宏任务过程中，遇到微任务，依次加入微任务队列，栈空后，再次读取微任务队列里的任务。_**

### Node 中的 EventLoop

Node 的运行机制：

- V8 引擎解析 JavaScript 脚本
- 解析后的代码调用 NodeAPI
- libuv 库负责 NodeAPI 的执行，它将不同的任务分配给不同的线程，形成一个 EventLoop，以一步的方式将任务的执行结果返回给 V8 引擎。
- V8 引擎再将结果返回给用户。

**_在 Node 端，微任务会在事件循环的各个阶段执行，也就是一个阶段执行完毕，就会去执行 microtask。_**

setTimeout/setInterval 属于 timers 类型；
setImmediate 属于 check 类型；
socket 的 close 事件属于 close callbacks 类型；
其他 MacroTask 都属于 poll 类型。
process.nextTick 本质上属于 MicroTask，但是它先于所有其他 MicroTask 执行；
所有 MicroTask 的执行时机，是不同类型 MacroTask 切换的时候。
idle/prepare 仅供内部调用，我们可以忽略。
pending callbacks 不太常见，我们也可以忽略。

## 14. CommonJS、ES6 Module

首先 CommonJS 是不适合浏览器加载的，因为 CommonJS 的 require 语法是同步的，当我们使用 require 加载一个模块之后，才会执行到后面的代码
。因为浏览器端的文件一般存放在服务器或者 CDN 中，如果使用同步的方式加载一个模块，可能会造成浏览器阻塞。所以它更适合在 NodeJS 服务端使用，直接从本地硬盘读取文件。

**CommonJS 和 ES6 模块的差异：**

1. `CommonJS 模块输出的是一个值的拷贝`：一旦输出了某个值，如果模块内部后续的变化，影响不了外部对这个值的使用，CommonJS 引用的变量被缓存。

   `ES6 模块输出的是值的引用`：JS 引擎对脚本静态分析的时候，遇到模块加载命令`import`，就会生成一个只读引用，等到脚本真正执行的时候，再根据这个只读引用，到被加载的那个模块去取值，由于是动态引用，所以如果使用 import 加载一个变量，变量不会被缓存。

2. `CommonJS 模块是运行时加载`：CommonJS 其实加载的是一个对象，这个对象只有在脚本运行时才会生成，而且只会生成一次

   `ES6 模块是编译时输出接口`：ES6 模块的对外接口只是一个静态定义，在代码静态解析的阶段就会生成，这样我们可以对 JS 模块进行依赖分析，优化代码，tree shaking 和 scope hoisting 实际上就是依赖 ES6 模块化。

## 15. 输入 URL 到显示页面，都经历了什么

1. 浏览器输入 url
2. 浏览器先查看浏览器缓存-系统缓存-路由器缓存，如果缓存命中，会直接在屏幕上展示页面内容。
3. 在发送 http 请求前，需要进行域名解析 （DNS 解析），（DNS 域名系统，是互联网的一项核心业务，可以将域名和 IP 地址互相映射的一个分布式数据库，让人们不用直接记住 IP。），解析获取相应的 IP 地址。
4. 浏览器向服务器发起 tcp 链接，与浏览器建立起 tcp 三次握手，（TCP 即传输控制协议，TCP 链接是互联网连接协议的一种）
5. 握手成功后，浏览器向服务器发送 http 请求，请求数据包。
6. 服务器处理收到的请求，将数据返回至浏览器。
7. 浏览器收到 http 相应
8. 读取页面内容，浏览器渲染，解析 html 源码
9. 浏览器渲染页面

   - 浏览器解析 HTML 标签，构建 DOM 树。
   - 浏览器解析 CSS，构建 CSSOM 树。
   - DOM 树与 CSSOM 树结合形成 render 树
   - 浏览器得到渲染树后开始计算每个节点的位置信息，进行 layout 布局。
   - 布局完成后，浏览器将每个节点绘制到屏幕上。

     _这里需要注意_:

     - script 是同步加载，浏览器遇到 script 要等下载完成在继续解析 HTML，所以 script 要放在最底部，或者设置 defer 或 async。
     - link 标签请求 CSS 文件，是异步加载，但是如果 CSS 文件较大，DOM 树已经构建完成，CSSOM 还没构建完成，chrome 会出现白屏，因为他认为没有 CSSOM 的 paint 是无意义的，这里给 link 设置 preload 就很重要。

10. 客户端与服务器交互
11. ajax 查询

**查找缓存 > DNS 解析 > 建立 TCP 连接 > 发送请求 > 渲染数据 > 结束**

## 16. v8 垃圾回收机制

JS 中内存管理的主要概念是可达性。
简单地说，可达性就是那些以某种方式可访问或可用的值，他们被保证存储在内存中。

垃圾回收的基本工作原理是通过标记清除算法：

`标记-清除`算法：垃圾回收器获取根并标记它们，然后访问并标记所有来自它们的引用，然后所有被访问的对象都被记住，以此类推，知道有未访问的引用为止，除了标记的对象外，所有对象都被删除。

JS 引擎做了一些优化：

- 分代回收：由于做垃圾回收检查是很消耗的一件事，JS 做了分代回收的优化，对象分为两组，新对象和旧对象。创建了对象的内存后，完成该对象的工作并迅速结束，他们很快就会被清理干净，有一些活的足够久的，就回被分到“旧对象”，并且很少接受检查。

- 增量回收：如果有很多对象，那做回收会很耗时，JS 引擎将垃圾回收分解为多个部分，然后分别执行，这样只需要额外的标记来跟踪变化，只有很多微小的延迟，而不是很大的延迟。

- 空闲时间回收：垃圾回收器只有在 CPU 空闲时运行，以减少对执行的影响。

## 17. 如何解决 script 标签阻塞渲染问题

- 一个方法是`<script>`元素加入 defer 属性，它的作用是延迟脚本的执行，等到 HTML 解析完成后，再执行脚本。
- 还可以加上 async 属性，使用另一个进程下载脚本，脚本下载完成，暂停 HTML 解析，开始执行下载的脚本，脚本执行完毕，恢复解析 HTML 页面。
- 还可以使用动态脚本，在动态生成 script 标签，但是现在不这么玩了已经。

## 18. link 资源 preload

```
  <link rel="preload" href="style.css" as="style">
  <link rel="preload" href="main.js" as="script">
```

那些文件可以被预加载？

- audio、video、document（将要嵌入 frame 的文档）、fetch 资源（通过 xhr 和 fetch 请求的资源）、font、image、script、style、worker（web worker 或 shared workder）、

prefetch 是高速浏览器加载`下一个页面`可能用到的资源，也就是加载下一页面的加载速度。

preload 是预加载本页资源

`优化结构`

```
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Faster</title>
  <link rel="dns-prefetch" href="//cdn.cn/">

  <link rel="preload" href="//cdn.cn/webfont.woff2" as="font">
  <link rel="preload" href="//cdn.cn/Page1-A.js" as="script">
  <link rel="preload" href="//cdn.cn/Page1-B.js" as="script">

  <link rel="prefetch" href="//cdn.cn/Page2.js">
  <link rel="prefetch" href="//cdn.cn/Page3.js">
  <link rel="prefetch" href="//cdn.cn/Page4.js">

  <style type="text/css">
    /* 首页用到的CSS内联 */
  </style>
</head>
<body>

<script type="text/javascript" src="//cdn.cn/Page1-A.js" defer></script>
<script type="text/javascript" src="//cdn.cn/Page1-B.js" defer></script>
</body>
</html>
```

## 19. defineProperty 和 proxy

defineProperty 可以拦截 get 和 set，读取 get，设置 set 行为，这样就可以拦截变化。

```
function watch(obj,prop,cb){
    let value = obj[prop]
    Object.defineProperty(obj,prop,{
        get:function(){
            return{
                value
            }
        },
        set:function(v){
            value = v
            cb(v)
        }
    })
}
let company = {name:'yd'}

watch(company,'brand',(v)=>{
    console.log(v,'brand 改变了')
})
company.brand = 'yeahbra'`
```

proxy 更加强大，因为 defineProperty 只能重定义属性的读取 get 和设置 set 行为，到了 es6，提供了 proxy，就可以重定义更多的行为，比如 in、delete、函数调用
。

```

function watch(target, func) {
  const proxy = new Proxy(target, {
    get: function (target, prop) {
      console.log("get")
      return target[prop]
    },
    set: function (target, prop, value) {
      console.log("set")
      target[prop] = value
      func(prop, value)
    },
  })
  return proxy
}

var obj = {
  value: 1,
}

const newObj = watch(obj, function (key, newValue) {
  // 这里进行dom变化
  console.log("这里进行dom变化")
})

newObj.value = 2
console.log(newObj.value)
```

## 20. DOM 和 BOM 的区别和联系

BOM 就是 Browser Object Model，浏览器对象模型，就是把浏览器当做一个对象，提供 API 来操作 window ，打开窗口、打开选项卡、关闭页面、收藏夹、窗口位置及大小、location 的操作、navigator 来检测浏览器和插件、history 前进后退都是属于浏览器级别的操作。

DOM 是 Document Object Model，文档对象模型，就是把文档流当成一个对象，提供 API 来操作文档流，比如 getElementById。

## 21. 继承

### ES5 实现继承

**_组合继承_**：这种继承方式优点在于构造函数可以传参，不会与父类引用属性共享，可以复用父类的函数，但是也存在一个缺点就是在继承父类函数的时候调用了父类构造函数，导致子类的原型上多了不需要的父类属性，存在内存上的浪费。

```
function Parent(value) {
  this.val = value
}
Parent.prototype.getValue = function() {
  console.log(this.val)
}
function Child(value) {
  // 子类通过构造调用Parent.call继承父类的属性
  Parent.call(this, value)
}
// 然后改变子类的原型为父类的实例，继承父类的函数
Child.prototype = new Parent()

const child = new Child(1)

child.getValue() // 1
child instanceof Parent // true
```

**_寄生组合式继承_**：寄生组合式继承的核心是讲父类的原型付给了子类，并且将构造函数设置为子类。

```
function Parent(value) {
  this.val = value
}
Parent.prototype.getValue = function() {
  console.log(this.val)
}

function Child(value) {
  Parent.call(this, value)
}
Child.prototype = Object.create(Parent.prototype, {
  constructor: {
    value: Child,
    enumerable: false,
    writable: true,
    configurable: true
  }
})

const child = new Child(1)

child.getValue() // 1
child instanceof Parent // true

```

### ES6 继承的原理

ES6 继承的原理跟寄生组合式继承是一样的，通过 Object.create 传入父类的原型，直接付给子类，然后再用子类的构造函数修改 this。

```
class Point{}
class ColorPoint extends Point{}
```

转换后

```
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass, writable: true, configurable: true
        }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
}

```

ES5 的继承实质是先创建子类的实例对象 this，然后将父类的方法添加到 this 上。

ES6 的继承实质是先将父类实例对象的方法和属性加到 this 上面，然后在用子类的构造函数修改 this。
