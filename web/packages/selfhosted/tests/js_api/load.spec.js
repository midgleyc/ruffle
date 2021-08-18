const {test} = require("@playwright/test");
const { js_api_before, play_and_monitor } = require("../utils");

test.describe("RufflePlayer.load", () => {
    js_api_before();

    test("loads and plays a URL", async ({ page: browser }) => {
        const player = (await browser.$("ruffle-player"));
        await browser.evaluate((player) => {
            player.load("/test_assets/example.swf");
        }, player);
        await play_and_monitor(browser, player);
    });
});
