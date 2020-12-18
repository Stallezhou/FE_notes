/**
 * @param {*} context  传入this 需要绑定的执行对象 
 */
function _bind(context = window){
 if(typeof this !=='function'){
  throw TypeError('not a function apply')
 }
 const args = [...arguments].slice(1)
 const _this = this
 return function F(){
   if(this instanceof F){
  // 对于使用 new 的情况，不会被任何方式改变this，所以这种情况需要忽略传入的this
    return new _this(...args,...arguments)
   }
  // 返回函数后可能会出现f.bind(obj,1)(2),所以需要将两边的参数拼接起来
  return _this.apply(context,args.concat(...arguments))
 }
}