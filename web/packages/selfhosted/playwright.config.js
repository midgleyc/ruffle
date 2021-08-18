const config = {
  projects: [
    {
      name: 'Chrome Stable',
      use: {
        browserName: 'chromium',
        // Test against Chrome Stable channel.
        channel: 'chrome',
      },
    },
    {
      name: 'Desktop Firefox',
      use: {
        browserName: 'firefox',
      }
    },
  ],
  webServer: {
    command: 'npx http-server -p 4567',
    port: 4567,
  },
  use: {
    baseURL: 'http://localhost:4567'
  },
};
module.exports = config;
