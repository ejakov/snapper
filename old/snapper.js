class BasePosition {
    constructor() {}

    save() {
        this.scrollX = window.scrollX;
        this.scrollY = window.scrollY;
    }

    restore() {
        window.scrollTo(this.scrollX, this.scrollY);
    }
}

class ContentSize {
    constructor(padding = 200) {
        this.padding = padding;
        this.fullWidth = this._getMaxSize('Width');
        this.fullHeight = this._getMaxSize('Height');

        let width = window.innerWidth;
        this.fullWidth = this.fullWidth <= width + 1 ? width : this.fullWidth;
    }
    getScopes() {
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let height = windowHeight - (windowHeight > this.padding ? this.padding : 0);
        let width = windowWidth;
        let heightLength = Math.ceil(this.fullHeight / height);
        let widthLength = Math.ceil(this.fullWidth / width);
        let results = [];
        Array(heightLength)
            .join(',')
            .split(',')
            .forEach((_, heightIndex) => {
                Array(widthLength)
                    .join(',')
                    .split(',')
                    .forEach((_, widthIndex) => {
                        results.push([width * widthIndex, height * heightIndex]);
                    });
            });
        return results;
    }
    _getMaxSize(type) {
        return Math.max(
            document.documentElement[`client${type}`],
            document.body[`scroll${type}`],
            document.documentElement[`scroll${type}`],
            document.body[`offset${type}`],
            document.documentElement[`offset${type}`]
        );
    }

    getFullSize() {
        return {
            width: this.fullWidth,
            height: this.fullHeight,
        };
    }
}

class Scroller {
    constructor() {
        this.basePosition = new BasePosition();
        this.basePosition.save();

        let contentSize = new ContentSize();
        this.scopes = contentSize.getScopes();
        this.contentFullSize = contentSize.getFullSize();

        this.originalOverflow = document.documentElement.style.overflow;
    }
    doScroll(index) {
        let scope = this.scopes[index];
        if (!scope) {
            return;
        }
        document.documentElement.style.overflow = this.originalOverflow;
        window.scrollTo(scope[0], scope[1]);
        document.documentElement.style.overflow = 'hidden';
        return { left: window.scrollX, top: window.scrollY };
    }
    getContentFullSize() {
        let { width, height } = this.contentFullSize;
        return { width, height };
    }
    getScopeSize() {
        let length = this.scopes.length;
        return length;
    }
    destroy() {
        document.documentElement.style.overflow = this.originalOverflow;
        this.basePosition.restore();
    }
}

let scroller = null;
chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    switch (msg.type) {
        case 'init': {
            scroller = new Scroller();
            sendResponse({
                type: 'initialized',
                fullSize: scroller.getContentFullSize(),
                maxIdx: scroller.getScopeSize(),
                devicePixelRatio: window.devicePixelRatio || 1,
            });
            break;
        }
        case 'scroll': {
            let idx = msg.idx;
            let result = scroller.doScroll(idx);
            sendResponse({
                type: 'scrollResult',
                left: result.left,
                top: result.top,
            });
            break;
        }
        case 'done': {
            scroller.destroy();
            scroller = null;
            sendResponse({
                type: 'doneResult',
                success: true,
            });
            break;
        }
    }
});
