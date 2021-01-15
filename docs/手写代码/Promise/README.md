# 手写Promise

## 前言

相信各位同学在平时的工作中，或多或少都会用到Promise。可是各位同学对其内部实现的原理知道多少？在本篇文章中，我们通过手写一个符合Promise/A+规范的Promise来深入理解它。在开始之前，推荐各位同学阅读一下[Promise/A+规范](https://www.ituring.com.cn/article/66566)，这样才能更好地理解这个章节的代码。

## 实现一个简易的Promise

在完成符合Promise/A+规范的代码之前，我们可以先来实现一个简单版本的Promise，通过简单的Promise先来理解Promise的大体框架。

```js
// 状态map
const status = {
 PENDING:'pending',
 RESOLVED:'resolved',
 REJECTED:'rejected'
}

function _Promise(fn){
 const _this = this
 _this.state = status.PENDING
 _this.value=null
 _this.reason=null
 _this.resolvedCallBacks=[]
 _this.rejectedCallBacks=[]
 
 //TODO
 /**
  * 1.待完善的resolve和reject函数
  * 2.待完善执行fn函数
  */
}
```

* 首先我们创建了一个状态map来表示三种状态
* 在函数体内部我们先将`this`赋值给常量`_this`，这保证在后面可能的异步执行代码中获取到正确的this对象
* 一开始`Promise`的状态是`pending`，这是Promise/A+规范规定的 
* `value`变量用于保存`resolve`或者`reject`中传入的值
* `reason`变量用于保存`Promise`被`reject`的原因
* `resolvedCallBacks` 和  `rejectedCallBacks` 用于保存`then`中的回调，因为当执行完`Promise`时状态可能还是等待中，这时候应该把`then`中回调保存起来用与状态改变时使用

接下来我们继续完善`resolve` 和 `reject`函数，并把它放置在`_promise`函数体内部

```js
 function resolve(value){
  if(_this.state === status.PENDING){
   _this.state = status.RESOLVED
   _this.value = value
   _this.resolvedCallBacks.map(cb=>cb(_this.value))
  }
 } 

 function reject(value){
  if(_this.state === status.PENDING){
   _this.state = status.REJECTED
   _this.reason = value
   _this.rejectedCallBacks.map(cb=>cb(_this.reason))
  }
 }
```

由于这两个函数逻辑基本一致，我就不一一细说了。

* 首先判断当前状态是否为Pending，因为在规范中规定promise只有在pending时才可以更改状态。
* 将当前状态更改为对应的状态，并将值赋值给value或者reason
* 遍历回调数组去执行

接下来，我们去实现如何执行传递给promise的函数

```js
try {
  fn(resolve,reject)
 } catch (error) {
  reject(error)
 }
```
* 实现很简单，执行传入的参数并且将resolve和reject当作参数传进去。
* 值得注意的是，我们传递进去的函数并不一定会成功执行，因此需要我们捕获错误并且执行reject函数


最后我们来实现较为复杂的`then`函数


```js
_Promise.prototype.then = function(onFulfilled,onRejected){
 const _this  = this
 onFulfilled = typeof onFulfilled === 'function'?onFulfilled:v=>v
 onRejected = typeof onRejected === 'function'?onRejected:r=>{throw r}
 if(_this.state === status.PENDING){
  _this.resolvedCallBacks.push(onFulfilled)
  _this.rejectedCallBacks.push(onRejected)
 }
 if(_this.state === status.RESOLVED){
  onFulfilled(_this.value)
 }
 if(_this.state === status.REJECTED){
  onRejected(_this.reason)
 }
}
```
* 首先判断传递进来的两个参数是否为函数
* 当参数不是函数类型时，需要创建一个函数赋值给对应的参数，同时也实现了透传。
* 接下来就是判断状态，并根据当前状态做不同的操作。

以上就是一个简单版的Promise实现，接下来我们将实现完整版本的解析。

## 实现一个符合 Promise/A+ 规范的 Promise

由于现在外面使用js写的Promise 很容易找，因此我们在这使用TS来进行讲解。

### 构造函数

规范提到 Promise 构造函数接受一个 `Resolver` 类型的函数作为第一个参数，该函数接受两个参数 `resolve` 和 `reject`，用于处理 `promise` 状态。
具体实现如下:


```ts
class Promise {
  // 内部属性
  private ['[[PromiseStatus]]']: PromiseStatus = 'pending';
  private ['[[PromiseValue]]']: any = undefined;
  private PROMISE_ID:number = id++
  subscribes: any[] = [];

  constructor(resolver: Resolver<R>) {
    // resolver 必须为函数
    typeof resolver !== 'function' && resolverError();
    // 使用 Promise 构造函数，需要用 new 操作符
    this instanceof Promise ? this.init(resolver) : constructorError();
  }

  private init(resolver: Resolver<R>) {
    try {
      // 传入两个参数并获取用户传入的终值或拒因。
      resolver(
        value => {
          this.resolve(value);
        },
        reason => {
          this.reject(reason);
        }
      );
    } catch (e) {
      this.reject(e);
    }
    return null;
  }

  private resolve() {
    // TODO
  }
  private reject() {
    // TODO
  }
}
```

### [[Resolve]]实现

通过前面建议部分讲解，我们了解到 [[Resolve]] 属于内部实现，用于处理 then 参数的返回值。

根据规范我们可以得知，`resolve` 可以接受的value 可能是 Promise、thenable以及其他的值。


```ts
private resolve(value: any) {
  // 规范提到 resolve 不能传入当前返回的 promise
  // 即 `[[Resolve]](promise,x)` 中 promise ！== x
  if (value === this) {
    this.reject(resolveSelfError);
    return;
  }
  // 非对象和函数，直接处理
  if (!isObjectORFunction(value)) {
    this.fulfill(value);
    return;
  }
  // 处理一些像 promise 的对象或函数，即 thenable
  this.handleLikeThenable(value, this.getThen(value));
}
```

### 处理Thenable对象

由于在promise 出现之前，有很多第三方插件使用自己的方法创建来一套then体系，因此为了兼容，Promise实现了thenabale的处理。

```ts
private handleLikeThenable(value: any, then: any) {
    // 处理 "真实" promise 对象
    if (this.isThenable(value, then)) {
      this.handleOwnThenable(value);
      return;
    }
    // 获取 then 值失败且抛出异常，则以此异常为拒因 reject promise
    if (then === TRY_CATCH_ERROR) {
      this.reject(TRY_CATCH_ERROR.error);
      TRY_CATCH_ERROR.error = null;
      return;
    }
    // 如果 then 是函数，则检验 then 方法的合法性
    if (isFunction(then)) {
      this.handleForeignThenable(value, then);
      return;
    }
    // 非 Thenable ，则将该终植直接交由 fulfill 处理
    this.fulfill(value);
}
```
### 处理 Thenable 中 Then 为函数的情况

>在规范中提到:如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise。

此时，handleForeignThenable 就是用来检验 then 方法的。
```ts
private tryThen(then, thenable, resolvePromise, rejectPromise) {
    try {
      then.call(thenable, resolvePromise, rejectPromise);
    } catch (e) {
      return e;
    }
  }
  private handleForeignThenable(thenable: any, then: any) {
    this.asap(() => {
      // 如果 resolvePromise 和 rejectPromise 均被调用，
      // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
      // 此处 sealed (稳定否)，用于处理上诉逻辑
      let sealed = false;
      const error = this.tryThen(
        then,
        thenable,
        value => {
          if (sealed) {
            return;
          }
          sealed = true;
          if (thenable !== value) {
            this.resolve(value);
          } else {
            this.fulfill(value);
          }
        },
        reason => {
          if (sealed) {
            return;
          }
          sealed = true;
          this.reject(reason);
        }
      );

      if (!sealed && error) {
        sealed = true;
        this.reject(error);
      }
    });
}
```

### fulfill实现

我们来看看 `[[Resolve]]` 中最后一步，`fulfill` 实现：

```ts
  private fulfill(value: any) {
    this['[[PromiseStatus]]'] = 'fulfilled';
    this['[[PromiseValue]]'] = value;

    // 用于处理异步情况
    if (this.subscribes.length !== 0) {
      this.asap(this.publish);
    }
  }
```

### [[Resolve]] 小结

至此，一个内部 [[Resolve]] 就实现了。我们回顾一下，[[Resolve]] 用于处理以下情况

```ts
// 实例化构造函数，传入 resolve 的情况
const promise = Promise(resolve => {
  const value: any;
  resolve(value);
});

// then 方法中有 返回值的情况
promise.then(
  () => {
    const value: any;
    return value;
  },
  () => {
    const reason: any;
    return reason;
  }
);
```
对于终值 `value` 有多种情况，在处理 `Thenable` 的时候，请参考规范来实现。`promise` 除了 `resolve` 的还有 `reject`，但这部分内容比较简单，我们会放到后面再讲解。先来看与 `resolve` 密不可分的 then 方法实现。这也是 `promise` 的核心方法。

### Then 方法实现

通过前面的实现，我们已经可以从 `Promise` 构造函数来改变内部 `[[PromiseStatus]]` 状态以及内部 `[[PromiseValue]]` 值，并且对于多种 value 值我们都有做相应的兼容处理。接下来，是时候把这些值交由 then 方法中的第一个参数 `onFulfilled` 处理了。
在讲解之前先来看下这种情况：
```ts
promise2 = promise1.then(onFulfilled, onRejected);
```
使用 promise1 的 then 方法后，会返回一个 promise 对象 promise2 实现如下：

```ts
then(onFulfilled?, onRejected?) {
    // 对应上述的 promise1
    const parent: any = this;
    // 对应上述的 promise2
    const child = new parent.constructor(() => {});

    // 根据 promise 的状态选择处理方式
    const state = PROMISE_STATUS[this['[[PromiseStatus]]']];
    if (state) {
      // promise 各状态对应枚举值 'pending' 对应 0 ，'fulfilled' 对应 1，'rejected' 对应 2
      const callback = arguments[state - 1];
      this.asap(() =>
        this.invokeCallback(
          this['[[PromiseStatus]]'],
          child,
          callback,
          this['[[PromiseValue]]']
        )
      );
    } else {
      // 调用 then 方法的 promise 处于 pending 状态的处理逻辑，一般为异步情况。
      this.subscribe(parent, child, onFulfilled, onRejected);
    }

    // 返回一个 promise 对象
    return child;
  }
```
这里比较惹眼的 `asap` 后续会单独讲。先来理顺一下逻辑，`then` 方法接受两个参数，由当前 `promise` 的状态决定调用 `onFulfilled` 还是 `onRejected`。现在大家肯定很关心 `then` 方法里的代码是如何被执行的，比如下面的 `console.log`：

```ts
promise.then(value => {
  console.log(value);
});
```

接下来看与之相关的 `invokeCallback` 方法

### then 方法中回调处理

`then` 方法中的 `onFulfilled` 和 `onRejected` 都是可选参数，开始进一步讲解前，建议大家先了解规范中提及的两个参数的特性。

现在来讲解 `invokeCallback` 接受的参数及其含义：

* `settled` (稳定状态)，`promise` 处于非 `pending` 状态则称之为 `settled`，`settled` 的值可以为 `fulfilled` 或 `rejected`

* `child` 即将返回的 `promise` 对象

* `callback` 根据 `settled` 选择的 `onFulfilled` 或 `onRejected` 回调函数

* `detail` 当前调用 `then` 方法 `promise` 的 `value(终值)` 或 `reason(拒因)`

注意这里的 `settled` 和 `detail`，`settled` 用于指 `fulfilled` 或 `rejected`， `detail` 用于指 `value` 或 `reason` 这都是有含义的,

知道这些之后，就只需要参考规范建议实现的方式进行处理相应：
```ts
  private invokeCallback(settled, child, callback, detail) {
    // 1、是否有 callback 的对应逻辑处理
    // 2、回调函数执行后是否会抛出异常，即相应处理
    // 3、返回值不能为自己的逻辑处理
    // 4、promise 结束(执行结束或被拒绝)前不能执行回调的逻辑处理
    // ...
  }
```
需要处理的逻辑已给出，剩下的实现方式读者可自行实现或看本项目源码实现。建议所有实现都应参考规范来落实，在实现过程中可能会出现遗漏或错误处理的情况。(**ps：考验一个依赖健壮性的时候到了**)

截至目前，都是处理同步的情况。`promise` 号称处理异步的大神，怎么能少得了相应实现。处理异步的方式有回调和订阅发布模式，我们实现 `promise` 就是为了解决回调地狱的，所以这里当然选择使用 订阅发布模式。

### then 异步处理

这里要处理的情况是指：当调用 `then` 方法的 `promise` 处于 `pending` 状态时。

那什么时候会出现这种情况呢？来看下这段代码：

```ts
const promise = new Promise(resolve => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});

promise.then(value => {
  console.log(value);
});

```
代码编写到这里，如果出现这种情况。我们的 `promise` 其实是不能正常工作的。由于 `setTimeout` 是一个异常操作，当内部 `then` 方法按同步执行的时候，`resolve` 根本没执行，也就是说调用 `then` 方法的 `promise` 的 `[[PromiseStatus]]` 目前还处于 `'pending'`，`[[PromiseValue]]` 目前为 `undefined`，此时添加对 `pending` 状态下的回调是没有任何意义的 ，另外规范提及 `then` 方法的回调必须处于 `settled( 之前有讲过 )` 才会调用相应回调。或者我们不用考虑是不是异步造成的，只需要明确一件事。存在这么一种情况，调用 `then` 方法的 `promise` 状态可能为 `pending`。
这时就必须有一套机制来处理这种情况，对应代码实现就是：

```ts
private subscribe(parent, child, onFulfillment, onRejection) {
    let {
      subscribes,
      subscribes: { length }
    } = parent;
    subscribes[length] = child;
    subscribes[length + PROMISE_STATUS.fulfilled] = onFulfillment;
    subscribes[length + PROMISE_STATUS.rejected] = onRejection;
    if (length === 0 && PROMISE_STATUS[parent['[[PromiseStatus]]']]) {
      this.asap(this.publish);
    }
}
```
`subscribe` 接受 4 个参数 `parent`，`child`,`onFulfillment`,`onRejection`
* `parent` 为当前调用 `then` 方法的 `promise` 对象
* `child` 为即将由 `then` 方法返回的 `promise` 对象
* `onFulfillment` then 方法的第一个参数
* `onFulfillment` then 方法的第二个参数

用一个数组来存储 `subscribe` ，主要保存即将返回的 `promise` 对象及相应的 `onFulfillment` 和 `onRejection` 回调函数。
满足 `subscribe`是新增的情况及调用 `then` 方法的 `promise `对象的 `[[PromiseStatus]]` 值不为 `'pending'`，则调用 `publish` 方法。也就是说异步的情况下，不会调用该 `publish` 方法。
这么看来这个 `publish` 是跟执行回调相关的方法。
那异步的情况，什么时候会触发回调呢?可以回顾之前讲解过的 `fulfill` 方法:

```ts
 private fulfill(value: any) {
    this['[[PromiseStatus]]'] = 'fulfilled';
    this['[[PromiseValue]]'] = value;

    // 用于处理异步情况
    if (this.subscribes.length !== 0) {
      this.asap(this.publish);
    }
  }
```

当满足 `this.subscribes.length !== 0` 时会触发 `publish`。也就是说当异步函数执行完成后调用 `resolve` 方法时会有这么一个是否调用 `subscribes` 里面的回调函数的判断。
这样就保证了 `then` 方法里回调函数只会在异步函数执行完成后触发。接着来看下与之相关的 `publish` 方法:

### publish

首先明确，`publish` 是发布，是通过 `invokeCallback` 来调用回调函数的。在本项目中，只与 `subscribes` 有关。直接来看下代码:

```ts
  private publish() {
    const subscribes = this.subscribes;
    const state = this['[[PromiseStatus]]'];
    const settled = PROMISE_STATUS[state];
    const result = this['[[PromiseValue]]'];
    if (subscribes.length === 0) {
      return;
    }
    for (let i = 0; i < subscribes.length; i += 3) {
      // 即将返回的 promise 对象
      const item = subscribes[i];
      const callback = subscribes[i + settled];
      if (item) {
        this.invokeCallback(state, item, callback, result);
      } else {
        callback(result);
      }
    }
    this.subscribes.length = 0;
  }
```

### then 方法小结

到这我们就实现了 `promise` 中的 `then` 方法，也就意味着目前实现的 `promise` 已经具备处理异步数据流的能力了。`then` 方法的实现离不开规范的指引，只要参考规范对 `then` 方法的描述，其余就只是逻辑处理了。
至此 `promise` 的核心功能已经讲完了，也就是内部 `[[Resolve]]` 和 `then` 方法。接下来快速看下其余 API。

### 语法糖 API 实现

`catch` 和 `finally` 都属于语法糖

* `catch` 属于 `this.then(null,onRejection)`
* `finally` 属于 `this.then(callback,callback)`

promise还提供了 `resolve`、`reject`、`all`、`race`的静态方法，为了方便链式调用，上述方法均会返回一个新的promise对象。之前主要讲的resolve。接下来看其他几个方法


#### reject

reject 处理方式跟 resolve 略微不同的是它不用处理 thenable 的情况，规则提及 reject 的值 reason 建议为 error 实例代码实现如下:

```ts
 private reject(reason: any) {
    this['[[PromiseStatus]]'] = 'rejected';
    this['[[PromiseValue]]'] = reason;
    this.asap(this.publish);
  }
  static reject(reason: any) {
    let Constructor = this;
    let promise = new Constructor(() => {});
    promise.reject(reason);
    return promise;
  }
```

####  all&race

在前面 API 的基础上，扩展出 all 和 race 并不难。先来看两者的作用：

* all 用于处理一组 promise，当满足所有 promise 都 resolve 或 某个 promise reject 时返回对应由 value 组成的数组或 reject 的 reason

* race 赛跑的意思，也就是在一组 promise 中看谁执行的快，则用这个 promise 的结果

对应实现代码：

```ts

static all(entries:any[]){
 let result = [];
   let num = 0;
   if (!Array.isArray(entries)) {
     return new this((_, reject) =>
       reject(new TypeError('You must pass an array to all.'))
     );
   } else {
     if (entries.length === 0) {
       return new this(resolve => resolve([]));
     }
     return new this((resolve, reject) => {
       entries.forEach(item => {
         this.resolve(item).then(data => {
           result.push(data);
           num++;
           if (num === entries.length) {
             resolve(result);
           }
         }, reject);
       });
     });
   }
}

static race(entries:any[]){
 if (!Array.isArray(entries)) {
     return new this((_, reject) =>
       reject(new TypeError('You must pass an array to race.'))
     );
   } else {
     return new this((resolve, reject) => {
       let length = entries.length;
       for (let i = 0; i < length; i++) {
         this.resolve(entries[i]).then(resolve, reject);
       }
     });
   }
}

```

### 什么是 asap

大家可能在前边看到我们一直在说`asap`,那么`asap`到底是什么？ 其实 `asap`就是`as soon as possible`,意味是要尽快响应变化。

在 Promises/A+规范 的 Notes 3.1 中提及了 promise 的 then 方法可以采用“宏任务（macro-task）”机制或者“微任务（micro-task）”机制来实现。

本项目，采用 macro-task 机制:

```ts
  private asap(callback) {
    setTimeout(() => {
      callback.call(this);
    }, 1);
  }
```
## 小结
好了，以上就是关于promise全部的讲解了。

注意:以上文章中 部分内容来源于https://juejin.cn/post/6844903728399532039