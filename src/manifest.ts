export const manifest = {
  manifest_version: 3,
  name: "__MSG_extName__",
  version: "0.1.10",
  description: "__MSG_extDescription__",
  default_locale: "zh_CN",
  action: {
    default_title: "__MSG_extName__",
    default_popup: "index.html"
  },
  permissions: ["activeTab", "downloads", "scripting"],
  host_permissions: ["https://x.com/*", "https://pbs.twimg.com/*"],
  background: {
    service_worker: "assets/background.js",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["https://x.com/i/bookmarks*"],
      js: ["assets/content.js"],
      run_at: "document_idle"
    }
  ]
} as const;
