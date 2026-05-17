import { buildExportZip } from "../shared/exportZip";
import type { ContentToPopupResponse, PopupToContentMessage } from "../shared/messages";
import type { CollectionState, XBookmark } from "../shared/types";
import { type AppLanguage, loadLanguage, type MessageKey, resolveLanguage, saveLanguage, t } from "./i18n";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");
const contentScriptFile = "assets/content.js";

let bookmarks: XBookmark[] = [];
let state: CollectionState | undefined;
let errorKey: MessageKey | undefined;
let includeImages = true;
let fullArticleImages = true;
let isExporting = false;
let statusTimer: number | undefined;
let language: AppLanguage = resolveLanguage(navigator.language);
let hasStartedCollectionInPopup = false;

async function sendToActiveTab(message: PopupToContentMessage): Promise<ContentToPopupResponse> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) throw new Error("Active tab not found.");
  try {
    return await chrome.tabs.sendMessage(tab.id, message);
  } catch (error) {
    await injectContentScript(tab);
    return chrome.tabs.sendMessage(tab.id, message);
  }
}

function isXBookmarksTab(tab: chrome.tabs.Tab): boolean {
  try {
    const url = new URL(tab.url ?? "");

    return url.hostname === "x.com" && url.pathname.startsWith("/i/bookmarks");
  } catch {
    return false;
  }
}

async function injectContentScript(tab: chrome.tabs.Tab): Promise<void> {
  if (!tab.id || !isXBookmarksTab(tab)) {
    throw new Error("Active tab is not X Bookmarks.");
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [contentScriptFile]
  });
}

async function fetchImage(url: string): Promise<Blob | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    return response.blob();
  } catch {
    return undefined;
  }
}

async function downloadZip(): Promise<void> {
  isExporting = true;
  render();

  let objectUrl: string | undefined;
  try {
    const blob = await buildExportZip({ bookmarks, includeImages, fetchImage });
    objectUrl = URL.createObjectURL(blob);
    await chrome.downloads.download({
      url: objectUrl,
      filename: `x-bookmarks-export-${new Date().toISOString().slice(0, 10)}.zip`,
      saveAs: true
    });
    errorKey = undefined;
  } catch {
    errorKey = "exportError";
  } finally {
    if (objectUrl) {
      const urlToRevoke = objectUrl;
      window.setTimeout(() => URL.revokeObjectURL(urlToRevoke), 5000);
    }
    isExporting = false;
    render();
  }
}

function emptyDisplayState(responseState: CollectionState | undefined): CollectionState | undefined {
  if (!responseState) {
    return undefined;
  }

  return {
    ...responseState,
    bookmarks: [],
    lastScanAdded: 0,
    runAdded: 0,
    scrollAttempts: 0,
    idleScans: 0
  };
}

function shouldDisplayBookmarks(message: PopupToContentMessage, response: ContentToPopupResponse): boolean {
  if (!response.ok) {
    return false;
  }

  return message.type !== "GET_STATUS" || hasStartedCollectionInPopup || response.state.isCollecting;
}

function applyResponse(message: PopupToContentMessage, response: ContentToPopupResponse): void {
  if (!response.ok) {
    state = response.state;
    errorKey = response.errorKey;
    return;
  }

  if (shouldDisplayBookmarks(message, response) && "bookmarks" in response) {
    bookmarks = response.bookmarks;
  }
  if (message.type === "GET_STATUS" && !shouldDisplayBookmarks(message, response)) {
    bookmarks = [];
    state = emptyDisplayState(response.state);
  } else {
    state = response.state;
  }
  errorKey = undefined;
}

