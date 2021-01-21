import Complie from './complie.js';
import Observer from "./observer";

class MVVM {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data();
        this.computed = options.computed;
        this.methods = options.methods;
        // 如果有data才进行数据劫持
        if(this.$data) {
            new Observer(this.$data)
            // 添加computed
            //1.遍历computed的属性
            //2. 将computed的属性通过Object.defineProperty依次添加到vm上，在访问的时候调用属性对应的方法从而获取到值
            this.addComputed(this.computed)
            this.addMethods(this.methods)
            // vm代理
            console.log(this.$data);
            this.proxyVm(this.$data)
        }
        // 如果有要编译的模板才开始编译
        if(this.$el) {
            new Complie(this.$el, this)
        }

    }
    proxyVm(data) {
        for(let key in data) {
            Object.defineProperty(this, key, {
                get() {
                    return data[key]
                },
                set(newValue) {
                    data[key] = newValue
                }
            })
        }
    }
    addComputed(computed) {
        for(let key in computed) {
            Object.defineProperty(this.$data, key, {
                enumerable: true,   //可枚举
                get:() => {
                    return computed[key].call(this)
                }
            })
        }
    }
    addMethods(methods) {
        console.log(methods);
        for(let key in methods) {
            Object.defineProperty(this.$data, key, {
                enumerable: true,
                get() {
                    return methods[key]
                }
            })
        }
    }
}

export default MVVM