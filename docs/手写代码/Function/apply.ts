Function.prototype._apply = function (context = window,args){
 context.fn = this
 const result = context.fn(args)
 delete context.fn
 return result
}