import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const rootDir = process.cwd();
const assetsDir = path.join(rootDir, "docs", "assets");
const screenshotsDir = path.join(assetsDir, "screenshots");
const storeDir = path.join(assetsDir, "store");

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function svgShell(width, height, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <defs>
    <linearGradient id="pageBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="48%" stop-color="#123C43"/>
      <stop offset="100%" stop-color="#F4B860"/>
    </linearGradient>
    <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#0F172A" flood-opacity="0.22"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#pageBg)"/>
  <path d="M0 ${height * 0.78} C${width * 0.18} ${height * 0.66} ${width * 0.34} ${height * 0.92} ${width * 0.52} ${height * 0.76} C${width * 0.75} ${height * 0.56} ${width * 0.88} ${height * 0.78} ${width} ${height * 0.66} L${width} ${height} L0 ${height} Z" fill="#0B1220" opacity="0.26"/>
  ${content}
</svg>`;
}

function text(x, y, value, options = {}) {
  const {
    size = 24,
    weight = 500,
    color = "#101828",
    anchor = "start",
    family = "Hiragino Sans GB"
  } = options;

  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(value)}</text>`;
}

function paragraph(x, y, lines, options = {}) {
  const size = options.size ?? 24;
  const lineHeight = options.lineHeight ?? Math.round(size * 1.42);
  return lines.map((line, index) => text(x, y + index * lineHeight, line, options)).join("\n");
}

