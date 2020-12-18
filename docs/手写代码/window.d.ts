declare interface Function {
 _call(context: { fn?: Function }, ...args: any): any;

 _apply(context: { fn?: Function }, args: any[]): any;

 _bind(context: { fn: Function }, ...args: any): (...args: any) => any;
}

declare interface Window {
 fn: Function;
}

declare interface Object {
 __proto__: Object | null;
}