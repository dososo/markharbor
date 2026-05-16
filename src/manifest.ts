export const manifest = {
  manifest_version: 3,
  name: "X Bookmarks Obsidian Exporter",
  version: "0.1.0",
  description: "Export loaded X Bookmarks into Obsidian-friendly Markdown and JSON.",
  action: {
    default_title: "X Bookmarks Exporter",
    default_popup: "index.html"
  },
  permissions: ["activeTab", "downloads"],
  host_permissions: ["https://x.com/*"],
  content_scripts: [
    {
      matches: ["https://x.com/i/bookmarks*"],
      js: ["assets/content.js"],
      run_at: "document_idle"
    }
  ]
} as const;