function logo(x, y, size = 72) {
  const scale = size / 112;
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <rect x="0" y="0" width="112" height="112" rx="26" fill="#123C43"/>
    ${text(56, 68, "M", { size: 56, weight: 850, color: "#FFFFFF", anchor: "middle" })}
    <rect x="30" y="80" width="52" height="8" rx="4" fill="#F4B860"/>
  </g>`;
}

function browserFrame(x, y, width, height, title, inner) {
  return `<g filter="url(#softShadow)">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="20" fill="#FFFFFF"/>
    <rect x="${x}" y="${y}" width="${width}" height="52" rx="20" fill="#F2F4F7"/>
    <circle cx="${x + 28}" cy="${y + 26}" r="7" fill="#F97066"/>
    <circle cx="${x + 50}" cy="${y + 26}" r="7" fill="#FDB022"/>
    <circle cx="${x + 72}" cy="${y + 26}" r="7" fill="#32D583"/>
    <rect x="${x + 102}" y="${y + 13}" width="${width - 132}" height="26" rx="13" fill="#FFFFFF"/>
    ${text(x + 122, y + 32, title, { size: 13, color: "#667085", weight: 600 })}
    ${inner}
  </g>`;
}

function popupCard(x, y, state) {
  const collecting = state === "collecting";
  const done = state === "done";
  const stats = done ? [["已发现", "48"], ["本轮发现", "48"], ["详情完成", "48/48"]] : collecting ? [["已发现", "26"], ["本轮发现", "26"], ["详情完成", "18/26"]] : [["已发现", "0"], ["本轮发现", "0"], ["详情完成", "0/0"]];
  const stage = done ? "导出准备完成" : collecting ? "增强正文与配图" : "等待中";
  const item = done ? "可导出 Obsidian 知识库包" : collecting ? "设计系统周刊 | 更好的 AI 工作流" : "打开 X 书签页面后开始采集";

  const statBlocks = stats.map(([label, value], index) => {
    const sx = x + 24 + index * 118;
    return `<rect x="${sx}" y="${y + 154}" width="102" height="86" rx="10" fill="#FFFFFF" stroke="${collecting ? "#B7D1FF" : "#E4DED2"}"/>
      ${text(sx + 12, y + 185, label, { size: 14, color: "#5F6368", weight: 650 })}
      ${text(sx + 12, y + 224, value, { size: value.includes("/") ? 24 : 34, color: "#202124", weight: 800 })}`;
  }).join("\n");

  return `<g filter="url(#softShadow)">
    <rect x="${x}" y="${y}" width="404" height="520" rx="26" fill="#FFFAF0"/>
    <g transform="translate(${x + 24} ${y + 24})">
      ${text(0, 28, "MarkHarbor", { size: 28, weight: 800 })}
      ${paragraph(0, 65, ["X 书签导出到 Obsidian,", "本地优先的书签归档港。"], { size: 17, color: "#5F6368", weight: 650, lineHeight: 27 })}
      <rect x="264" y="2" width="88" height="34" rx="17" fill="#FFFFFF" stroke="#E4DED2"/>
      <rect x="306" y="6" width="40" height="26" rx="13" fill="#FDD663"/>
      ${text(281, 25, "中", { size: 13, weight: 700, color: "#5F6368" })}
      ${text(326, 25, "EN", { size: 13, weight: 800 })}
    </g>
    ${statBlocks}
    <rect x="${x + 24}" y="${y + 264}" width="356" height="96" rx="10" fill="#FFFFFF" stroke="#E4DED2"/>
    ${text(x + 42, y + 296, "导出包", { size: 18, weight: 800 })}
    ${["MD", "JSON", "CSV", "HTML", "IMG"].map((label, index) => `<rect x="${x + 42 + index * 60}" y="${y + 314}" width="48" height="26" rx="13" fill="${index % 3 === 0 ? "#E8F0FE" : index % 3 === 1 ? "#E6F4EA" : "#FEF7E0"}"/>${text(x + 66 + index * 60, y + 333, label, { size: 12, weight: 800, color: index % 3 === 0 ? "#174EA6" : index % 3 === 1 ? "#137333" : "#9A6700", anchor: "middle" })}`).join("")}
    ${text(x + 42, y + 350, "索引、单条笔记、媒体清单和导出报告", { size: 12, color: "#5F6368", weight: 600 })}
    <rect x="${x + 24}" y="${y + 382}" width="356" height="70" rx="10" fill="${collecting ? "#EEF5FF" : "#F7FBFF"}" stroke="${collecting ? "#0B57D0" : "#C4D7F5"}"/>
    ${collecting ? `<circle cx="${x + 46}" cy="${y + 411}" r="6" fill="#0B57D0"/>` : ""}
    ${text(x + 60, y + 416, stage, { size: 16, weight: 800, color: "#202124" })}
    ${text(x + 42, y + 440, item, { size: 13, color: "#5F6368", weight: 600 })}
    <rect x="${x + 24}" y="${y + 470}" width="170" height="38" rx="10" fill="${collecting ? "#FFFFFF" : "#0B57D0"}" stroke="#0B57D0"/>
    ${text(x + 109, y + 495, collecting ? "停止" : "开始采集", { size: 14, weight: 800, color: collecting ? "#0B57D0" : "#FFFFFF", anchor: "middle" })}
    <rect x="${x + 210}" y="${y + 470}" width="170" height="38" rx="10" fill="${done ? "#0B57D0" : "#FFFFFF"}" stroke="#DADCE0"/>
    ${text(x + 295, y + 495, "导出 zip", { size: 14, weight: 800, color: done ? "#FFFFFF" : "#202124", anchor: "middle" })}
  </g>`;
}

function xBookmarksList(x, y, width, height) {
  const cards = [
    ["设计系统周刊", "@designweekly", "一份关于 AI 产品工作流可审计性的实践指南……", "X 长文"],
    ["Maya Chen", "@maya", "好的笔记不是摘要，而是带来源链接的长期决策记录。", "串文"],
    ["Notebook Ops", "@notebookops", "如何把已保存内容整理成可检索的研究资料库。", "链接卡片"]
  ];

  const cardSvgs = cards.map((card, index) => {
    const cy = y + 92 + index * 130;
    return `<rect x="${x + 28}" y="${cy}" width="${width - 56}" height="112" rx="16" fill="#FFFFFF" stroke="#EAECF0"/>
      <circle cx="${x + 58}" cy="${cy + 32}" r="18" fill="${index === 0 ? "#123C43" : index === 1 ? "#F4B860" : "#0B57D0"}"/>
      ${text(x + 88, cy + 28, card[0], { size: 18, weight: 800 })}
      ${text(x + 88, cy + 52, card[1], { size: 13, color: "#667085", weight: 650 })}
      ${text(x + 88, cy + 82, card[2], { size: 15, color: "#344054", weight: 550 })}
      <rect x="${x + width - 132}" y="${cy + 20}" width="76" height="28" rx="14" fill="#E6F4EA"/>
      ${text(x + width - 94, cy + 39, card[3], { size: 12, weight: 800, color: "#137333", anchor: "middle" })}`;
  }).join("\n");

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="#F8FAFC"/>
    ${text(x + 28, y + 48, "X 书签", { size: 28, weight: 850 })}
    ${text(x + 28, y + 76, "公开截图使用的演示数据", { size: 15, color: "#667085", weight: 650 })}
    ${cardSvgs}`;
}

