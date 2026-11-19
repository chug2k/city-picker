import { defineConfig } from "@playwright/test";

const target = process.env.CITY_PICKER_URL;
const local = "http://127.0.0.1:4173/";

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: target || local, locale: "en-US", channel: process.env.PLAYWRIGHT_CHANNEL },
  webServer: target ? undefined : {
    command: "npm run dev -- --hostname 127.0.0.1 --port 4173",
    url: local,
    reuseExistingServer: !process.env.CI,
  },
});
