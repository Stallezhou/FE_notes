# call、apply和bind的实现

# call

## 核心思想
* 将函数设为对象的属性
* 执行&删除这个函数
* 指定`this`到函数并传入给定参数执行函数
* 如果不传入参数，默认指向window

## 实现
>我们本着由简至深的思想，先来实现一个比较简陋的版本，然后再进行升级改造

### 简陋版
```js
const foo = {
 value:1,
 bind:function(){
  console.log(this.value)
 }
}
foo.bind() // 1
```
### 升级版
```js
/**
 * @param{*}context 传入this需要绑定的对象
 */
Function.prototype._call = function(context){
 // 先对调用者进行判断，是否是函数
  if( typeof this != 'function'){
     throw typeError('not a function call')
  }
  context = context || window
  context.fn = this
  // 取出参数
  const args = [...arguments].slice(1)
  // 执行函数获取结果
  const result = context.fn(...args)
  // 删除添加的属性
  delete context.fn
  return result
}
```
# apply
`apply()`实现思路和`call()`类似，唯一不同的是传入的参数形式不一样
```js
/**
 * @param{*}context 传入this需要绑定的对象
*/
Function.prototype._apply= function(context){
 //先判断调用者是否为函数
 if(typeof this !='function'){
  throw typeError('not a function call')
 }
 context = context || window
 context.fn = this
 // 取出参数
 const args = arguments[1]
 //对参数判断并进行相应处理
 const result = args?context.fn(...args):context.fn()
 delete context.fn
 return result 
}
```
# bind
> `bind()`会创建一个新函数，当这个新函数被调用时，`bind()`会将它的**第一个参数** 作为它运行时的this，之后的序列参数将会在传递的实参前传入作为它的参数
此外，`bind()`实现需要考虑实例化后对原型链的影响
```js
/**
 * @param{*} context 传入this需要绑定的对象
*/
Function.prototype._bind = function(context){
 // 先判断调用者是否为函数
 if(typeof this !='function'){
  throw typeError('not a function bind')
 } 
 context = context || window
 const args = [...arguments].slice(1)
 return function F(){
  // 对于使用 new 的情况，不会被任何方式改变this，所以这种情况需要忽略传入的this
  if(this instanceof F ){
   return new context(...args,...arguments)
  }
  // 返回函数后可能会出现f.bind(obj,1)(2),所以需要将两边的参数拼接起来
  return context.apply(context,args.concat(...arguments))
 }
}
```