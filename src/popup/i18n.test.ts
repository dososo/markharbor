import { describe, expect, it } from "vitest";
import { resolveLanguage, t } from "./i18n";

describe("popup i18n", () => {
  it("resolves Chinese browser locales to zh", () => {
    expect(resolveLanguage("zh-CN")).toBe("zh");
    expect(resolveLanguage("zh-Hant")).toBe("zh");
  });

  it("resolves other browser locales to en", () => {
    expect(resolveLanguage("en-US")).toBe("en");
    expect(resolveLanguage(undefined)).toBe("en");
  });

  it("returns localized labels", () => {
    expect(t("zh", "startCollection")).toBe("开始采集");
    expect(t("en", "startCollection")).toBe("Start collection");
  });
});
