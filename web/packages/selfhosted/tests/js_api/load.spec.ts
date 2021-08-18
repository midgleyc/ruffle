import {test} from "@playwright/test";
import {RufflePlayer} from "ruffle-core";
import {js_api_before, play_and_monitor} from "../utils";

test.describe("RufflePlayer.load", () => {
    js_api_before();

    test("loads and plays a URL", async ({ page: browser }) => {
        const player: RufflePlayer = (await browser.$("ruffle-player")) as unknown as RufflePlayer;
        await browser.evaluate((player) => {
            player.load("/test_assets/example.swf");
        }, player);
        await play_and_monitor(browser, player);
    });
});
