# 算法

## 1. 继承

```
function Parent(name){
    this.name = name
    this.getName = function(){
        return name
    }
}

function Child(name, age){
    Parent.call(this, name)
}
// Child.prototype = new Parent('大哥')
Child.prototype = Object.create(Parent.prototype)

const child = new Child('小名', 10)

```

## 2. instanceof 和 类型检测

```
function _instanceof(left, right){
    let proto = left.__proto__
    let prototype = right.prototype
    while(true){
        if(proto === null){
            return false
        }
        if(proto === prototype){
            return true
        }
        proto = proto.__proto__
    }
}

```

## 3. apply/call/bind

```
function _call(){
    const context = arguments[0]
    context.fn = this
    let args = arguments.slice(1)
    let res = context.fn(...args)
    delete context.fn
    return res
}

function _apply(){
    const context = arguments[0]
    context.fn = this
    let res
    if(arguments[1]){
        res = context.fn(...arguments[1])
    }else{
        res = context.fn()
    }
    delete context.fn
    return res
}

function _bind(){
    const self = this
    const context = arguments[0]
    const args = Array.prototype.slice.call(arguments, 1)
    return function(){
        const bindArgs = args.concat(Array.prototype.slice.call(arguments))
        return self.apply(context, bindArgs))
    }
}
```

## 4. new

```
function _new(){
    let obj = {}
    const constructor = [].shift.call(arguments)
    obj.__proto__ = constructor.prototype
    let ret = constructor.call(obj, arguments)
    return typeof ret==='object'? ret: obj
}

```

## 5. 防抖、节流

1. 防抖 - debounce [百度搜索框在输入稍有停顿时才更新推荐热词、拖拽]

```
function debounce(fn, delay = 300){
    let timer = null
    return function(){
        let _self = this,
        _args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function(){
            fn.apply(_self, _args);
        }, delay);
    }
}
```

2. 节流 - throttle [抢券时疯狂点击，既要限制次数，又要保证先点先发出请求]

```
function throttle(fn, wait = 300){

    let lastTime = 0

    let _self = this

    return function(){

        let nowTime = Date.now();

         _args = arguments;

        if(nowTime - lastTime > wait){
            fn.apply(_self, _args)
            lastTime = nowTime
        }
    }
}
```

## 6. 深拷贝、浅拷贝

1. 浅拷贝

```
只拷贝第一层
let a = { age: 1 }
let b = {...a}
let b = Object.assign({}, a)
```

2. 深拷贝

```
function deepClone(source){
    let target = Array.isArray(source)? [] : {}
    for(let key in source){
        if(source.hasOwnProperty(key)){
            if(source[key] && typeof obj[key] === 'object'){
                target[key] = deepClone(obj[key])
            }else{
                target[key] = obj[key]
            }
        }
    }
    return targe
}
```

## 7. Promise 实现

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

## 8. arguments 参数

```
var arrLike = {
    0: 'name',
    1: 'age',
    2: 'sex',
    length: 3
}
Array.prototype.slice.call(arrLike) // 转化成数组
Array.prototype.slice.join(arrLike, '-') // name-age-sex

将类数组转换成数组
Array.from(arrLink)
Array.prototype.slice.call(arrLike)
Array.prototype.splice.call(arrLike, 0)
Array.prototype.concat.apply([], arrLike)

```

## 9. 排序算法

```
const swap = function(i, j){
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function bubbleSort(arr){
    let len = arr.length;
    for(let i = 0; i< len; i++){
        for(let j = 0; j< len - i - 1; j++){
            if(arr[j]> arr[j+1]){
                swap(j, j + 1)
            }
        }
    }
}

let quickSort = function(arr) {
　　if (arr.length <= 1) { return arr; }
　　var pivotIndex = Math.floor(arr.length / 2);
　　var pivot = arr.splice(pivotIndex, 1)[0];
　　var left = [];
　　var right = [];
　　for (var i = 0; i < arr.length; i++){
　　　　if (arr[i] < pivot) {
　　　　　　left.push(arr[i]);
　　　　} else {
　　　　　　right.push(arr[i]);
　　　　}
　　}
　　return quickSort(left).concat([pivot], quickSort(right));
};

```

## 10. 树的遍历

1. 深度优先

```
function deepInterator(node){
    if(node.children.length){
        for(let i = 0;i< node.children.length;i++){
            deepInterator(node.children)
        }
    }
}
```

2. 广度优先

```
function wideInterator(node){
    var arr = [];
    arr.push(node);
    while (arr.length > 0) {
        node = arr.shift();
        console.log(node);
        if (node.children.length) {
            for (var i = 0; i < node.children.length; i++) {
                arr.push(node.children[i]);
            }
        }
    }
}
```
