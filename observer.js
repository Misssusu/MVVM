import { Dep } from "./watcher";

class Observer {
    constructor(data) {
        this.observe(data)
    }
    observe(data) {
        // 将data数据原有的属性改为set和get形式
        if(data && typeof data === 'object') {
            // 获取到data的key和value
            let keys = Object.keys(data);
            keys.forEach(key => {
                this.defineReactive(data, key, data[key])
                // 深度递归劫持
                this.observe(data[key])
            })
        }
    }
    // 定义响应式
    defineReactive(obj, key, value) {
        // 递归遍历，直到最后一个值不是对象
        let dep = new Dep();   // 给每个属性都加上发布订阅的功能，这样数据发生改变只会执行对应的watcher，而不是执行所有的watcher
        Object.defineProperty(obj, key, {
            enumerable: true,   //可枚举
            configurable: true,  //可删除
            get() {
                Dep.target && dep.addSub(Dep.target)   // 收集所有的watcher
                return value
            },
            set:(newValue) => {
                if(value !== newValue) {
                    value = newValue
                    this.observe(value)  // 如果是对象，继续劫持
                    dep.notify()
                }
            }
        })
    }
}

export default Observer