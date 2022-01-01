interface ScreenSize {
    width: number;
    height: number;
}

interface InitMessage {
    devicePixelRatio: number;
    fullScreenSize: ScreenSize;
}

interface ScrollPosition {
    left: number;
    top: number;
}

interface Scope {
    left: number;
    top: number;
}

interface iMsg {
    type: string;
    data: any | undefined;
}
export { ScreenSize, InitMessage, ScrollPosition, Scope, iMsg };
