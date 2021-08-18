const {test} = require("@playwright/test");
const path = require("path");

async function wait_for_ruffle(browser) {
    await browser.waitForFunction(() => {
        return window !== undefined &&
          window.RufflePlayer !== undefined &&
          window.RufflePlayer.invoked
    });
    throw_if_error(browser);
}

async function setup_error_handler(browser) {
    await browser.evaluate(() => {
        window.ruffleErrors = [];
        window.addEventListener("error", (error) => {
            window.ruffleErrors.push(error);
        });
    });
}

async function throw_if_error(browser) {
    return await browser.evaluate(() => {
        if (window.ruffleErrors && window.ruffleErrors.length > 0) {
            throw window.ruffleErrors[0];
        }
    });
}

async function inject_ruffle(browser) {
    await setup_error_handler(browser);
    await browser.evaluate(() => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "/dist/ruffle.js";
        document.head.appendChild(script);
    });
    await throw_if_error(browser);
}

async function play_and_monitor(browser, player, expected_output) {
    await throw_if_error(browser);

    // TODO: better way to test for this in the API
    await browser.waitForFunction(
        (player) =>
            (window.ruffleErrors && window.ruffleErrors.length > 0) || player.instance, player);

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
        ({player, expected_output}) =>
            player.__ruffle_log__ === expected_output,
        {player, expected_output}
    );
}

async function inject_ruffle_and_wait(browser) {
    await inject_ruffle(browser);
    await wait_for_ruffle(browser);
}

async function open_test(browser, absolute_dir, file_name) {
    const dir_name = path.basename(absolute_dir);
    if (file_name === undefined) {
        file_name = "index.html";
    }
    await browser.goto(`http://localhost:4567/test/polyfill/${dir_name}/${file_name}`);
}

/** Test set-up for JS API testing. */
function js_api_before(swf) {
    let player = null;

    test.beforeEach(async ({ page: browser }) => {
        await browser.goto("http://localhost:4567/test_assets/js_api.html");

        await inject_ruffle_and_wait(browser);

        player = await browser.evaluate(() => {
            const ruffle = window.RufflePlayer.newest();
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

module.exports = {
    wait_for_ruffle,
    play_and_monitor,
    inject_ruffle,
    inject_ruffle_and_wait,
    open_test,
    setup_error_handler,
    js_api_before,
};
