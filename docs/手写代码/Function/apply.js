/**
 * @param {*} context  传入this 需要绑定的执行对象 
 */
function _apply(context = window){
  if(typeof this !=='function'){
   throw TypeError('not a function apply')
  }
  const args = [...arguments].slice(1)
  context.fn = this
  const result = context.fn(...args)
  delete context.fn
  return result
}