import {test, Page} from "@playwright/test";
import path from 'path';
import {PublicAPI, RufflePlayer} from "ruffle-core";

// RufflePlayer cast to any to use private elements "invoked" and "instance"

declare module "ruffle-core" {
  interface RufflePlayer {
    __ruffle_log__: string
  }
}
declare global {
  interface Window {
    ruffleErrors: ErrorEvent[]
  }
}

export function is_ruffle_loaded(): boolean {
    return window !== undefined &&
      window.RufflePlayer !== undefined &&
      (window.RufflePlayer as any).invoked
}

export async function wait_for_ruffle(browser: Page): Promise<void> {
    await browser.waitForFunction(() => is_ruffle_loaded());
    throw_if_error(browser);
}

export async function setup_error_handler(browser: Page): Promise<void> {
    await browser.evaluate(() => {
        window.ruffleErrors = [];
        window.addEventListener("error", (error) => {
            window.ruffleErrors.push(error);
        });
    });
}

export async function has_error(browser: Page): Promise<boolean> {
    return await browser.evaluate(
        () => window.ruffleErrors && window.ruffleErrors.length > 0
    );
}

export async function throw_if_error(browser: Page): Promise<void> {
    return await browser.evaluate(() => {
        if (window.ruffleErrors && window.ruffleErrors.length > 0) {
            throw window.ruffleErrors[0];
        }
    });
}

export async function inject_ruffle(browser: Page) {
    await setup_error_handler(browser);
    await browser.evaluate(() => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "/dist/ruffle.js";
        document.head.appendChild(script);
    });
    await throw_if_error(browser);
}

export async function play_and_monitor(browser: Page, player: RufflePlayer, expected_output?: string) {
    await throw_if_error(browser);

    // TODO: better way to test for this in the API
    await browser.waitForFunction(
        (player) =>
            has_error(browser) || (player as any).instance, player);

    await browser.evaluate((player) => {
        player.__ruffle_log__ = "";
        player.traceObserver = (msg) => {
            player.__ruffle_log__ += msg + "\n";
        };
        player.play();
    }, player);

    if (expected_output === undefined) {
        expected_output = "Hello from Flash!\n";
    }

    await browser.waitForFunction(
        (player) =>
            (player as any).__ruffle_log__ === expected_output,
        player
    );
}

export async function inject_ruffle_and_wait(browser: Page) {
    await inject_ruffle(browser);
    await wait_for_ruffle(browser);
}

export async function open_test(browser: Page, absolute_dir: string, file_name: string) {
    const dir_name = path.basename(absolute_dir);
    if (file_name === undefined) {
        file_name = "index.html";
    }
    await browser.goto(`http://localhost:4567/test/polyfill/${dir_name}/${file_name}`);
}

/** Test set-up for JS API testing. */
export function js_api_before(swf?: string) {
    let player: RufflePlayer = null;

    test.beforeAll(async ({ page: browser }) => {
        await browser.goto("http://localhost:4567/test_assets/js_api.html");

        await inject_ruffle_and_wait(browser);

        player = await browser.evaluate(() => {
            const ruffle = (window.RufflePlayer as PublicAPI).newest();
            const player = ruffle.createPlayer();
            const container = document.getElementById("test-container");
            container.appendChild(player);
            return player;
        });

        if (swf) {
            await browser.evaluate(async (player) => {
                await player.load("/test_assets/example.swf");
            }, player);
            await play_and_monitor(browser, player);
        }
    })
}
