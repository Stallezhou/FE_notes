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
 publish(type,args){
  this.dispatcher.publish(type,args)
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
  this.dispatcher.subscribe(type,this)
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

class User extends Subscriber{
 constructor(name,dispatcher){
  super(dispatcher)
  this.name = name 
 }
 response(type,arg){
  console.log(`${this.name}收到了${type}的信息,内容为${arg}`)
 } 
}

class Houses extends Pub{
 constructor(name,dispatcher){
  super(dispatcher)
  this.name = name
 }
 publishPrice(type,args){
  this.publish(type,args)
 }
}
