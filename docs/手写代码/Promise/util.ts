// 判断类
const isObject = (val:any)=>{
 return val !== null && typeof val === 'object'
};

const isFunction  = (val:any)=>{
 return toString.call(val) === '[object Function]'
}

const isObjectORisFunction = (val:any)=>{
  return isFunction(val) || isObject(val)
}

// 错误类


const constructorError = () => {
 throw new TypeError(
   "Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function."
 );
};

const resolverError = () => {
 throw new TypeError(
   'You must pass a resolver function as the first argument to the promise constructor'
 );
};

const resolveSelfError = () => {
 return new TypeError('You cannot resolve a promise with itself');
};

const cannotReturnOwn = () => {
 return new TypeError('A promises callback cannot return that same promise.');
};

const validationError = () => {
 return new Error('Array Methods must be provided an Array');
};



// 常量类


const TRY_CATCH_ERROR = { error: null };

const PROMISE_STATUS = {
  pending: 0,
  fulfilled: 1,
  rejected: 2
};

const PROMISE_ID = Math.random()
  .toString(36)
  .substring(2);

export {
 isObject,
 isFunction,
 isObjectORisFunction,
 constructorError,
 resolverError,
 resolveSelfError,
 cannotReturnOwn,
 validationError,
 TRY_CATCH_ERROR, 
 PROMISE_STATUS, 
 PROMISE_ID
}