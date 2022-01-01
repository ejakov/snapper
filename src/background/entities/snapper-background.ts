import { ScreenSize, InitMessage, ScrollPosition } from '../../common/interfaces';
import Utils from '../../common/utils';

export default class BackgroundSnapper {
    private _tab!: chrome.tabs.Tab;
    private tabId: number = -1;
    private windowId: number = -1;
    private pixelRatio!: number;
    private fullScreenSize!: ScreenSize;
    //private maxScrollPages!: number;
    private context!: CanvasRenderingContext2D;
    private initialized: boolean = false;
    private currentScrollPos!: ScrollPosition;
    constructor(
        private _defaultImagePrefix: string = 'default',
        private canvas: HTMLCanvasElement = document.createElement('canvas')
    ) {}

    async initialize() {
        this.initialized = false;
        this._tab = await this._getCurrentTab(); // Get current tab
        if (this._tab.id !== undefined && this._tab.id !== null) {
            this.tabId = this._tab.id;
        } else {
            throw 'Failed to read tab id for active tab';
        }

        if (this._tab.windowId !== undefined && this._tab.windowId !== null) {
            this.windowId = this._tab.windowId;
        } else {
            throw 'Failed to read window id for active tab';
        }

        let init_response: InitMessage = await new Promise((res, rej) => {
            chrome.tabs.sendMessage(this.tabId, { type: 'init' }, (response) => res(response));
        });

        // Store the init response so we could use it later
        this.pixelRatio = init_response.devicePixelRatio;
        //this.maxScrollPages = init_response.maxScrollPages;
        this.fullScreenSize = init_response.fullScreenSize;

        // Set canvas size now that we know the pixel ration and screen size
        this.canvas.width = this.fullScreenSize.width / (1 / this.pixelRatio);
        this.canvas.height = this.fullScreenSize.height / (1 / this.pixelRatio);

        // Get the context so we could draw on
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.initialized = true;
    }

    async takeSnapshot() {
        if (!this.initialize) {
            throw 'snapper needs to be initialized first';
        }

        // We have initialized the class, now we can scroll, take snapshots and build the canvas for download
        while (await this._doScroll()) {
            await Utils.doWait(200);
            await this._takeSnapshot();
        }

        let prefix = await this._markDone();
        await this._downloadImage(prefix);
    }

    private async _getCurrentTab(): Promise<chrome.tabs.Tab> {
        return new Promise((res) => {
            chrome.tabs.query(
                {
                    active: true,
                    currentWindow: true,
                },
                (tabs) => {
                    res(tabs[0]);
                }
            );
        });
    }

    private async _doScroll(): Promise<boolean> {
        this.currentScrollPos = await new Promise((res) => {
            chrome.tabs.sendMessage(this.tabId, { type: 'scroll' }, (response) => res(response));
        });
        return this.currentScrollPos.left !== -1 && this.currentScrollPos.top !== -1;
    }

    private async _markDone(): Promise<string> {
        return new Promise((res) => {
            chrome.tabs.sendMessage(this.tabId, { type: 'done' }, (response) => res(response));
        });
    }

    private async _downloadImage(prefix: string) {
        var link = document.createElement('a');
        link.download = `${prefix || this._defaultImagePrefix}_${new Date().toJSON()}.png`; // "download.png";
        link.href = this.canvas.toDataURL();
        console.log(link.href);
        link.click();
    }

    private _calcSizeRatio(size: number) {
        return size / (1 / this.pixelRatio);
    }

    private async _focusWindow(): Promise<void> {
        return new Promise((res) => {
            chrome.windows.update(
                this.windowId,
                {
                    focused: true,
                },
                () => res()
            );
        });
    }

    private async _activateTab(): Promise<void> {
        return new Promise((res) => {
            chrome.tabs.update(
                this.tabId,
                {
                    active: true,
                },
                () => res()
            );
        });
    }

    private async _captureVisibleTab(): Promise<void> {
        return new Promise((res) => {
            chrome.tabs.captureVisibleTab(
                this.windowId,
                {
                    format: 'png',
                    quality: 100,
                },
                (data) => {
                    var image = new Image();
                    image.onload = () => {
                        this.context.drawImage(
                            image,
                            Math.ceil(this._calcSizeRatio(this.currentScrollPos.left)),
                            Math.ceil(this._calcSizeRatio(this.currentScrollPos.top))
                        );
                        res(undefined);
                    };
                    image.src = data;
                }
            );
        });
    }
    private async _takeSnapshot(): Promise<void> {
        await this._focusWindow();
        await this._activateTab();
        await this._captureVisibleTab();
    }
}
