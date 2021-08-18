const {test} = require("@playwright/test");
const { js_api_before } = require("../utils");

test.describe("RufflePlayer.metadata", () => {
    js_api_before("/test_assets/example.swf");

    test("has metadata after load", async ({ page: browser }) => {
        const player = await browser.$("ruffle-player");
        const metadata = await browser.evaluate((player) => player.metadata, player);
        expect(metadata).toEqual({
            width: 550,
            height: 400,
            frameRate: 24,
            numFrames: 1,
            swfVersion: 15,
            isActionScript3: false,
            backgroundColor: "#FF0000",
        });
    });
});
