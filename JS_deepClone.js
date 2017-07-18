
//1.下面的方法，是给Object的原型(prototype)添加深度复制方法(deep clone)。
Object.prototype.clone = function() {
    // Handle null or undefined or function
    if (null == this || "object" != typeof this)
        return this;
    // Handle the 3 simple types, Number and String and Boolean
    if(this instanceof Number || this instanceof String || this instanceof Boolean)
        return this.valueOf();
    // Handle Date
    if (this instanceof Date) {
        var copy = new Date();
        copy.setTime(this.getTime());
        return copy;
    }
    // Handle Array or Object
    if (this instanceof Object || this instanceof Array) {
        var copy = (this instanceof Array)?[]:{};
        for (var attr in this) {
            if (this.hasOwnProperty(attr))
                copy[attr] = this[attr]?this[attr].clone():this[attr];
        }
        return copy;
    }
    throw new Error("Unable to clone obj! Its type isn't supported.");
}

//2.使用额外的工具函数实现，适用于大部分对象的深度复制(Deep Clone)。
function clone(obj) {
    // Handle the 3 simple types, and null or undefined or function
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    // Handle Array or Object
    if (obj instanceof Array | obj instanceof Object) {
        var copy = (obj instanceof Array)?[]:{};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr))
              copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to clone obj! Its type isn't supported.");
}
