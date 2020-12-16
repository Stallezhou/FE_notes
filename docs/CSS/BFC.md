# BFC
>   BFC:Block Formatting Context(块级格式化上下文)
>
>   在解释什么是BFC之前，我们首先需要知道Box，Formatting Context的概念

# Box:CSS布局的基本单位
Box是CSS布局的对象和基本单位，直观来说，一个页面有很多个Box组成的。元素的类型和display属性，决定了这个Box的类型，不同的Box，会参与不同的Formatting Context(一个决定如何渲染文档的容器)，因此Box内的元素会以不同的方式渲染。常见的盒子有:

* block-level box:display属性为block、list-item、table的元素，会生成block-level box
* inline-level box:display属性为inline、inline-block、inline-table的元素，会生成inline-level box
* run-in box:css3特有

# Formatting Context
Formatting  Context 是W3C CSS2.1规范中的一个概念。他是页面的一块渲染区域，并且有一套渲染规则，它决定了其子元素如何定位，以及和其他元素的关系和相互作用。最常见的Formatting Context有Block Formatting Context 和 Inline Formatting Context

# BFC布局规则
* 内部的盒子会在垂直方向一个接一个的排列
* Box垂直方向的距离由margin决定,相邻之间的margin会发生重叠
* 每个盒子(块盒与行盒)的margin box的左边相接触，即使存在浮动也是如此
* BFC的区域不会与float box重叠
* BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响外面的元素，反之也是如此
* 计算BFC的高度时，浮动元素也参与计算

# 如何创建BFC
* 根元素或其他包含根元素的元素
* 浮动元素(float 不是none)
* 绝对定位元素(元素具有position且为absolute或fixed)
* 内联块(元素具有display:table-cell,html表格单元格默认属性)
* 表格标题（元素具有display:table-caption html表格标题默认属性）
* 具有overflow且值不是visible的块元素
* 弹性盒子(display值为flex或者inline-flex)
* display:flow-opt
* column-span:all

# BFC的作用
* 利用BFC避免margin重叠
* 自适应两栏布局
* 清除浮动