function fileTree(x, y) {
  const rows = [
    ["X Bookmarks Index.md", "#123C43"],
    ["bookmarks/", "#667085"],
    ["  2026-05-17-design-systems-weekly.md", "#0B57D0"],
    ["attachments/x-bookmarks/1934/image-01.jpg", "#0B57D0"],
    ["bookmarks.json", "#137333"],
    ["bookmarks.csv", "#137333"],
    ["bookmarks.html", "#9A6700"],
    ["media-manifest.json", "#137333"],
    ["export-report.json", "#137333"]
  ];

  return rows.map((row, index) => {
    const ry = y + index * 42;
    return `<rect x="${x}" y="${ry - 26}" width="520" height="34" rx="8" fill="${index === 0 ? "#E6F4F1" : "#FFFFFF"}" stroke="#EAECF0"/>
      ${text(x + 18, ry - 4, row[0], { size: 18, color: row[1], weight: index === 0 ? 800 : 650 })}`;
  }).join("\n");
}

function obsidianIndex(x, y, width, height) {
  const links = [
    "设计系统周刊 - 更好的 AI 工作流",
    "Maya Chen - 带来源链接的长期决策",
    "Notebook Ops - 可检索的研究资料库",
    "Riley Park - 本地优先的知识工具"
  ];

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="20" fill="#FCFCFD"/>
    <rect x="${x}" y="${y}" width="240" height="${height}" rx="20" fill="#F2F4F7"/>
    ${text(x + 28, y + 48, "Obsidian", { size: 24, weight: 850, color: "#4C1D95" })}
    ${text(x + 28, y + 92, "X Bookmarks Index.md", { size: 15, weight: 700, color: "#344054" })}
    ${text(x + 280, y + 66, "X Bookmarks Index", { size: 34, weight: 850 })}
    ${text(x + 280, y + 108, "导出时间：2026-05-17 · 书签数量：48 · 媒体文件：126", { size: 16, color: "#667085", weight: 600 })}
    ${links.map((link, index) => {
      const ly = y + 168 + index * 70;
      return `<rect x="${x + 280}" y="${ly - 32}" width="${width - 330}" height="52" rx="12" fill="#FFFFFF" stroke="#EAECF0"/>
        ${text(x + 304, ly, "↗ " + link, { size: 18, color: "#0B57D0", weight: 750 })}`;
    }).join("\n")}`;
}

function obsidianNote(x, y, width, height) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="20" fill="#FCFCFD"/>
    <rect x="${x}" y="${y}" width="250" height="${height}" rx="20" fill="#F2F4F7"/>
    ${text(x + 28, y + 48, "bookmarks/", { size: 22, weight: 850, color: "#4C1D95" })}
    ${text(x + 28, y + 94, "design-systems-weekly.md", { size: 14, weight: 700, color: "#344054" })}
    ${text(x + 288, y + 64, "设计系统周刊 - 更好的 AI 工作流", { size: 29, weight: 850 })}
    <rect x="${x + 288}" y="${y + 90}" width="${width - 340}" height="86" rx="12" fill="#F8FAFC" stroke="#EAECF0"/>
    ${paragraph(x + 310, y + 122, ["source: https://x.com/designweekly/status/1934", "text_source: post-detail · enhancement: success"], { size: 15, color: "#475467", weight: 650, lineHeight: 26 })}
    ${text(x + 288, y + 226, "原文", { size: 24, weight: 850 })}
    ${paragraph(x + 288, y + 266, ["一份关于 AI 产品工作流可审计性的实践指南：", "1. 来源链接始终贴近笔记", "2. 图片按上下文一起保存", "3. 结构化数据可继续复用"], { size: 18, color: "#344054", weight: 550, lineHeight: 34 })}
    <rect x="${x + 288}" y="${y + 404}" width="230" height="138" rx="16" fill="#123C43"/>
    <path d="M${x + 318} ${y + 498} C${x + 370} ${y + 420} ${x + 432} ${y + 420} ${x + 486} ${y + 498}" fill="none" stroke="#F4B860" stroke-width="12" stroke-linecap="round"/>
    ${text(x + 545, y + 442, "链接卡片", { size: 24, weight: 850 })}
    ${paragraph(x + 545, y + 480, ["标题：可审计的 AI 工作流", "URL: example.com/ai-workflows"], { size: 17, color: "#344054", weight: 600, lineHeight: 31 })}`;
}

