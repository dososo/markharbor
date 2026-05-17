import { describe, expect, it } from "vitest";
import { manifest } from "./manifest";

describe("manifest", () => {
  it("allows popup to inject the content script into already-open X Bookmarks tabs", () => {
    expect(manifest.permissions).toContain("scripting");
  });

  it("registers a background service worker for rendered X Article enhancement", () => {
    expect(manifest.background?.service_worker).toBe("assets/background.js");
    expect(manifest.host_permissions).toContain("https://x.com/*");
  });
});
