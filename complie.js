import { Watcher, Dep } from "./watcher";

class Complie {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        if(this.el) {
            // 如果元素能获取到才进行编译
            // 1. 先将真实的DOM移入到内存中 fragment
            let fragment = this.node2fragment(this.el)
            // 2. 编译，提取想要的元素节点 v-model 和文本节点 {{}}
            this.complie(fragment)
            // 3. 把编译好的fragment放到页面中去
            this.el.appendChild(fragment);
        }
    }
    isElementNode(node) {
        // 判断是否是元素节点
        return node.nodeType === 1;
    }
    node2fragment(el) {
        // 将el中的全部内容放到内存中
        let fragment = document.createDocumentFragment();
        let firstChild;
        while(firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment;
    }
    isDirective(name) {
        // 判断是否为指令
        return name.includes('v-');
    }
    complieElement(node) {
        let attrs = node.attributes;   // 获取元素的属性
        Array.from(attrs).forEach(attr => {
            let attrName = attr.name;  //?
            // 判断属性名字是否包含'v-'
            if(this.isDirective(attrName)){
                let expr = attr.value;  //?
                let [, directive] = attrName.split('-')  // v-model
                let [directiveName, eventName] = directive.split(':')   //  v-on:click
                this.ComplieUtil[directiveName](node, this.vm, expr, eventName)
            }
        })

    }
    complieText(node) {
        // 解析出{{}}中的值
        let expr = node.textContent;  // 取文本中的内容
        let reg = /\{\{([^}]+)\}\}/  // 匹配到{{}}
        if(reg.test(expr)) {
            this.ComplieUtil['text'](node, this.vm, expr)
        }
    }
    complie(fragment) {
        // 使用递归的形式解析
        let childNode = fragment.childNodes;
        Array.from(childNode).forEach(node => {
            if(this.isElementNode(node)) {
                // 元素节点，继续检查
                this.complie(node)
                this.complieElement(node)
            }else {
                // 文本节点
                this.complieText(node)
            }
        })
    }
    ComplieUtil = {
        getVal(vm, expr) {    // 获取实例上对应的数据
            expr = expr.split('.');   //[a,b,c]
            return expr.reduce((data, current) => {
                return data[current]
            }, vm.$data)
        },
        setVal(vm, expr, value) {   // 更新实例上对应的数据 obj.name
            expr = expr.split('.');  // [obj,name]
            console.log(expr);
            expr.reduce((data, current, index, arr) => {
                if(index === arr.length - 1) {
                    data[current] = value
                }
                return data[current]
            },vm.$data)
        },
        getContentValue(vm, expr) {  // 遍历表达式,将内容重新替换成一个完整内容返还回去。文本中的内容(及表达式)有可能是 {{a}} {{b}} {{c}}
            return expr.replace(/\{\{([^}]+)\}\}/g, (...arg)=>{
                return this.getVal(vm, arg[1])
            })
        },
        text(node, vm, expr) {   //文本处理 {{a.b.c}}
            let updateFn = this.updater['textUpdater'];
            let content = expr.replace(/\{\{([^}]+)\}\}/g, (...arg)=>{
                new Watcher(vm, arg[1], ()=>{    // 更新视图
                    updateFn(node, this.getContentValue(vm, expr))   // 返回整个字符串
                })
                return this.getVal(vm, arg[1])
            })
            updateFn && updateFn(node, content);   //有对应的指令才进行处理
        },
        model(node, vm, expr) {  //输入框处理 v-model='a.b.c'
            let updateFn = this.updater['modelUpdater'];
            new Watcher(vm, expr, (newValue)=>{    // 将输入框添加一个观察者，更新视图
                updateFn(node, newValue)
            })
            updateFn && updateFn(node, this.getVal(vm, expr))
            node.addEventListener('input',(e)=>{
                let value = e.target.value;
                this.setVal(vm, expr, value)
            })
        },
        on(node, vm, expr, eventName) {
            node.addEventListener(eventName, (e)=>{
                vm[expr].call(vm, e)
            })
        },
        updater: {
            textUpdater(node, value) {
                node.textContent = value;
            },
            modelUpdater(node, value) {
                node.value = value;
            }
        }
    }
}
export default Complie