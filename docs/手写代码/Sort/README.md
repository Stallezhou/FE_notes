# 排序算法详解

## 前言

在我们日常的开发中，排序是一个很普遍而且很常见的问题。今天，我们就来看一下各种排序算法的差异以及比较好的写法。

## 冒泡排序 

>冒泡排序:它重复地走访过要排序的元素列，依次比较两个相邻的元素，如果顺序（如从大到小、首字母从Z到A）错误就把他们交换过来。走访元素的工作是重复地进行直到没有相邻元素需要交换，也就是说该元素列已经排序完成。

### 算法原理

冒泡排序原理如下:
1. 相邻比较两个元素,如果前面的比后面的大,就将他们进行交换。
2. 对每一对相邻的元素做同样的工作,从开始的一对一直到结尾的一对。结束后，最后的元素应该是最大的元素
3. 针对所有的元素重复1,2的步骤，除了最后一个
4. 持续每次对越来越少的元素重复上面的步骤，直到没有任何一对数字需要比较

冒泡排序流程如下:
![](http://img.stallezhou.cn/blog/sort_2.svg)

### 算法分析

#### 时间复杂度

若数组的初始状态是正序的，一趟扫描即可完成排序。所需的关键字比较次数C和记录移动次数M均达到最小值:
C_min = n-1,M_min = 0 ,
所以此时冒泡排序最快的时间复杂度为O(n)。
若初始状态是反序的，需要进行n-1趟排序，每趟需要n-i次关键字的比较(1<=i<=n-1)，且每次移动都必须移动三次来达到交换位置的目的。在这种情况下，比较和移动均达到最大值:
C_max = n(n-1)/2 = O(n^2),M_max = 3n(n-1)/2=O(n^2)。
所以此时冒泡排序最慢的时间复杂度为O(n^2)。

#### 稳定性

冒泡排序就是把小的元素往前调或者把大的元素往后调。比较是相邻的两个元素比较，交换也发生在这两个元素之间。所以，如果两个元素相等，是不会再交换的；如果两个相等的元素没有相邻，那么即使通过前面的两两交换把两个相邻起来，这时候也不会交换，所以相同元素的前后顺序并没有改变，所以冒泡排序是一种稳定排序算法。

### 算法实现

```js
function bubbleSort(arr){
 const n = arr.length
 if(!n)return []
 for(let i=0;i<n;i++){
 for(let j=0;j<n-i-1;j++){
  if(arr[j]>arr[j+1]){
   let temp = arr[j+1]
   arr[j+1] = arr[j]
   arr[j] = temp
   }
  }
 }
 return arr
}
```
### 算法优化
1.单向冒泡

>标记在一轮比较汇总中，如果没有需要交换的数据，说明数组已经是有序的，可以减少排序循环的次数。

```js
function bubbleSort(arr) {
  const n = arr.length
  if(!n) return []
  
  for(let i = 0; i < n; i++) {
    let mark = true // 如果在一轮比较中没有出现需要交换的数据，说明数组已经是有序的
    for(let j = 0; j < n - i - 1; j++) {
      if(arr[j] > arr[j + 1]) {
        let temp = arr[j + 1]
        arr[j + 1] = arr[j]
        arr[j] = temp
        mark = false
      }
    }
    if(mark) break 
  }
  
  return arr
}
```

2.双向冒泡

>普通冒泡排序一轮只找到最大值或最小值其中之一，双向冒泡则多一轮筛选，既可以找到最大值，也可以找到最小值。
```js
function bubbleSort(arr) {
  var low = 0
  var high = arr.length - 1
  while(low < high) {
    var mark = true
    // 找到最大值放在右边
    for(var i = low; i < high; i++) {
      if(arr[i] > arr[i + 1]) {
        var temp = arr[i + 1]
        arr[i + 1] = arr[i]
        arr[i] = temp
        mark = false
      }
    }
    high--
    // 找到最小值放在左边
    for(var j = high; j > low; j--) {
      if(arr[j] < arr[j - 1]) {
        var temp = arr[j - 1]
        arr[j - 1] = arr[j]
        arr[j] = temp
        mark = false
      }
    }
    low++
    if(mark) break
  }
  return arr
}
```
## 选择排序

>选择排序（Selection sort）是一种简单直观的排序算法。它的工作原理是：第一次从待排序的数据元素中选出最小（或最大）的一个元素，存放在序列的起始位置，然后再从剩余的未排序元素中寻找到最小（大）元素，然后放到已排序的序列的末尾。以此类推，直到全部待排序的数据元素的个数为零。选择排序是不稳定的排序方法


### 算法原理

1. 首先在未排序序列中找到最小(大)的元素，存放到排序序列起始位置
2. 从未排序序列中继续寻找最小(大)的元素,存放到已排序序列的末尾
3. 重复上述2步骤，直到未排序序列元素为空

### 算法分析

#### 时间复杂度

选择排序的交换操作介于 0 和 (n - 1)次之间。选择排序的比较操作为 n (n - 1） / 2 次之间。选择排序的赋值操作介于 0 和 3 (n - 1） 次之间。比较次数O(n^2），比较次数与关键字的初始状态无关，总的比较次数N=(n-1）+(n-2）+...+1=n*(n-1）/2。交换次数O(n），最好情况是，已经有序，交换0次；最坏情况交换n-1次，逆序交换n/2次。交换次数比冒泡排序少多了，由于交换所需CPU时间比比较所需的CPU时间多，n值较小时，选择排序比冒泡排序快。

#### 稳定性

选择排序是给每个位置选择当前元素最小的，比如给第一个位置选择最小的，在剩余元素里面给第二个元素选择第二小的，依次类推，直到第n-1个元素，第n个元素不用选择了，因为只剩下它一个最大的元素了。那么，在一趟选择，如果一个元素比当前元素小，而该小的元素又出现在一个和当前元素相等的元素后面，那么交换后稳定性就被破坏了。举个例子，序列5 8 5 2 9，我们知道第一遍选择第1个元素5会和2交换，那么原序列中两个5的相对前后顺序就被破坏了，所以选择排序是一个不稳定的排序算法。

### 算法实现

```js
function selectSort(list) {
  var n = list.length
  var minIndex
  
  for(var i = 0; i < n - 1; i++) {
    minIndex = i
    for(var j = i + 1; j < n; j++) {
      if(list[j] < list[minIndex]) {
        minIndex = j
      }
    }
    var temp = list[i]
		  list[i] = list[minIndex]
    list[minIndex] = temp
  }
  return list
}
```

## 插入排序

>插入排序，一般也被称为直接插入排序。对于少量元素的排序，它是一个有效的算法 [1]  。插入排序是一种最简单的排序方法，它的基本思想是将一个记录插入到已经排好序的有序表中，从而一个新的、记录数增1的有序表。在其实现过程使用双层循环，外层循环对除了第一个元素之外的所有元素，内层循环对当前元素前面有序表进行待插入位置查找，并进行移动

### 算法原理

1. 以第一个元素为初始序列
2. 依次从未选择序列中选择第一项，并插入到已排序序列中
3. 重复2步骤直到未排序序列为空

### 算法分析

#### 时间复杂度

在插入排序中，当待排序数组是有序时，是最优的情况，只需当前数跟前一个数比较一下就可以了，这时一共需要比较N- 1次，时间复杂度为O(n)。
最坏的情况是待排序数组是逆序的，此时需要比较次数最多，总次数记为：1+2+3+…+N-1，所以，插入排序最坏情况下的时间复杂度为O(n^2)。
平均来说，`A[1..j-1]`中的一半元素小于`A[j]`，一半元素大于`A[j]`。插入排序在平均情况运行时间与最坏情况运行时间一样，是输入规模的二次函数

#### 空间复杂度

插入排序的空间复杂度为常数阶O(1)

#### 稳定性

如果待排序的序列中存在两个或两个以上具有相同关键词的数据，排序后这些数据的相对次序保持不变，即它们的位置保持不变，通俗地讲，就是两个相同的数的相对顺序不会发生改变，则该算法是稳定的；如果排序后，数据的相对次序发生了变化，则该算法是不稳定的。关键词相同的数据元素将保持原有位置不变，所以该算法是稳定的。

### 算法实现

```js
function insertSort(list) {
  var n = list.length
  var preIndex
  var current
  
  for(var i = 1; i < n; i++) {
    preIndex = i - 1
    current = list[i]
    
    while(preIndex >=0 && list[preIndex] > current) {
      list[preIndex + 1] = list[preIndex]
      preIndex--
    }
    list[preIndex + 1] = current
  }
  return list
}
```

### 算法优化

1. 拆半插入
```js
function insertSort(list) {
  var low
  var high
  var j
  var temp
  for (var i = 1; i < list.length; i++) {
    if (list[i] < list[i - 1]) {
      temp = list[i]
      low = 0
      high = i - 1
      while (low <= high) {
        let mid = Math.floor((low + high) / 2)
        if (temp > list[mid]) {
          low = mid + 1
        } else {
          high = mid - 1
        }
      }
      for (j = i; j > low; --j) {
        list[j] = list[j - 1]
      }
      list[j] = temp
    }
  }
  return list
}
```

## 希尔排序

>希尔排序(Shell's Sort)是插入排序的一种又称“缩小增量排序”（Diminishing Increment Sort），是直接插入排序算法的一种更高效的改进版本。希尔排序是非稳定排序算法。

### 算法原理

1. 先取一个小于n的整数d作为一个增量。
2. 把整个数组分为以d为长度的若干个序列
3. 在各个组进行插入排序
4. 然后取第二个增量d2,重复上述步骤
5. 直到增量dn为1。

>注意:一般的初次取序列的一半为增量，以后每次减半，直到增量为1。

### 算法分析

#### 时间复杂度

希尔排序是基于插入排序的一种算法， 在此算法基础之上增加了一个新的特性，提高了效率。希尔排序的时间的时间复杂度为O(n^3/2)，希尔排序时间复杂度的下界是n*log2n。

#### 稳定性

由于多次插入排序，我们知道一次插入排序是稳定的，不会改变相同元素的相对顺序，但在不同的插入排序过程中，相同的元素可能在各自的插入排序中移动，最后其稳定性就会被打乱，所以希尔排序是不稳定的。


### 算法实现

```js
function shellSort(list) {
  var n = list.length
  var gap = parseInt(n / 2) // 初始化步数
  while(gap) { // 逐步缩小步数
    for(var i = gap; i < n; i++) {
      // 逐步和前面其他成员比较交换
      for(var j = i - gap; j >=0; j -= gap) {
        if(list[j] > list[j + gap]) {
          var temp = list[j + gap]
          list[j + gap] = list[j]
          list[j] = temp
        } else {
          break
        }
      }
    }
    gap = parseInt(gap / 2)
  }
}
```

## 归并排序


>归并排序（Merge Sort）是建立在归并操作上的一种有效，稳定的排序算法，该算法是采用分治法（Divide and Conquer）的一个非常典型的应用。将已有序的子序列合并，得到完全有序的序列；即先使每个子序列有序，再使子序列段间有序。若将两个有序表合并成一个有序表，称为二路归并。

### 算法原理

1. 申请空间，使其大小为两个已经排序序列之和，该空间用来存放合并后的序列
2. 设定两个指针，最初位置分别为两个已经排序序列的起始位置
3. 比较两个指针所指向的元素，选择相对小的元素放入到合并空间，并移动指针到下一位置
4. 重复步骤3直到某一指针超出序列尾
5. 将另一序列剩下的所有元素直接复制到合并序列尾

### 算法分析


#### 时间复杂度

由于需要递归比较排序。时间复杂度为O(nlogN)


#### 稳定性

由于排序过程中每次都基于上次已经处理好的结果进行。因此是稳定的。


### 算法实现

```js
function mergeSort(list) {
  var n = list.length
  if(n < 2) return list
  
  var mid = Math.floor(n / 2)
  var left = list.slice(0, mid)
  var right = list.slice(mid)
  
  return merge(mergeSort(left), mergeSort(right))
}

function merge(left, right) {
  var result = []
  while(left.length && right.length) {
    if(left[0] <= right[0]) {
      result.push(left.shift())
    } else {
      result.push(right.shift())
    }
  }
  while(left.length) {
    result.push(left.shift())
  }
  while(right.length) {
    result.push(right.shift())
  }
  return result
}
```

## 快速排序

>快速排序（Quicksort）是对冒泡排序的一种改进

###  算法原理

1. 选择一个数作为基数
2. 将序列中每一个元素依次与基数比较。比基数大的放在它右边，比基数小的放在它左边。
3. 对基数左右两边的序列重复上述1.2步骤
4. 重复上述步骤直至没有元素可排


### 算法分析

#### 时间复杂度

快速排序的一次划分算法从两头交替搜索，直到low和hight重合，因此其时间复杂度是O(n)；而整个快速排序算法的时间复杂度与划分的趟数有关。理想的情况是，每次划分所选择的中间数恰好将当前序列几乎等分，经过log2n趟划分，便可得到长度为1的子表。这样，整个算法的时间复杂度为O(nlog2n)。最坏的情况是，每次所选的中间数是当前序列中的最大或最小元素，这使得每次划分所得的子表中一个为空表，另一子表的长度为原表的长度-1。这样，长度为n的数据表的快速排序需要经过n趟划分，使得整个排序算法的时间复杂度为O(n2)。为改善最坏情况下的时间性能，可采用其他方法选取中间数。通常采用“三者值取中”方法，即比较H->r[low].key、H->r[high].key与H->r[(low+high)/2].key，取三者中关键字为中值的元素为中间数。可以证明，快速排序的平均时间复杂度也是O(nlog2n)

#### 稳定性

因为会存在相同的值进行比较，因此会出现相同值无法按照固定顺序进行相同排列，因此是不稳定的。

### 算法实现

```js
// 实现1
function quickSort(list) {
  var n = list.length
  if(n <= 1) return list
  
  var pivotIndex = Math.floor(n / 2)
  var pivot = list[pivotIndex]
  var left = []
  var right = []
  
  for(var i = 0; i < n; i++) {
    if(i === pivotIndex) continue
    if(list[i] < pivot) {
      left.push(list[i])
    } else {
      right.push(list[i])
    }
  }
  
  return quickSort(left).concat(quickSort(right))
}
// 实现2
function quickSort(list, left = 0, right = list.length - 1) {
  var n = list.length
	if(left < right) {
    var index = left - 1
    for(var i = left; i <= right; i++) {
      if(list[i] <= list[right]) {
        index++
        var temp = list[index]
        list[index] = list[i]
        list[i] = temp
      }
    }
    quickSort(list, left, index - 1)
    quickSort(list, index + 1, right)
  }
  
  return list
}
```
## 堆排序

>堆排序（英语：Heapsort）是指利用堆这种数据结构所设计的一种排序算法。堆是一个近似完全二叉树的结构，并同时满足堆积的性质：即子结点的键值或索引总是小于>（或者大于）它的父节点。在实际应用中，堆又可以分为最小堆和最大堆，两者区别如下：
> * -max-heap property：对于所有除了根节点的节点i，A[Parent(i)] >= A[i]
> * -min-heap property：对于除了根节点的节点i，A[Parent(i)] <= A[i]
> 堆排序可以说是一种利用堆的概念来排序的选择排序，分为两种方法：
> * 大顶堆：每个节点的值都大于或等于其子节点的值，在堆排序算法中用于升序排序；
> * 小顶堆：每个节点的值都小于或等于其子节点的值，在堆排序算法中用于降序排序。


### 算法原理

堆排序的原理就是借用`堆`这种数据结构本身的特殊属性来进行排序


### 算法实现

```js
function heapSort(list) {
  buildHeap(list) 
  // 循环 n-1 次，每次循环后交换堆顶元素和堆底元素并重新调整堆结构
  for(var i = list.length - 1; i > 0; i--) {
    [nums[i], nums[0]] = [nums[0], nums[i]]
    adjustHeap(nums, 0, i)
  }
  return list
}

function buildHeap(nums) {
  // 注意这里的头节点是从0开始的，所以最后一个非叶子节点结果是 parseInt(nums.length / 2) - 1
  var start = parseInt(nums.length / 2) - 1
  var size = nums.length
  // 从最后一个非叶子节点开始调整，直至堆顶
  for(var i = start; i >= 0; i--) {
    adjustHeap(nums, i, size)
  }
}

function adjustHeap(nums, index, size) {
  // 交换后可能会破坏堆结构，需要循环使得每一个父节点都大于左右节点
  while(true) {
    var max = index
    var left = index * 2 + 1 // 左节点
    var right = index * 2 + 2 // 右节点
    if(left < size && nums[max] < nums[left]) max = left
    if(right < size && nums[max] < nums[right]) max = right
    // 如果左右节点大雨当前节点则交换，并在循环一遍判断交换后是否破坏堆结构
    if(index !== max) {
      [nums[index], nums[max]] = [nums[max], nums[index]]
      index = max
    } else {
      break
    }
  }
}
```

## 计数排序

>计数排序是一个非基于比较的排序算法，该算法于1954年由 Harold H. Seward 提出。它的优势在于在对一定范围内的整数排序时，它的复杂度为Ο(n+k)（其中k是整数的范围），快于任何比较排序算法。 [1]  当然这是一种牺牲空间换取时间的做法，而且当O(k)>O(nlog(n))的时候其效率反而不如基于比较的排序（基于比较的排序的时间复杂度在理论上的下限是O(nlog(n)), 如归并排序，堆排序）

### 算法原理

以数组元素值为键，出现次数为值存进一个临时数组，最后再遍历这个临时数组还原回原数组。因为 JS 的数组下标是以字符串形式存储的，所以计数排序可以用来排列负数，但是不可以排列小数。

### 算法实现

```js
function countingSort(nums) {
  var list = []
  var max = Math.max(...nums)
  var min = Math.min(...nums)
  
  for(var i = 0; i < nums.length; i++) {
    var temp = nums[i]
    list[temp] = list[temp] + 1 || 1
  }
  
  var index = 0
  for(var i = min; i <= max; i++) {
    while(list[i] > 0) {
      nums[index++] = i
      list[i]--
    }
  }
  
  return list
}
```
## 桶排序

>桶排序 (Bucket sort)或所谓的箱排序，是一个排序算法，工作的原理是将数组分到有限数量的桶子里。每个桶子再个别排序（有可能再使用别的排序算法或是以递归方式继续使用桶排序进行排序）。桶排序是鸽巢排序的一种归纳结果。当要被排序的数组内的数值是均匀分配的时候，桶排序使用线性时间（Θ（n））。但桶排序并不是 比较排序，他不受到 O(n log n) 下限的影响。


### 算法原理

>取 n 个桶，根据数组的最大值和最小值确认每个桶存放的数的区间，将元素插入到相应的桶里，最后再合并各个桶。
>
>桶排序是计数排序的升级版。它利用了函数的映射关系，高效与否的关键就在于这个映射函数的确定。 为了使桶排序更加高效，我们需要做到这两点：
>* 在额外空间充足的情况下，尽量增大桶的数量。
>* 使用的映射函数能够将输入的N个数据均匀的分配到K个桶中。

### 算法实现

```js
function bucketSort(nums) {
  // 桶的个数，只要是正数都行
  var num = 5
  var max = Math.max(...nums)
  var min = Math.min(...nums)
  // 计算每个桶存放的数值范围，至少为 1
  var range = Math.ceil((max - min) / num) || 1
  // 创建二维数组，第一维表示第几个桶，第二维表示桶里放的数
	var arr = Array.from(Array(num)).map(() => Array().fill(0))
  nums.forEach(val => {
  	// 计算元素应该分布在哪个桶
   	let index = parseInt((val - min) / range);
    // 防止index越界，例如当[5,1,1,2,0,0]时index会出现5
    index = index >= num ? num - 1 : index;
    let temp = arr[index];
    // 插入排序，将元素有序插入到桶中
    let j = temp.length - 1;
    while (j >= 0 && val < temp[j]) {
    	temp[j + 1] = temp[j];
      j--;
    }
    temp[j + 1] = val;
	});
  // 修改回原数组
  var res = [].concat.apply([], arr);
  nums.forEach((val, i) => {
  	nums[i] = res[i];
  });
  return nums;
}
```
## 基数排序

>基数排序（radix sort）属于“分配式排序”（distribution sort），又称“桶子法”（bucket sort）或bin sort，顾名思义，它是透过键值的部份资讯，将要排序的元素分配至某些“桶”中，藉以达到排序的作用，基数排序法是属于稳定性的排序，其时间复杂度为O (nlog(r)m)，其中r为所采取的基数，而m为堆数，在某些时候，基数排序法的效率高于其它的稳定性排序法。

### 算法原理

使用十个桶 0-9，把每个数从低位到高位根据位数放到相应的桶里，以此循环最大值的位数次。但只能排列正整数，因为遇到负号和小数点无法进行比较。

基数排序有两种方法：

* MSD 从高位开始进行排序
* LSD 从低位开始进行排序
基数排序 vs 计数排序 vs 桶排序：
这三种排序算法都利用了桶的概念，但对桶的使用方法上有明显差异：
* 基数排序：根据键值的每位数字来分配桶
* 计数排序：每个桶只存储单一键值
* 桶排序：每个桶存储一定范围的数值

### 算法实现

```js
function radixSort(nums) {
  // 计算位数
  function getDigits(n) {
  	var sum = 0;
    while (n) {
    	sum++;
      n = parseInt(n / 10);
    }
    return sum;
  }
  // 第一维表示位数即0-9，第二维表示里面存放的值
  var arr = Array.from(Array(10)).map(() => Array());
  var max = Math.max(...nums);
  var maxDigits = getDigits(max);
  for (var i = 0, len = nums.length; i < len; i++) {
  	// 用0把每一个数都填充成相同的位数
    nums[i] = (nums[i] + '').padStart(maxDigits, 0);
    // 先根据个位数把每一个数放到相应的桶里
    var temp = nums[i][nums[i].length - 1];
    arr[temp].push(nums[i]);
  }
  // 循环判断每个位数
  for (var i = maxDigits - 2; i >= 0; i--) {
  	// 循环每一个桶
    for (var j = 0; j <= 9; j++) {
    	var temp = arr[j]
      var len = temp.length;
      // 根据当前的位数i把桶里的数放到相应的桶里
      	while (len--) {
          var str = temp[0];
          temp.shift();
          arr[str[i]].push(str);
       	}
      }
    }
    // 修改回原数组
    var res = [].concat.apply([], arr);
    nums.forEach((val, index) => {
    	nums[index] = +res[index];
    });
    return nums;
}
```

## 算法比较

![](http://img.stallezhou.cn/blog/sort_3.png)


## 小结

我们通过本篇文章了解了10种排序算法，并对各个算法进行来基础实现
