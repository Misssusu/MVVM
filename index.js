import MVVM from './mvvm'

window.vm = new MVVM({
    el: '#app',
    data() {
        return {
            message: 'hello',
            msg: '搜索',
            obj: {
                name: 'suyuan',
                sex: 'woman'
            },
            num: 1
        }
    },
    computed: {
        tipMsg() {
            return this.message + 'everyone'
        }
    },
    methods: {
        addNum(e) {
            console.log(e);
            console.log(this.num);
            return this.num++
        }
    }
})