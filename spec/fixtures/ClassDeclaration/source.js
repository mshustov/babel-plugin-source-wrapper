class Foo {
    constructor() {
        this.foo = 123;
    }
}

class Foo2 extends Foo {
    constructor() {
        super();
    }
}

export class Bar {
    constructor() {
        this.bar = 123;
    }
}

export class Bar2 extends Bar {
    constructor() {
        super();
    }
}
