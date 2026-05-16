const languageStorageKey = "x-bookmarks-language";

export const messages = {
  zh: {
    appTitle: "X 书签导出",
    appSubtitle: "采集当前页面已加载的 X Bookmarks，导出为 Obsidian 知识库包。",
    pageReady: "页面可用",
    pageHint: "打开 X Bookmarks 页面后开始采集。",
    language: "语言",
    collected: "已采集",
    lastAdded: "本次新增",
    scrolls: "滚动次数",
    exportPackage: "导出包",
    exportPreview: "包含 Obsidian 索引、单条笔记、JSON、CSV、TXT、HTML 和媒体清单。",
    includeImages: "下载图片附件",
    startCollection: "开始采集",
    collecting: "采集中...",
    stopCollection: "停止",
    clearCollection: "清空",
    exportZip: "导出 zip",
    exporting: "导出中...",
    videoHint: "视频不会下载，只保存原帖链接和可见预览。",
    openBookmarksError: "请先打开 X Bookmarks 页面，并确认插件已获得当前页面权限。",
    exportError: "导出 zip 失败，请稍后重试。"
  },
  en: {
    appTitle: "X Bookmarks Export",
    appSubtitle: "Collect loaded X Bookmarks and export an Obsidian-ready knowledge package.",
    pageReady: "Page ready",
    pageHint: "Open X Bookmarks before collecting.",
    language: "Language",
    collected: "Collected",
    lastAdded: "New",
    scrolls: "Scrolls",
    exportPackage: "Export package",
    exportPreview: "Includes Obsidian index, per-bookmark notes, JSON, CSV, TXT, HTML, and media manifest.",
    includeImages: "Download image attachments",
    startCollection: "Start collection",
    collecting: "Collecting...",
    stopCollection: "Stop",
    clearCollection: "Clear",
    exportZip: "Export zip",
    exporting: "Exporting...",
    videoHint: "Videos are not downloaded; source links and visible previews are saved.",
    openBookmarksError: "Open the X Bookmarks page first and make sure this extension has permission.",
    exportError: "Failed to export zip. Please try again."
  }
} as const;

export type AppLanguage = keyof typeof messages;
export type MessageKey = keyof typeof messages.zh;

export function resolveLanguage(locale: string | undefined): AppLanguage {
  return locale?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function t(language: AppLanguage, key: MessageKey): string {
  return messages[language][key];
}

export async function loadLanguage(): Promise<AppLanguage> {
  const saved = localStorage.getItem(languageStorageKey);
  if (saved === "zh" || saved === "en") {
    return saved;
  }

  return resolveLanguage(navigator.language);
}

export function saveLanguage(language: AppLanguage): void {
  localStorage.setItem(languageStorageKey, language);
}
