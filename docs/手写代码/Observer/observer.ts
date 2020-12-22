let observer_ids = 0
let observed_ids = 0
// 观察者类
class Observer{
 public id:number=observed_ids++
 //观察到变化后处理
 response(ob:any):void{
  console.log(`观察者${this.id}检测到被观察者${ob.id}变化`)
 }
}
// 被观察者类
class Observed{
 private id:number = observed_ids++
 private observers:Array<Observer> = []
 // 添加观察者
 add(observer:Observer):void{
  this.observers.push(observer) 
 }
 // 删除观察者
 remove(observer:Observer){
  this.observers = this.observers.filter(ob=>ob.id!==observer.id)
 }
 //通知所有观察者
 notify(ob:Observed):void{
  this.observers.map(observer=>{
   observer.response(ob)
  })
 }
}