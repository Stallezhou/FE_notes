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
 notifyObserver(ob){
  this.observers.map(observer=>{
   observer.response(ob)
  })
 }
}

