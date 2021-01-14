function deepClone<T>(data: any): T {
 const isObject = (v: any): boolean => Object.prototype.toString.call(v).slice(8, -1) === 'Object'
 if (!isObject(data)) {
  throw new TypeError('非对象')
 }
 let isArray = (v: any): boolean => Array.isArray(data)
 let newObj:any = isArray(data)?[...data]:{...data}
 Reflect.ownKeys(newObj).forEach(key => {
  newObj[key] = isObject(data[key]) ? deepClone(data[key]) : data[key]
 })
 return newObj as T
}