class Watcher{
    constructor(vm, expr, cd) {
        this.vm = vm;
        this.expr = expr;
        this.cd = cd;
        this.get();
    }
    get() {
        Dep.target = this;   // 将watcher实例绑定到Dep.target属性上
        this.oldValue = this.getVal(this.vm, this.expr);
        Dep.target = null;
    }
    update() {   // 更新操作
        let newValue = this.getVal(this.vm, this.expr);
        if(this.oldValue !== newValue) {
            this.cd(newValue)
        }
    }
    getVal(vm, expr) {    // 获取实例上对应的数据
        expr = expr.split('.');   //[a,b,c] [a]
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    }
}

class Dep{
    constructor() {
        this.subs = []
    }
    addSub(watcher) {    //订阅
        this.subs.push(watcher)
    }
    notify() {     //发布
        this.subs.forEach(watcher => {
            watcher.update()
        })
    }
}

export { Watcher, Dep }
