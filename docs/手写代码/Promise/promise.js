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
 _this.reason = null
 _this.resolvedCallBacks=[]
 _this.rejectedCallBacks=[]
 
 //TODO
 /**
  * 1.待完善的resolve和reject函数
  * 2.待完善执行fn函数
  */

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

 try {
  fn(resolve,reject)
 } catch (error) {
  reject(error)
 }
}

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