import BackgroundSnapper from './entities/snapper-background';

(() => {
    chrome.browserAction.onClicked.addListener(async function () {
        let snapper = new BackgroundSnapper();
        await snapper.initialize();
        await snapper.takeSnapshot();
    });
})();
