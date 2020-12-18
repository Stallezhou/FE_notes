/**
 * @param {*} context  传入this 需要绑定的执行对象 
 */
function _call(context = window){
 if(typeof this !=='function'){
  throw TypeError('not a function apply')
 }
 const args = arguments[1]
 context.fn = this
 const result =args?context.fn(...args):context.fn()
 delete context.fn
 return result
}