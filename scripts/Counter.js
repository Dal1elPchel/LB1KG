export class Counter {
    #count = 0;
    constructor(domCounter, count = 0) {
        this.$counter = domCounter;
        this.count = count;
    }

    set count(value) {
        if (value >= 0) {
            this.#count = value;
            this.render();
        }
    }

    get count() {
        return this.#count;
    }

    reload() {
        this.count = 0;
    }

    render() {
        this.$counter.innerText = `${this.#count}`;
    }
}