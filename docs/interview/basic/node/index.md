---
title: Node
order: 1
group:
  title: 基础
  order: 3
---


# NodeJS

## 1. Node 的全局变量和全局对象

1. 全局对象：所有模块都可以调用的： global、process-表示 Node 当前所处的进程，允许开发者与该进程互动、console
2. 全局函数：定时器函数、require、Buffer()-操作二进制数据
3. 全局变量：`__filename`指向当前运行的脚本文件名，`__dirname`指向当前运行的脚本所在的目录

## 2. Node 的三大特点

1. 单线程
2. 非阻塞 I/O
3. 事件驱动：在 Node 中在一个时刻，只能执行一个事件回调函数，但是在执行一个事件回调函数的中途，可以转而处理其他事件，然后返回继续执行原事件的回调函数，这种的处理机制，称为事件循环机制。

Node.js 不为每个客户连接创建一个新的线程，而仅仅使用一个线程。当有用户连接了，就触发一个内部事件，通过非阻塞 I/O、事件驱动机制，让 Node.js 程序宏观上也是并行的。

## 3. EventLoop

```
   ┌───────────────────────┐
┌─>│        timers         │<————— 执行 setTimeout()、setInterval() 的回调
│  └──────────┬────────────┘
|             |<-- 执行所有 Next Tick Queue 以及 MicroTask Queue 的回调
│  ┌──────────┴────────────┐
│  │     pending callbacks │<————— 执行由上一个 Tick 延迟下来的 I/O 回调（待完善，可忽略）
│  └──────────┬────────────┘
|             |<-- 执行所有 Next Tick Queue 以及 MicroTask Queue 的回调
│  ┌──────────┴────────────┐
│  │     idle, prepare     │<————— 内部调用（可忽略）
│  └──────────┬────────────┘
|             |<-- 执行所有 Next Tick Queue 以及 MicroTask Queue 的回调
|             |                   ┌─────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │ - (执行几乎所有的回调，除了 close callbacks 以及 timers 调度的回调和 setImmediate() 调度的回调，在恰当的时机将会阻塞在此阶段)
│  │         poll          │<─────┤  connections, │
│  └──────────┬────────────┘      │   data, etc.  │
│             |                   |               |
|             |                   └───────────────┘
|             |<-- 执行所有 Next Tick Queue 以及 MicroTask Queue 的回调
|  ┌──────────┴────────────┐
│  │        check          │<————— setImmediate() 的回调将会在这个阶段执行
│  └──────────┬────────────┘
|             |<-- 执行所有 Next Tick Queue 以及 MicroTask Queue 的回调
│  ┌──────────┴────────────┐
└──┤    close callbacks    │<————— socket.on('close', ...)

```

1. setTimeout/setInterval 属于 timers 类型
2. setImmediate 属于 check 类型
3. socket 的 close 事件属于 close callbacks 类型
4. 其他的 MacroTask 都属于 Poll 类型
5. process.nextTick 本质上属于 MicroTask，但是它先于所有 MicroTask 执行
6. 所有 MicroTask 的执行时机，是不同类型 MacroTask 切换的时候
7. idle/prepare 仅内部调用，我们忽略
8. pending callbacks 不太常见，我们也忽略

### 执行机制

先执行所有类型为 timers 的宏任务，然后执行所有微任务，进入 poll 阶段，执行所有宏任务，在执行所有微任务，在执行所有类型为 check 的宏任务，再执行所有微任务，在执行所有 close callbacks 的宏任务，在执行所有微任务，至此完成一个魂环，回到 timers 阶段反复，注意的是微任务执行的时候 nextTick 是最先执行。

## 4. Node 创建线程的方法和区别

Node 是单线程模型，但是它使用的是事件驱动来处理并发，这样有助于我们再多核 CPU 创建多个子进程，从而提高性能。

每个子进程总是带有三个流对象：child.stdin、child.stdout、child.stderr，他们会共享父进程的 stdio 流，也可以是独立的被导流的对象。

Node 提供了 child_process 模块创建子进程

创建子进程的方法：

1.exec

- child_process.exec 使用子进程执行命令，缓存子进程的输出，并将子进程的输出以回调函数参数的形式一次性返回。exec 方法会从子进程中返回一个完整的 buffer。默认情况下，这个 buffer 的大小应该是 200k。如果子进程返回的数据大小超过了 200k，程序将会崩溃，同时显示错误信息“Error：maxBuffer exceeded”。你可以通过在 exec 的可选项中设置一个更大的 buffer 体积来解决这个问题，但是你不应该这样做，因为 exec 本来就不是用来返回很多数据的方法。

```
  require('child_process').exec('dir', {encoding: ‘utf-8’}, function(err, stdout, stderr) {
      if (err) {
          console.log(error.stack);
          console.log('Error code: ' + error.code);
          console.log('Signal received: ' + error.signal);
      }
      //console.log(err, stdout, stderr);
      console.log('data : ' + stdout);
  }).on('exit', function (code) {
      console.log('子进程已退出, 退出码 ' + code);
  });

```

2. spawn

- child_process.spawn 使用指定的命令行参数创建新进程。spawn 会返回一个带有 stdout 和 stderr 流的对象。你可以通过 stdout 流来读取子进程返回给 Node.js 的数据。stdout 拥有’data’,’end’以及一般流所具有的事件。当你想要子进程返回大量数据给 Node 时，比如说图像处理，读取二进制数据等等，你最好使用 spawn 方法。

```
  var child_process = require('child_process');
  var spawnObj = child_process.spawn('ping', ['127.0.0.1'], {encoding: 'utf-8'});
  spawnObj.stdout.on('data', function(chunk) {
      console.log(chunk.toString());
  });
  spawnObj.stderr.on('data', (data) => {
    console.log(data);
  });
  spawnObj.on('close', function(code) {
      console.log('close code : ' + code);
  }
  spawnObj.on('exit', (code) => {
      console.log('exit code : ' + code);
      fs.close(fd, function(err) {
          if(err) {
              console.error(err);
          }
      });
  });

```

3. fork

- child_process.fork 是 spawn()的特殊形式，用于在子进程中运行的模块，如 fork(‘./son.js’) 相当于 spawn(‘node’, [‘./son.js’]) 。与 spawn 方法不同的是，fork 会在父进程与子进程之间，建立一个通信管道，用于进程之间的通信。

parent.js

```
  console.log('parent pid: ' + process.pid);
  var fork = require('child_process').fork;
  //fork方法返回的是子进程
  var child = fork('./child.js');
  console.log('fork return pid: ' + child.pid);
  child.on('message', function(msg){
      console.log('parent get message: ' + JSON.stringify(msg));
  });
  child.send({key: 'parent value'});

```

child.js

```
  console.log('child pid: ' + process.pid);
  process.on('message', function(msg){
      console.log('child get message: ' + JSON.stringify(msg));
  });
  process.send({key: 'child value'});

```
