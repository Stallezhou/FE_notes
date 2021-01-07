# Event Loop

## 前言

相信很多同学无论是在工作中还是在生活中都遇到过一个问题，那就是`setTimeout`和`Promise`到底谁先执行，谁后执行。明明`setTimeout`写在前面,为啥在 `Promise`后执行。这其实有关于Event Loop相关的知识，在这篇文章中，我们会详细地来了解Event Loop相关知识，知道js异步运行代码的原理。

## 进程与线程

相信大家在平时的工作中都会听到或者看到一句话，js是`单线程`执行的，但是你是否有过疑惑，什么是线程？

提到线程，我们先来看看什么是进程。从本质上来说，两个名词都是`CPU工作时间片`的一个描述。

进程描述了CPU在`运行指令及加载和保存上下文所需的时间`,放在运用上来说就是一个程序。线程是比进程的更小单位，描述了进行一段指令所需的时间。
把这些概念拿到浏览器中来说就是，当你打开一个tab页，其实就创建了一个进程，页面进行渲染、js解析执行、HTTP请求都是单独的线程去完成，由此我们可以看出，一个进程中可以有多个线程。当我们在发起一个请求时，就创建了一个线程，请求结束，线程可能就会被销毁。

前面我们提到了js引擎线程和渲染线程，相信各位同学都知道，在js运行时可能会阻止UI渲染，这说明了这两个线程是`互斥`的。这其中的原因是因为js可以修改DOM，如果在js执行的时候UI线程还在工作，这就可能导致不安全的渲染UI。这其实也是1个单线程的好处，得益于js是单线程运行的，可以达到节省内存，节约上下文切换时间，没有锁的问题的好处。当然，在平常工作中，前面两点在服务端中更容易体现，对于锁的问题，打个比方:当我读取一个数字15的时候，同时有两个操作对数字进行了加减，这时候结果就出现了错误。解决这个问题也不难，只需要在读取的时候加锁，直到读取完毕之前都不能对其进行写入操作。


## 执行栈

不知道大家有没有发现，当我们F12打开调试控制台时，在最右边有一个函数调用的stack，这个就是一个执行栈。我们可以认为执行栈就是一个存储函数调用的`栈结构`，遵循先进后出的原则。

