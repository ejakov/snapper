import { Scope } from '../../common/interfaces';

export default class ContentSize {
    private fullWidth: number;
    private fullHeight: number;
    constructor() {
        this.fullWidth = this._getMaxWidth();
        this.fullHeight = this._getMaxHeight();
        this.fullWidth = this.fullWidth <= window.innerWidth + 1 ? window.innerWidth : this.fullWidth;
    }

    getScopes(): Scope[] {
        let heightLength = Math.ceil(this.fullHeight / window.innerHeight);
        let widthLength = Math.ceil(this.fullWidth / window.innerWidth);
        let results: Scope[] = [];
        for (let heightIdx = 0; heightIdx < heightLength; ++heightIdx) {
            for (let widthIdx = 0; widthIdx < widthLength; ++widthIdx) {
                results.push({
                    left: window.innerWidth * widthIdx,
                    top: window.innerHeight * heightIdx,
                });
            }
        }
        return results;
    }

    _getMaxWidth() {
        return Math.max(
            document.documentElement.clientWidth,
            document.body.scrollWidth,
            document.documentElement.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.offsetWidth
        );
    }

    _getMaxHeight() {
        return Math.max(
            document.documentElement.clientHeight,
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
        );
    }

    getFullSize() {
        return {
            width: this.fullWidth,
            height: this.fullHeight,
        };
    }
}
