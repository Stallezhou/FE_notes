Function.prototype._call = function(context=window,...args:any){
 context.fn = this
 const result = context.fn(...args)
 delete context.fn
 return result
}