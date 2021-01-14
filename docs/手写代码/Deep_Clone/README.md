# 必须要会区别的浅拷贝与深拷贝

## 前言

在我们日常的工作中，相信很多同学都有面临复制对象的问题。在js中有不同的方法来复制对象，但是很多同学都遇到过陷阱。今天，我们就来看看怎样才能正确地复制一个对象。

## 定义

### 浅拷贝

浅拷贝是创建一个新对象，这个对象有着原始对象属性值的一份精确拷贝。如果属性是基本类型，拷贝的就是基本类型的值，如果属性是引用类型，拷贝的就是内存地址 ，所以如果`其中一个对象改变了这个地址，就会影响到另一个对象`。

### 深拷贝

深拷贝是将一个对象从内存中完整的拷贝一份出来,从堆内存中开辟一个新的区域存放新对象,且`修改新对象不会影响原对象`。

```js
var a = {a:{b:{c:{}}}} 

var b = shallowClone(a) //浅拷贝方法

b.b.c === a.b.c // true 新旧对象还是共享同一块内存

var c = deepClone(a)  //深拷贝方法

c.b.c === a.b.c // false 新对象与原对象不共享内存

```


###  深拷贝与浅拷贝的区别 

下面，我们通过一张图片来看一下深拷贝与浅拷贝的含义

![](http://img.stallezhou.cn/blog/deepClone.svg)


总而言之，浅拷贝复制只会复制原始类型的值，引用类型的值只会复制指向该引用类型的指针，而不是引用类型本身。`新旧对象还是共享同一块内存地址`。但是深拷贝会另外创造一块空间来保存复制过来的引用类型本身。`新对象跟原对象不共享内存，修改新对象不会改到原对象`。


## 实现

### 浅拷贝

#### Object.assign

Object.assign() 方法可以把任意多个的源对象自身的`可枚举的属性`拷贝给目标对象，然后返回目标对象。

```js
let obj = {person:{name:'kobe',age:41},sports:'basketball'}
let obj1 = Object.assign({},obj)

obj1.person.name='zhangjike'

obj2.sports = 'pingpang'

console.log(obj) // {person:{name:'kobe',age:41},sports:'pingpang'}
```

#### 展开运算符...

展开运算符是一个 es6 / es2015特性，它提供了一种非常方便的方式来执行浅拷贝，这与 Object.assign ()的功能相同。

```js
let obj1 = { name: 'Kobe', address:{x:100,y:100}}
let obj2= {... obj1}
obj1.address.x = 200;
obj1.name = 'wade'
console.log('obj2',obj2) // obj2 { name: 'Kobe', address: { x: 200, y: 100 } }
```
#### Array.prototype.concat()

```js
let arr = [1, 3, {
    username: 'kobe'
    }];
let arr2 = arr.concat();    
arr2[2].username = 'wade';
console.log(arr); //[ 1, 3, { username: 'wade' } ]
```

#### Array.prototype.slice()

```js
let arr = [1, 3, {
    username: ' kobe'
    }];
let arr3 = arr.slice();
arr3[2].username = 'wade'
console.log(arr); // [ 1, 3, { username: 'wade' } ]
```

#### 各个函数库提供的方法

在我们普遍使用的各个函数库中，也有自己对浅拷贝实现的方法，比如lodash的_.clone可以用来做浅拷贝。

```js
var _ = require('lodash');
var obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
var obj2 = _.clone(obj1);
console.log(obj1.b.f === obj2.b.f);// true
```


### 深拷贝

#### JSON.parse(JSON.stringify())

这是最简单也最普通的一种方法，在一些没有特殊要求的简单对象，很好用。

```js
let arr = [1, 3, {
    username: ' kobe'
}];
let arr4 = JSON.parse(JSON.stringify(arr));
arr4[2].username = 'zhangjike'; 
console.log(arr, arr4)
```
![](http://img.stallezhou.cn/blog/deepClone1.jpg)

这也是利用JSON.stringify将对象转成JSON字符串，再用JSON.parse把字符串解析成对象，一去一来，新的对象产生了，而且对象会开辟新的栈，实现深拷贝。
`这种方法虽然可以实现数组或对象深拷贝,但不能处理函数和正则`，因为这两者基于JSON.stringify和JSON.parse处理后，得到的正则就不再是正则（变为空对象），得到的函数就不再是函数（变为null）了。

比如:

```js
let arr = [1, 3, {
    username: ' kobe'
},function(){}];
let arr4 = JSON.parse(JSON.stringify(arr));
arr4[2].username = 'zhangjike'; 
console.log(arr, arr4)
```

![](http://img.stallezhou.cn/blog/deepClone2.jpg)

#### jQuery.extend()方法

jquery有提供一个$.extend可以用来做deepCopy

```js
$.extend(deepCopy, target, object1, [objectN])//第一个参数为true,就是深拷贝


var $ = require('jquery');
var obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
var obj2 = $.extend(true, {}, obj1);
console.log(obj1.b.f === obj2.b.f); // false
```


#### 函数库lodash的_.cloneDeep方法

lodash给我们提供了一个可以用来深拷贝的方法


```js
var _ = require('lodash');
var obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
var obj2 = _.cloneDeep(obj1);
console.log(obj1.b.f === obj2.b.f);// false
```

#### 手写递归方法

递归实现深拷贝的原理是:遍历对象，数组直到基本类型，然后再复制。

但是在我们平常面试中，有几种特俗情况需要注意就是对象存在循环引用和key为symbol的情况。解决循环引用可以使用额外的空间去保存我们访问过的对象，当我们拷贝时先看额外空间是否存在，若存在直接使用额外空间里的即可。对于key为symbol的情况，我们不能使用普通的遍历对象的方式，需要配合reflect.ownKeys即可。

```js
function deepClone(obj) {
  function isObject(o) {
    return (typeof o === 'object' || typeof o === 'function') && o !== null
  }

  if (!isObject(obj)) {
    throw new Error('非对象')
  }

  let isArray = Array.isArray(obj)
  let newObj = isArray ? [...obj] : { ...obj }
  Reflect.ownKeys(newObj).forEach(key => {
    newObj[key] = isObject(obj[key]) ? deepClone(obj[key]) : obj[key]
  })

  return newObj
}
```

## 小结

本篇文章介绍了js如何复制对象吗，以及浅拷贝和深拷贝区别，希望各位同学认真学习以及了解。


