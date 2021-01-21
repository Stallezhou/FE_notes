# 什么是React——Fiber

## 前言

相信很多同学在学习React时，都会遇到说fiber。那么到底什么是fiber，我们将通过本票文章来进行详细的了解。


## fiber的背景

* react在进行组件渲染时，从setState开始到渲染完成整个过程是同步的('一气呵成')。如果需要渲染的组件比较庞大，js执行会占据主线程时间较长，会导致页面响应

度变差，使得react在动画、手势等应用中效果比较差劲。

* 页面卡顿:Stack reconciler的工作流程很像函数的调用过程。父组件里调用子组件，可以类比为函数的递归。对于特别庞大的VirtualDOM树来说，reconciliation

过程比较长，超过16ms，在这期间，主线程是被js占用的，因此任何交互、布局、渲染都会停止。给用户的感觉就像页面卡住了。


## fiber的实现原理

>在老版的React通过递归的方式进行渲染，使用的是js引擎自身的函数调用栈，它会一直执行直到栈为空为止。而Fiber实现了自己的组件调用栈，它以链表的形式遍历组件树，可以灵活的暂停、继续和丢弃执行的任务。实现方式是使用了浏览器的requestIdleCallback这一api。Fiber其实就是一种数据结构，它可以用一个纯js对象来表示

```js
const fiber ={
 stateNode, // 节点实例
 child,     // 子节点
 sibling,   //兄弟节点
 return     //父节点 
}
```

通过fiber在react内部运转主要分三层

* VirtualDOM描述页面长什么样。
* Reconciler层，负责调用组件生命周期方法，进行DIFF运算。
* Renderer层，根据不同的平台，渲染出相应的页面，比较常见的是ReactDOM和ReactNative

为了实现页面不卡顿，就需要一个调度器(scheduler)来进行任务分配。优先级高的任务(如键盘输入)可以打断优先级低的任务(Diff)的执行，从而更快的生效。

在react中，任务的优先级有六种:
* synchronous,与之前的Stack Reconciler操作一样，同步执行
* task，在next tick之前执行
* animation，下一帧之前执行
* high，在不久的将来立即执行
* low，稍微延迟执行
* offscreen，下次render时或scroll时才执行


## Fiber Reconciler执行阶段

### 阶段一

生成Fiber树，得出需要更新的节点信息，这一步是一个渐进的过程，可以被打断

### 阶段二

将需要更新的节点一次批量更新，这个过程不能被打断


## Fiber树

Fiber Reconciler在阶段一进行Diff计算时，会基于VirtualDOM树生成一根Fiber树，它的本质是链表

## 本质

从Stack Reconciler到Fiber Reconciler，在源码层面就是将递归改为循环。

## 小结

在本篇文章中，我们介绍来fiber的背景，以及它的实现原理，希望各位同学可以结合相关源码进行仔细理解。