const shots = {
  "popup-ready": svgShell(1280, 800, `${browserFrame(88, 74, 1104, 650, "https://x.com/i/bookmarks", xBookmarksList(120, 146, 582, 570) + popupCard(746, 122, "ready"))}`),
  "popup-collecting": svgShell(1280, 800, `${browserFrame(88, 74, 1104, 650, "https://x.com/i/bookmarks", xBookmarksList(120, 146, 582, 570) + popupCard(746, 122, "collecting"))}`),
  "popup-export-ready": svgShell(1280, 800, `${browserFrame(88, 74, 1104, 650, "https://x.com/i/bookmarks", xBookmarksList(120, 146, 582, 570) + popupCard(746, 122, "done"))}`),
  "export-zip-structure": svgShell(1280, 800, `<g filter="url(#softShadow)"><rect x="150" y="92" width="980" height="610" rx="26" fill="#FFFFFF"/><rect x="150" y="92" width="980" height="72" rx="26" fill="#F2F4F7"/>${text(190, 138, "markharbor-export.zip", { size: 26, weight: 850 })}${fileTree(210, 226)}<rect x="788" y="222" width="270" height="270" rx="28" fill="#E6F4F1"/>${logo(870, 292, 112)}${text(923, 458, "Obsidian 就绪", { size: 24, weight: 850, anchor: "middle", color: "#123C43" })}${text(923, 492, "Markdown + 媒体 + 数据", { size: 16, weight: 650, anchor: "middle", color: "#667085" })}</g>`),
  "obsidian-index": svgShell(1280, 800, `${browserFrame(76, 70, 1128, 660, "Obsidian · MarkHarbor 导出包", obsidianIndex(106, 144, 1068, 540))}`),
  "obsidian-note": svgShell(1280, 800, `${browserFrame(76, 70, 1128, 660, "Obsidian · 单条书签笔记", obsidianNote(106, 144, 1068, 540))}`),
  "html-preview": svgShell(1280, 800, `${browserFrame(96, 82, 1088, 636, "bookmarks.html", `<rect x="136" y="154" width="1008" height="520" rx="20" fill="#FFFFFF"/>${text(176, 216, "MarkHarbor 导出预览", { size: 38, weight: 850 })}${paragraph(176, 262, ["可离线浏览的 X 书签 HTML 视图。", "不打开 Obsidian 也能快速检查导出结果。"], { size: 18, color: "#667085", weight: 600, lineHeight: 30 })}<rect x="176" y="340" width="440" height="220" rx="18" fill="#F8FAFC" stroke="#EAECF0"/>${text(206, 386, "设计系统周刊", { size: 24, weight: 850 })}${paragraph(206, 430, ["一份关于 AI 产品工作流", "可审计性和可迁移性的实践指南。"], { size: 18, color: "#344054", weight: 600, lineHeight: 32 })}<rect x="668" y="340" width="360" height="220" rx="18" fill="#123C43"/>${text(848, 456, "图片附件", { size: 24, weight: 850, color: "#FFFFFF", anchor: "middle" })}`)}`),
  "store-screenshot-1-overview": svgShell(1280, 800, `${logo(100, 96, 92)}${text(220, 154, "MarkHarbor", { size: 64, weight: 850, color: "#FFFFFF" })}${text(224, 204, "X 书签到 Obsidian", { size: 28, weight: 700, color: "#F4B860" })}${paragraph(100, 282, ["把已加载的 X 书签导出为本地 Obsidian 知识库包：", "Markdown 笔记、可点击索引、图片、JSON、CSV、HTML 和报告。"], { size: 29, color: "#FFFFFF", weight: 650, lineHeight: 46 })}${popupCard(805, 112, "done")}`),
  "store-screenshot-2-collection": svgShell(1280, 800, `${browserFrame(86, 76, 1108, 648, "https://x.com/i/bookmarks", xBookmarksList(118, 148, 588, 568) + popupCard(752, 122, "collecting"))}`),
  "store-screenshot-3-obsidian": svgShell(1280, 800, `${browserFrame(76, 70, 1128, 660, "Obsidian · 本地资料库", obsidianNote(106, 144, 1068, 540))}`)
};

