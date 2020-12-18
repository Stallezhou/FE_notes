Function.prototype._bind = function (context = window, ...args) {
 const _this = this;
 function F(): any {
   return _this.apply(context, args.push(...arguments));
 }
 function Temp(){}
 Temp.prototype = this.prototype;
 // @ts-ignore
 F.prototype = new Temp();
 return F;
};