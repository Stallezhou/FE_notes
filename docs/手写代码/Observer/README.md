# 观察者模式详解

## 前言
在我们现实世界中，有很多东西都不是独立存在的。其中一件事情的发生可能会导致另一个或者多个其他的对象行为发生改变。例如:超市里某种商品打折会导致消费者购买开心，也能给超市老板带来更大的销售额；还有，当我们在过马路时，遇到红灯会停，绿灯行;这样的例子数不胜数。

## 什么是观察者模式
对于观察者模式的定义，我目前听到或者看到我觉得最正统的说法是当多个对象存在一对多的依赖关系，一个对象的状态发生改变时，所有依赖于它的对象都会得到通知并被自动更新。它是典型的对象行为模式。其主要优点有:
* 降低了目标与观察者之间的耦合关系，两者之间是抽象的耦合关系。符合依赖倒置原则
* 目标与观察者之间建立了一套通用的触发机制
但是它也有缺点，缺点就是:
* 目标与观察者之间的依赖关系并没有完全解除，而且有可能出现循环引用。
* 当观察者对象很多时，通知的时间会很长，影响程序的效率

## 模式的结构

实现观察者模式时要注意具体目标对象和具体观察者对象之间能不能直接调用，否则将使两者之间紧密耦合起来，这违反了面向对象的设计原则。
观察者模式中主要的几个角色是:
1. (Subject):也叫抽象目标类，它提供了一个用于保存观察者对象的聚集类以及增加、删除和通知观察者对象的方法。
2. 具体主题(Concrete Subject):也叫具体目标类，它实现抽象目标中的通知方法，当具体主题的内部状态发生改变时，通知所有注册过的观察者对象
3. 抽象观察者(Observer):它是一个抽象类或接口，它包含了一个更新自己的抽象方法，当接到具体主题通知时被调用
4. 具体观察者(Concrete Observer)实现抽象观察者中定义的抽象方法，以便在得到目标的更改通知时更新自身的状态


![](http://img.stallezhou.cn/blog/observer.svg)

上图就是观察者模式的结构图

## 模式的实现
观察者模式的主要实现代码如下
```js
let observer_ids = 0
let observed_ids = 0
// 观察者类
class Observer{
 constructor(){
  this.id = observer_ids++
 }
 response(ob){
  console.log(`观察者${this.id}-检测到被观察者${ob.id}变化`)
 }
}

//被观察者类
class Observed{
 constructor(){
   this.observers =[]
   this.id = observed_ids++;
 }
 // 添加观察者
 add(ob){
  this.observers.push(ob)
 }
 //删除观察者
 remove(ob){
  this.observers = this.observers.filter(item=>item.id!==ob.id)
 }
 // 通知所有观察者
 notify(ob){
  this.observers.map(observer=>{
   observer.response(ob)
  })
 }
}
```
接下来我们通过几个例子来测试一下
```js
let mObserved=new Observed();
let mObserver1=new Observer();
let mObserver2=new Observer();

mObserved.addObserver(mObserver1);
mObserved.addObserver(mObserver2);

mObserved.notify();
```
输出结果为:
>观察者0-检测到被观察者0变化
>
>观察者0-检测到被观察者0变化
接下来，我们测试移除观察者功能,我们继续增加一个观察者，并移除一个观察者
```js
let mObserver3=new Observer();
mObserved.addObserver(mObserver3);
mObserved.removeObserver(mObserver2);

mObserved.notify();
```
此次，输出结果为:
>观察者0-检测到被观察者0变化
>
>观察者2-检测到被观察者0变化