const repositoryAssets = {
  "markharbor-social-preview": svgShell(1280, 640, `${logo(100, 104, 118)}${text(252, 164, "MarkHarbor", { size: 72, weight: 850, color: "#FFFFFF" })}${text(256, 226, "X 书签到 Obsidian", { size: 32, weight: 750, color: "#F4B860" })}${paragraph(100, 324, ["本地优先的 Markdown 书签资料库。", "笔记、图片、JSON、CSV、HTML 一次导出。"], { size: 31, color: "#FFFFFF", weight: 650, lineHeight: 48 })}${popupCard(806, 60, "done")}`)
};

const storeAssets = {
  "promo-small-440x280": svgShell(440, 280, `${logo(34, 42, 62)}${text(116, 82, "MarkHarbor", { size: 34, weight: 850, color: "#FFFFFF" })}${text(118, 118, "X 书签到 Obsidian", { size: 17, weight: 750, color: "#F4B860" })}${paragraph(36, 174, ["本地优先的 Markdown", "书签资料库。"], { size: 18, color: "#FFFFFF", weight: 650, lineHeight: 28 })}`),
  "promo-marquee-1400x560": svgShell(1400, 560, `${logo(100, 112, 116)}${text(250, 178, "MarkHarbor", { size: 78, weight: 850, color: "#FFFFFF" })}${text(254, 244, "X 书签到 Obsidian", { size: 34, weight: 750, color: "#F4B860" })}${paragraph(100, 336, ["把已保存的 X 内容整理成本地资料库：", "Markdown 笔记、图片和结构化数据。"], { size: 32, color: "#FFFFFF", weight: 650, lineHeight: 48 })}${popupCard(930, 24, "done")}`)
};

async function writeSvgAndPng(directory, name, svg) {
  const svgPath = path.join(directory, `${name}.svg`);
  const pngPath = path.join(directory, `${name}.png`);
  const normalizedSvg = svg.replace(/[ \t]+$/gm, "");
  await writeFile(svgPath, normalizedSvg);
  execFileSync("magick", [svgPath, pngPath], { stdio: "inherit" });
}

await mkdir(screenshotsDir, { recursive: true });
await mkdir(storeDir, { recursive: true });

for (const [name, svg] of Object.entries(repositoryAssets)) {
  await writeSvgAndPng(assetsDir, name, svg);
}

for (const [name, svg] of Object.entries(shots)) {
  await writeSvgAndPng(screenshotsDir, name, svg);
}

for (const [name, svg] of Object.entries(storeAssets)) {
  await writeSvgAndPng(storeDir, name, svg);
}

console.log(`已生成 ${Object.keys(repositoryAssets).length} 张仓库展示图、${Object.keys(shots).length} 张截图和 ${Object.keys(storeAssets).length} 张商店素材。`);
