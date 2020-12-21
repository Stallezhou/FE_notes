
# Virtual DOM

## 前言
相信大家都知道，目前流行的两大前端框架，React和Vue，都不约而同的借助Virtual DOM来提高页面的渲染效率，那么么，什么是Virtual DOM呢？它又是怎样来帮助我们提高页面的渲染效率呢，接下来，我们将在本篇文章中探索这两个问题？

## 什么是Virtual DOM
不记得什么时候，在哪片文章中，听到关于Virtual DOM的解释，让我印象深刻。他是这样解释的:「从本质上来说，Virtual DOM是一个JavaScript对象，通过对象的方式来表示DOM结构，将表面的状态抽象成为JS对象的形式，配合不同的渲染工具，使跨平台渲染成为可能。通过事务处理机制，将多次DOM修改的结果一次性的更新到页面上，从而有效减少页面渲染的次数，减少修改DOM的重绘重排次数，来提高渲染性能。」

## Virtual DOM原理
### 利用JavaScript创建DOM树
我们借助一个例子，来看如何通过jsx编译器，来讲文件中的HTMl转化成函数的形式,然后生成Virtual DOM。
```jsx
function render(){
 return (
  <div>
   Hello world!
   <ul>
     <li id='1' class='li-1'>第一项</li>
   </ul>
  </div>
 )
}
```
经过编译后，绘输出下面的内容
```js
function render(){
 return h(
  'div',
  null,
  'hello world!',
  h(
   'ul',
   null,
   h(
    'li',
    {id:'1',class:'li-1'},
    '\u7b2c\u4e00\u9879'
   )
  )
 )
}
```
相信大家已经看懂的差不多来，这里的h是一个创造节点的函数，我们可以起任意的名字，但需要到babel配置，具体的配置如下:
```js
// .babelrc 文件
{ 
 "plugins":[
  ["transform-react-jsx"],{
   "pragma":"h"  //这里可以配置任意的名称
  }
 ]
}
```
接下来，我们需要定义h函数，就能创建DOM树了
```js
function flatten(arr){
 return [].concat.apply([],arr)
}
function h(tag,props,...children){
 // 这段判断在以前需要,随着jsx语法的发展,我们现在可以写成<></>的方式，这会被认为是一个fragment，因此没有判断也行
 if(!tag){
  throw typeError('tag not a node')
 }
 return {
  tag,
  props:props || {},
  children:flatten(children) || []
 }
}
```
h函数会传入三个或者以上的标签名，第一个是标签名，第二个是属性对象，从第三个开始的其它参数都是children。children可能是数组，所以需要将其结构一层，比如上面例子中的ul中不止一个元素时。通过h函数，我们会得到最终的Virtual DOM对象，结构如下
```js
{
 tag:"div",
 props:{},
 children:[
  "hello world!",
  {
   tag:"ul",
   props:{},
   children:[
    {
     tag:"ul",
     props:{},
     children:[
      {
       tag:"li",
       props:{
        id:1,
        class:"li-1"
       },
       children:["第一项"]
      }
     ]
    }
   ]
  }
 ]
}
```
至此，我们从html到Virtual DOM的真实编译过程已经结束了。不知道大家有没有明白呢？
### DOM树的diff
在我们更新页面或者更新数据时，DOM树会进行diff算法比对哪些节点或者数据已经被改变。具体比对是逐步同层对比，输出patches(listDiff，diffChildren，diffProps)
```js
// diff算法的实现
function diff(oldTree,newTree){
 const patches ={}
 dfs(oldTree,newTree,0,patches)
 return patches
}
function dfs(oldNode,newNode,index,patches){
 let curPatches = []
 if(newNode){
  // 当新的节点与旧的节点属性名称完全一致时
  if(oldNode.tagName === newNode.tagName && oldNode.key === newNode.key){
   // 继续对比属性差异
   const props=diffProps(oldNode.props,newNode.props)
   curPatches.push({type:"changeProps",props}) 
   //递归进入下一层级遍历比较
   diffChildren(oldNode.children,newNode.children)
  }
  else{
    curPatches.push({type:"replaceNode",node:newNode}) 
  } 
 }
 // 存在差异，构建整个差异树
 if(curPatches.length){
  if(patches[index]){
   patches[index] = patches[index].concat(curPatches)
  }
  else{
   patches[index] = curPatches
  }
 }
}

//属性对比
function diffProps(oldProps,newProps){
 const propPatches =[]
 // 1、遍历新旧属性列表 2、查找删除项 3、查找修改项 4、查找新增项
 for(const key in oldProps){
  // 如果新属性没有，就删除
  if(!newProps.hasOwnProperty(key)){
   propsPatches.push({type:"remove",prop:oldProps[key]})
  //新旧属性不一致，则加入修改项
  else if(oldProps[key]!==newProps[key]){
   propsPatches.push({type:"change",prop:oldProps[key],value:newProps[key]})
   }
  }
 }
 // 查找新增项
 for(const key in newProps){
  if(!oldProps.hasOwnProperty(key)){
   propsPatches.push({type:"add",prop:newProps[key]})
  }
 }
 return propsPatches
}

// 子级对比
function diffChildren(oldChild,newChild,index,patches){
 // 标记子级的删除，新增，移动
 let {change,list} = diffList(oldChild,newChild,index,patches)
 if(change.length){
  if(patches[index]){
   patches[index] = patches[index].concat(change)
   else
   patches[index] = change
  }
 }
 // 根据key获取原来匹配的节点，进一步递归从头开始
 oldChild.map((item,index)=>{
  let keyIndex = list.indexOf(item.key)
  if(keyIndex){
   let node = newChild[keyIndex]
   // 进一步递归对比
   dfs(item,node,index,patches)
  }
 })
}

/**
* 1、对比列表，根据key查找匹配项
* 2、对比新旧列表的新增，移动，删除
* @param {*} oldList
* @param {*} newList
* @param {*} index
* @param {*} patches
*/
function diffList(oldList,newList,index,patches){
 let change = []
 let list = []
 const newKeys=newList.map(item=>item.key)
 oldList.map(item=>{
  if(newKeys.includes(item.key)){
   list.push(item.key)
  }
  else{
   list.push(null)
  }
 })
 //标记删除
 for(let i = list.length-1;i>=0;i--){
  if(!list[i]){
   list.splice(i,1)
   change.push({type:"remove",index:i})
  }
 }
 // 标记新增和移动
 newList.map(item=>{
  const {key} = item
  const index  = list.indexOf(key)
  if(index===-1 || key ===null){
   // 新增
   change.push({type:"add",node:item,index:i})
   list.splice(i,0,key)
  }
  else if(index != i ){
   // 移动
   change.push({type:"move",from:index,to:i})
   move(list,index,i)
  }
 })
 return {change,list}
}
```
至此，我们的diff算法也已经大概实现的差不多，当然，这只是一个简单版本的diff算法，在具体的应用中，还有很多需要优化的地方，比如列表比对。我们来总结一下diff算法的几个步骤:
* 是否存在新的节点
* 新的节点是否与旧节点的tagName和key是否一致
* 对比新旧节点的props，继续递归遍历子树
* 对比属性(新旧属性列表)
### 更新渲染
* 通过diff算法得到所有更改的节点
* 加入更新队列，更新DOM

## 后序
Virtual DOM给我们带来的不仅仅是提升了浏览器的渲染性能，更重要的是一种思想。