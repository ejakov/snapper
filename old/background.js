function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

let screenshot = {
    content: document.createElement('canvas'),
    data: '',

    init: function () {
        this.initEvents();
    },

    initEvents: function () {
        chrome.browserAction.onClicked.addListener(async function () {
            // Get current tab id.
            let tab = await new Promise((res) => {
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

            let tab_id = tab.id;

            let init_response = await new Promise((res) => {
                chrome.tabs.sendMessage(tab_id, { type: 'init' }, (response) => res(response));
            });

            let { devicePixelRatio, fullSize, maxIdx } = init_response;

            let canvas = document.createElement('canvas');
            canvas.width = Math.ceil(fullSize.width / (1 / devicePixelRatio));
            canvas.height = Math.ceil(fullSize.height / (1 / devicePixelRatio));
            let context = canvas.getContext('2d');
            for (let i = 0; i < maxIdx - 1; ++i) {
                // First scroll

                console.log(`scrolling to index ${i}`);
                let scrollResult = await new Promise((res) => {
                    chrome.tabs.sendMessage(tab_id, { type: 'scroll', idx: i }, (response) => res(response));
                });

                console.log(`waiting 200ms ${scrollResult.left}, ${scrollResult.top}`);

                // Slight delay to wait for the scroll
                await new Promise((res) => setTimeout(res, 200));

                // Capture image and draw on a canvas
                await new Promise((res) => {
                    console.log(`capturing tab ${tab_id}`);
                    chrome.windows.update(
                        tab.windowId,
                        {
                            focused: true,
                        },
                        () => {
                            chrome.tabs.update(
                                tab_id,
                                {
                                    active: true,
                                },
                                () => {
                                    chrome.tabs.captureVisibleTab(
                                        tab.windowId,
                                        {
                                            format: 'png',
                                            quality: 100,
                                        },
                                        (data) => {
                                            var image = new Image();
                                            image.onload = function () {
                                                context.drawImage(
                                                    image,
                                                    Math.ceil(scrollResult.left / (1 / devicePixelRatio)),
                                                    Math.ceil(scrollResult.top / (1 / devicePixelRatio))
                                                );
                                                res();
                                            };
                                            image.src = data;
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            }

            // Done, restore position
            await new Promise((res) => {
                chrome.tabs.sendMessage(tab_id, { type: 'done' }, (response) => res(response));
            });

            // save the image
            var link = document.createElement('a');
            link.download = `patient_${new Date().toJSON()}.png`; // "download.png";
            link.href = canvas.toDataURL();
            link.click();

            var notificationDetails = {
                type: 'basic',
                iconUrl: './ui/images/snap_128x128.png',
                title: 'Snapshot created',
                message: 'Snap has created the following snapshot: ',
                contextMessage: `Created snapshot ${link.download}`,
                priority: 0,
            };
            chrome.notifications.create(newGuid(), notificationDetails);
        });
    },
};

screenshot.init();
