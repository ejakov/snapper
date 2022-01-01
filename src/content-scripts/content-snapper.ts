import { iMsg } from '../common/interfaces';
import Scroller from './entities/scroller';

(() => {
    class Main {
        private scroller!: Scroller;
        constructor() {}
        handleMessage(msg: iMsg, response: any) {
            switch (msg.type) {
                case 'init': {
                    response(this._handleInit());
                    break;
                }
                case 'scroll': {
                    response(this._handleScroll());
                    break;
                }
                case 'done': {
                    response(this._handleDone());
                    break;
                }
            }
        }

        private _handleInit() {
            this.scroller = new Scroller();
            return {
                type: 'initResult',
                fullScreenSize: this.scroller.getContentFullSize(),
                devicePixelRatio: window.devicePixelRatio || 1,
            };
        }

        private _handleScroll() {
            let result = this.scroller.doScroll();
            return {
                type: 'scrollResult',
                left: result.left,
                top: result.top,
            };
        }

        private _handleDone() {
            this.scroller.destroy();
        }
    }

    let main = new Main();
    chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
        main.handleMessage(msg as iMsg, sendResponse);
    });
})();
