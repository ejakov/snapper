export default class CurrentPosition {
    private scrollX: number;
    private scrollY: number;
    constructor() {
        this.scrollX = window.scrollX;
        this.scrollY = window.scrollY;
    }

    restore() {
        window.scrollTo(this.scrollX, this.scrollY);
    }
}
