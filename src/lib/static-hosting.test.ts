import { describe, expect, it } from "vitest";
// @ts-expect-error Build tooling is plain JavaScript and intentionally independent of app TypeScript.
import { buildTarget } from "../../scripts/build-target.mjs";
// @ts-expect-error Build tooling is plain JavaScript and intentionally independent of app TypeScript.
import { DEFAULT_API_URL } from "../../scripts/api-url.mjs";
import { SUPPORT_URL } from "./lootzy-rules";

describe("hosting targets", () => {
  it("exports static files for a normal local npm build", () => {
    expect(buildTarget({})).toBe("static");
  });
  it("preserves the Cloud API for managed deployments", () => {
    expect(buildTarget({ LOVABLE_NITRO_PRESET: "cloudflare-module" })).toBe("cloud");
    expect(buildTarget({ LOVABLE_SANDBOX: "1" })).toBe("cloud");
  });
  it("opens the requested support account", () => {
    expect(SUPPORT_URL).toBe("https://t.me/Lootzy_help");
  });
  it("hosted mini app reads this project's database, not the old remixed one", () => {
    expect(DEFAULT_API_URL).toBe("https://portrait-of-a-page.lovable.app");
  });
});