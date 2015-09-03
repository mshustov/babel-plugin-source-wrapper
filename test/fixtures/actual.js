function A(){return 1;}

var b = function(){return 2;};

var obj = {
    one: 1,
    two: 2,
    getCtx: function() {
        return this;
    },
    getOne: function() {
        return this.one;
    }
};

var res = obj.getCtx().getOne();

console.log(res);

var zz = obj.one;

[1,2,3];

new A();

var obj2 = {
    method: (function c(){ return function d(){return 14;}})()
};

obj2.method();