async function runMessage(message: PopupToContentMessage): Promise<void> {
  if (message.type === "START_COLLECTION") {
    hasStartedCollectionInPopup = true;
  }

  try {
    applyResponse(message, await sendToActiveTab(message));
  } catch {
    errorKey = "openBookmarksError";
  }

  render();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render(): void {
  if (!root) return;

  const count = bookmarks.length;
  const isCollecting = state?.isCollecting ?? false;
  const statusLabel = errorKey ? t(language, "pageHint") : t(language, "pageReady");
  const errorMessage = errorKey ? t(language, errorKey) : undefined;
  const exportFiles = ["Obsidian", "JSON", "CSV", "TXT", "HTML", "manifest"];
  const stageKey = state?.currentStage
    ? ({
      idle: "collectionStageIdle",
      scanning: "collectionStageScanning",
      enhancing: "collectionStageEnhancing",
      scrolling: "collectionStageScrolling",
      stopped: "collectionStageStopped"
    } as const)[state.currentStage]
    : undefined;

  root.innerHTML = `
    <section class="panel">
      <header class="hero">
        <div>
          <span class="status-chip">${statusLabel}</span>
          <h1>${t(language, "appTitle")}</h1>
          <p class="muted">${t(language, "appSubtitle")}</p>
        </div>
        <div class="language" aria-label="${t(language, "language")}">
          <button id="langZh" class="language-option ${language === "zh" ? "active" : ""}" type="button">中文</button>
          <button id="langEn" class="language-option ${language === "en" ? "active" : ""}" type="button">EN</button>
        </div>
      </header>
      ${errorMessage ? `
        <div class="error">
          <p>${escapeHtml(errorMessage)}</p>
          ${errorKey === "openBookmarksError" ? `<a href="https://x.com/i/bookmarks" target="_blank" rel="noreferrer">${t(language, "openBookmarksAction")}</a>` : ""}
        </div>
      ` : ""}
      <dl class="stats">
        <div><dt>${t(language, "collected")}</dt><dd>${count}</dd></div>
        <div><dt>${t(language, "runAdded")}</dt><dd>${state?.runAdded ?? 0}</dd></div>
        <div><dt>${t(language, "scrolls")}</dt><dd>${state?.scrollAttempts ?? 0}</dd></div>
      </dl>
      <section class="export-card">
        <div>
          <h2>${t(language, "exportPackage")}</h2>
          <p>${t(language, "exportPreview")}</p>
        </div>
        <div class="format-list">
          ${exportFiles.map((file) => `<span>${file}</span>`).join("")}
        </div>
        <label class="check">
          <input id="includeImages" type="checkbox" ${includeImages ? "checked" : ""} />
          ${t(language, "includeImages")}
        </label>
        <label class="check">
          <input id="fullArticleImages" type="checkbox" ${fullArticleImages ? "checked" : ""} ${isCollecting ? "disabled" : ""} />
          ${t(language, "fullArticleImages")}
        </label>
      </section>
      ${isCollecting || state?.currentStage === "stopped" ? `
        <section class="progress-card">
          <strong>${stageKey ? t(language, stageKey) : t(language, "collectionStageIdle")}</strong>
          ${state?.currentItemTitle ? `<p>${t(language, "currentTask")}：${escapeHtml(state.currentItemTitle)}</p>` : ""}
        </section>
      ` : ""}
      <div class="actions">
        <button id="start" type="button" ${isCollecting ? "disabled" : ""}>${isCollecting ? t(language, "collecting") : t(language, "startCollection")}</button>
        <button id="stop" type="button" ${isCollecting ? "" : "disabled"}>${t(language, "stopCollection")}</button>
        <button id="clear" type="button" ${count === 0 && !isCollecting ? "disabled" : ""}>${t(language, "clearCollection")}</button>
        <button id="export" class="primary" type="button" ${count === 0 || isExporting ? "disabled" : ""}>${isExporting ? t(language, "exporting") : t(language, "exportZip")}</button>
      </div>
      <p class="hint">${t(language, "videoHint")}</p>
    </section>
  `;

  document.querySelector("#langZh")?.addEventListener("click", () => {
    language = "zh";
    saveLanguage(language);
    render();
  });
  document.querySelector("#langEn")?.addEventListener("click", () => {
    language = "en";
    saveLanguage(language);
    render();
  });
  document.querySelector<HTMLInputElement>("#includeImages")?.addEventListener("change", (event) => {
    includeImages = (event.currentTarget as HTMLInputElement).checked;
  });
  document.querySelector<HTMLInputElement>("#fullArticleImages")?.addEventListener("change", (event) => {
    fullArticleImages = (event.currentTarget as HTMLInputElement).checked;
  });
  document.querySelector("#start")?.addEventListener("click", () => void runMessage({
    type: "START_COLLECTION",
    fullArticleImages
  }));
  document.querySelector("#stop")?.addEventListener("click", () => void runMessage({ type: "STOP_COLLECTION" }));
  document.querySelector("#clear")?.addEventListener("click", () => void runMessage({ type: "CLEAR_COLLECTION" }));
  document.querySelector("#export")?.addEventListener("click", () => void downloadZip());

  updateStatusTimer(isCollecting);
}

function updateStatusTimer(isCollecting: boolean): void {
  if (!isCollecting && statusTimer !== undefined) {
    window.clearInterval(statusTimer);
    statusTimer = undefined;
    return;
  }

  if (isCollecting && statusTimer === undefined) {
    statusTimer = window.setInterval(() => void runMessage({ type: "GET_STATUS" }), 1500);
  }
}

async function init(): Promise<void> {
  language = await loadLanguage();
  render();
  await runMessage({ type: "GET_STATUS" });
}

void init();