![](http://img.stallezhou.cn/blog/event_1.gif)

当我们开始执行js的时候，会先执行一个`main`函数,然后执行我们的代码。根据FILO(先进后出)的原则,后执行的函数会先弹出栈，在上图中我们可以看到，`foo`函数后执行，但是它执行完毕后就从栈中弹出了。

在平时的开发中，大家也可以在报错信息中看到执行栈的痕迹。

```js
function foo() {
  throw new Error('error')
}
function bar() {
  foo()
}
bar()
```
![](http://img.stallezhou.cn/blog/event_2.png)

大家可以在上图清晰的看到报错在`foo`函数，`foo` 函数又是在 `bar` 函数中调用的。


当我们使用递归的时候，因为栈可能存放的函数是有`限制`的，一旦过多且没有得到释放，就会出现栈溢出的情况。

```js
function bar() {
  bar()
}
bar()
```
![](http://img.stallezhou.cn/blog/event_3.png)


## 浏览器中的Event Loop

在前面，我们知道了线程、进程和执行栈，同学们也都知道了当我们执行js代码的时候就是往执行栈中放入函数，那么遇到异步的时候该怎么处理？接下来我们来看看浏览器的处理方法。

在我们遇到异步代码时，会被`挂起`并在需要执行的时候加入的Task(有多种task)队列中。一旦执行栈为空，Event Loop就会从Task队列中拿出需要执行的代码放入执行栈中执行，所以，从本质上说，js的异步还是同步行为。

![](http://img.stallezhou.cn/blog/event_4.png)

在浏览器中，不同的任务会有不同的Task队列，不同的任务可以分为`微任务(microtask)`和`宏任务(macrotask)`。在ES6中，microtask又被称为`jobs`,macrotask又被称为 task。下面我们来看看一段代码的执行顺序:

```js
console.log('script start')

async function async1() {
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2 end')
}
async1()

setTimeout(function() {
  console.log('setTimeout')
}, 0)

new Promise(resolve => {
  console.log('Promise')
  resolve()
})
  .then(function() {
    console.log('promise1')
  })
  .then(function() {
    console.log('promise2')
  })

console.log('script end')
// script start => async2 end => Promise => script end => promise1 => promise2 => async1 end => setTimeout
```

>注意：在新的浏览器中不是如上打印的，因为await变快了，具体情况后续会解释。

首先我们来看一下 `async` 和 `await`的执行顺序，当我们调用 `async1` 函数时 ，会马上输出 `async2 end`，并且函数会返回一个 `Promise`,接下来在遇到 `await` 的时候会让出线程开始执行 `async1`外的代码，所以我们可以把 `await` 看出是 **让出线程的标志**。

然后当同步代码全部执行完毕以后，就会去执行所有的异步代码，那么又会回到 `await` 的位置执行返回的 `Promise` 的 `resolve` 函数，这又会把 `resolve` 丢到微任务队列中，接下来去执行 `then` 中的回调，当两个 `then` 中的回调全部执行完毕以后，又会回到 `await` 的位置处理返回值，这时候你可以看成是 `Promise.resolve(返回值).then()`，然后 `await` 后的代码全部被包裹进了 `then` 的回调中，所以 `console.log('async1 end')` 会优先执行于 `setTimeout`。

如果你觉得上面这段解释还是有点绕，那么我把 `async` 的这两个函数改造成你一定能理解的代码:
```js
new Promise((resolve, reject) => {
  console.log('async2 end')
  // Promise.resolve() 将代码插入微任务队列尾部
  // resolve 再次插入微任务队列尾部
  resolve(Promise.resolve())
}).then(() => {
  console.log('async1 end')
})
```
也就是说，如果 `await` 后面跟着 `Promise` 的话，`async1 end` 需要等待三个 `tick` 才能执行到。那么其实这个性能相对来说还是略慢的，所以 V8 团队借鉴了 Node 8 中的一个 Bug，在引擎底层将三次 tick 减少到了二次 tick。但是这种做法其实是违法了规范的，当然规范也是可以更改的，这是 V8 团队的一个 [PR](https://github.com/tc39/ecma262/pull/1250)，目前已被同意这种做法。

所以Event Loop执行的顺序如下所示:
* 首先执行同步代码，这属于宏任务
* 当执行完所有同步代码后，执行栈为空，查询是否有异步代码需要执行
* 执行所有微任务
* 当执行完所有微任务后，如有必要会渲染页面
* 然后开始下一轮 Event Loop，执行宏任务中的异步代码，也就是 `setTimeout` 中的回调函数

所以以上代码虽然 `setTimeout` 写在 `Promise` 之前，但是因为 `Promise` 属于微任务而 `setTimeout` 属于宏任务，所以会有以上的打印。

微任务包括 `process.nextTick` ，`promise` ，`MutationObserver`，其中 `process.nextTick` 为 Node 独有。

宏任务包括 `script` ， `setTimeout` ，`setInterval` ，`setImmediate` ，`I/O` ，`UI rendering`。

这里很多人会有个误区，认为微任务快于宏任务，其实是错误的。因为宏任务中包括了 `script` ，浏览器会先执行一个宏任务，接下来有异步代码的话才会先执行微任务。

## Node中的Event Loop

相信大家刚开始都会有一个误区，node也是js写的，用的是js引擎，根浏览器中的Event loop应该是一样的。其实，Node中的Event Loop和浏览器中的完全不一样，是两个完全不相同的东西。

Node中的Event Loop分为6个阶段，它们会按照`顺序`反复执行。每当进入一个阶段的时候，都会从对应的回调队列中取出函数去执行。当队列为空或者执行的回调函数数量达到系统设定的阈值，就会进入下一个阶段。

![](http://img.stallezhou.cn/blog/event_5.png)


### timer

timers阶段会执行 `setTimeout`和 `setInterval`回调，并且是poll阶段控制的。
同样在node中定时器指定的时间也不是准确时间，只能是`尽快`执行。

### I/O

I/O 阶段会处理一些上一轮循环中的`少数未执行`的 I/O 回调

### idle、prepare

idle, prepare 阶段内部实现，这里就忽略不讲了。

### poll

poll 是一个至关重要的阶段，这一阶段中，系统会做两件事情:
1. 回到 timer 阶段执行回调
2. 执行 I/O 回调

并且在进入该阶段时如果没有设定了 timer 的话，会发生以下两件事情:

* 如果poll队列不为空，会遍历回调队列同步并同步执行，直到队列为空或者达到系统限制。
* 如果poll队列为空,会进行另外两件事
  1. 如果有 `setImmediate` 回调需要执行，poll 阶段会停止并且进入到 check 阶段执行回调
  2. 如果没有 `setImmediate` 回调需要执行，会等待回调被加入到队列中并立即执行回调，这里同样会有个超时时间设置防止一直等待下去

当然设定了 timer 的话且 poll 队列为空，则会判断是否有 timer 超时，如果有的话会回到 timer 阶段执行回调。

### check

check 阶段执行 `setImmediate`

### close callbacks

close callbacks 阶段执行 close 事件

好了，我们已经知道了Node中的Event Loop执行顺序，接下来我们通过代码的方式来深入理解这块内容。

在有些情况下，定时器的顺序是`随机`的
```js
setTimeout(() => {
    console.log('setTimeout')
}, 0)
setImmediate(() => {
    console.log('setImmediate')
})
```
对于以上代码来说，`setTimeout` 可能执行在前，也可能执行在后

* 首先 `setTimeout(fn, 0) === setTimeout(fn, 1)`，这是由源码决定的
* 其次,进入事件循环也是需要成本的，如果在准备时候花费了大于 1ms 的时间，那么在 timer 阶段就会直接执行 setTimeout 回调
* 那么如果准备时间花费小于 1ms，那么就是 setImmediate 回调先执行了

当然，在有些情况下，它们的执行顺序一定是固定的，比如:

```js
const fs = require('fs')

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('timeout');
    }, 0)
    setImmediate(() => {
        console.log('immediate')
    })
})
```

在上述代码中，`setImmediate` 永远**先执行**。因为两个代码写在 IO 回调中，IO 回调是在 poll 阶段执行，当回调执行完毕后队列为空，发现存在 `setImmediate` 回调，所以就直接跳转到 check 阶段去执行回调了。

在上面介绍的欧式macrotask的执行情况，对于microtask来说，它会在以上每个阶段完成前情况microtask队列，下图的Tick就代表了microtask:

![](http://img.stallezhou.cn/blog/event_6.png)

```js
setTimeout(() => {
  console.log('timer21')
}, 0)

Promise.resolve().then(function() {
  console.log('promise1')
})
```
对于以上代码来说，其实和浏览器中的输出是一样的，microtask 永远执行在 macrotask 前面。

最后我们来讲讲 Node 中的 `process.nextTick`，这个函数其实是独立于 Event Loop 之外的，它有一个自己的队列，当每个阶段完成后，如果存在 nextTick 队列，就会**清空队列中的所有回调函数**，并且优先于其他 microtask 执行。

```js
setTimeout(() => {
 console.log('timer1')

 Promise.resolve().then(function() {
   console.log('promise1')
 })
}, 0)

process.nextTick(() => {
 console.log('nextTick')
 process.nextTick(() => {
   console.log('nextTick')
   process.nextTick(() => {
     console.log('nextTick')
     process.nextTick(() => {
       console.log('nextTick')
     })
   })
 })
})
```

对于以上代码，大家可以发现无论如何，永远都是先把 nextTick 全部打印出来。

## 小结

在这里，我们了解了Event Loop相关的知识，也知道了浏览器的Event Loop和Node中的其实是不相同的。希望各位同学好好理解。