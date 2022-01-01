import { Scope } from '../../common/interfaces';
import CurrentPosition from './current-position';
import ContentSize from './page-content-size';

export default class Scroller {
    private currentPosition: CurrentPosition;
    private pageContentSize: ContentSize;
    private scopes: Scope[];
    private currentOverflow: string;
    private nextScopePos: number = 0;
    constructor() {
        this.currentPosition = new CurrentPosition();
        this.pageContentSize = new ContentSize();
        this.scopes = this.pageContentSize.getScopes();
        this.currentOverflow = document.documentElement.style.overflow;
    }
    doScroll() {
        let scope = this.scopes[this.nextScopePos];
        if (!scope) {
            this.nextScopePos = 0;
            return { left: -1, top: -1 };
        }
        ++this.nextScopePos;
        document.documentElement.style.overflow = this.currentOverflow;
        window.scrollTo(scope.left, scope.top);
        document.documentElement.style.overflow = 'hidden';
        return { left: window.scrollX, top: window.scrollY };
    }
    getScopeSize() {
        let length = this.scopes.length;
        return length;
    }

    getContentFullSize() {
        return this.pageContentSize.getFullSize();
    }

    destroy() {
        document.documentElement.style.overflow = this.currentOverflow;
        this.currentPosition.restore();
    }
}
