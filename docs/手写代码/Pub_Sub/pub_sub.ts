interface patcher{
 [key:string]:Array<Subscriber>
}
let observed_id = 0
let observer_id = 0
// 发布者
class Pub{
 protected id:number = observed_id++
 dispatcher:any
 constructor(dispatcher:any){
  this.dispatcher = dispatcher
 }
  /**
  * @description:发布方法
  * @param {*} type 通知类型 
  */
 publish(type:string,args:any){
  this.dispatcher.publish(type,args)
 }
}

// 订阅者
class Subscriber{
  public id:number = observer_id++
  dispatcher:any
  constructor(dispatcher:any){
   this.dispatcher = dispatcher
  }

 /**
  * @description:订阅消息
  * @param {*} type 订阅类型
  */
 subscribe(type:string){
  this.dispatcher.subscribe(type,this)
 }
 /**
  * @description:接收到通知的响应
  * @param {*} type 通知类型
  * @param {*} arg 通知内容
  */
 response(type:string,arg:any){
  console.log(`接收到通知类型为${type},内容为:${arg}`)
 }
}

// 调度中心
class Dispatcher{
 public dispatcher:patcher
 constructor(){
  this.dispatcher = {}
 }
  /**
   * @description:订阅
   * @param {*} type 订阅类型
   * @param {*} subscriber 订阅人
   */
 subscribe(type:string,subscriber:any){
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
 unsubscribe(type:string,subscriber:any){
  let subscribers = this.dispatcher[type]
  if(!subscribers || !subscribers.length)return
  this.dispatcher[type] = subscribers.filter((sub:Subscriber):boolean=>sub.id!==subscriber.id)
 } 
 /**
  * @description:发布通知
  * @param {*} type 通知类型
  * @param {*} args 通知内容
  */
 publish(type:string,args:any){
  let subscribers = this.dispatcher[type]
  if(!subscribers || !subscribers.length)return
  subscribers.map((subscriber:any)=>{
   subscriber.response(type,args)
  })
 }
}