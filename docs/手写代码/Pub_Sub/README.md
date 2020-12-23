# 发布订阅者模式

## 前言
在昨天，我们了解了什么是观察者模式，并且知道了它实现的原理。今天，我们来看一个和它类似但又不完全相同的设计模式，发布订阅者模式。

## 什么是发布订阅模式
总体上来说，发布订阅模式与观察者模式是相似的，但发布订阅比观察者多了一个中间层的调度中心，用来对发布者发布的信息进行处理再发布到订阅者。通俗来讲，就是你想要买房子，你需要了解各个楼盘的价格，但是你自己工作繁忙，因此你找了一个中介，中介帮你关注各个楼盘的价格信息，然后汇总发给你。具体的过程如下图所示:

![](http://img.stallezhou.cn/blog/pub_sub.svg)

那么问题来了，我们加这个中间层的调度中心是为什么呢？通过昨天的观察者模式的实现，我们发现，observed类中是有observer对象的。因此并没有实现两个类的完全解耦，因此我们需要添加中间层的调度中心类，这样，我们可以完全将发布者和订阅者解耦。两者不再有直接的关连，而是通过调度中心关连起来。

## 发布订阅模式的实现
```js
let observed_ids = 0
let observer_ids = 0
// 发布者
class Pub{
 constructor(dispatcher){
  this.dispatcher = dispatcher
  this.id = observed_ids++
 }
 /**
 * @description:发布方法
 * @param {*} type 通知类型 
 */
 publish(type){
  this.dispatcher.publish(type,this)
 }
}
//订阅者
class Subscriber{
 constructor(dispatcher){
  this.dispatcher= dispatcher
  this.id = observer_ids++
 }
 /**
  * @description:订阅消息
  * @param {*} type 订阅类型
  */
 subscribe(type){
  this.dispatcher.subscribe[type,this]
 }
 /**
  * @description:接收到通知的响应
  * @param {*} type 通知类型
  * @param {*} arg 通知内容
  */
 response(type,arg){
  console.log(`接收到通知类型为${type},内容为:${arg}`)
 }
}



// 调度中心
class Dispatcher{
 constructor(){
  this.dispatcher = {}
 }
  /**
   * @description:订阅
   * @param {*} type 订阅类型
   * @param {*} subscriber 订阅人
   */
 subscribe(type,subscriber){
  if(!this.dispatcher[type]){
   this.dispatcher[type] = []
  }
  this.dispatcher[type].push(subscriber)
 }
 /**
  * @description:退订
  * @param {*} type  退订类型
  * @param {*} subscriber 退订人
  */
 unsubscribe(type,subscriber){
  let subscribers = this.dispatcher[type]
  if(!subscribers || !subscribers.length)return
  this.dispatcher[type] = subscribers.filter(sub=>sub.id!==subscriber.id)
 } 
 /**
  * @description:发布通知
  * @param {*} type 通知类型
  * @param {*} args 通知内容
  */
 publish(type,args){
  let subscribers = this.dispatcher[type]
  if(!subscribers || !subscribers.length)return
  subscribers.map(subscriber=>{
   subscriber.response(type,args)
  })
 }
}
```
## 测试
我们还是通过买房的例子来说明这个问题,首先新建两个类，用户类和楼盘类，分别继承订阅者，发布者
```js
class User extends Subscriber{
 constructor(name,dispatcher){
  super(dispatcher)
  this.name = name 
 }
 response(type,arg){
  console.log(`${this.name}收到了${type}楼盘的信息`)
 } 
}

class Houses extends Pub{
 constructor(name,dispatcher){
  super(dispatcher)
  this.name = name
 }
 publishPrice(type){
  this.publish(type)
 }
}
```
接下来，我们新增几个用户和楼盘，并让用户订阅楼盘
```js
// 新增一个调度中心
const dispatcher = new Dispatcher()

// 新增3个用户
const user1 = new User('张三',dispatcher)
const user2 = new User('李四',dispatcher)
const user3 = new User('王麻子',dispatcher)

//新增2个楼盘
const house1= new Houses('楼盘1',dispatcher)  
const house2= new Houses('楼盘2',dispatcher)  

// 用户订阅楼盘
user1.subscribe('楼盘1')
user2.subscribe('楼盘2')
user3.subscribe('楼盘2')

// 楼盘发布价格信息

house1.publishPrice('楼盘1','价格提升到200/平')
house2.publishPrice('楼盘2','价格提升到220/平')
```
我们可以看到输出是
>张三收到了楼盘1的信息,内容为价格提升到200/平
>
>李四收到了楼盘2的信息,内容为价格提升到220/平
>
>王麻子收到了楼盘2的信息,内容为价格提升到220/平
至此，我们手写实现发布订阅者的源码就到此结束了。

# 最后
以上是我自己阅读设计模式以及参考网上的一部分解释后，说出自己对观察者模式的理解。如有不当之处还望指正。