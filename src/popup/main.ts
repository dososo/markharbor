import { buildExportZip } from "../shared/exportZip";
import type { ContentToPopupResponse, PopupToContentMessage } from "../shared/messages";
import type { CollectionState, XBookmark } from "../shared/types";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");

let bookmarks: XBookmark[] = [];
let state: CollectionState | undefined;
let errorMessage: string | undefined;
let includeImages = true;
let isExporting = false;
let statusTimer: number | undefined;

async function sendToActiveTab(message: PopupToContentMessage): Promise<ContentToPopupResponse> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) throw new Error("没有找到当前标签页。");
  return chrome.tabs.sendMessage(tab.id, message);
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

  try {
    const blob = await buildExportZip({ bookmarks, includeImages, fetchImage });
    const url = URL.createObjectURL(blob);
    await chrome.downloads.download({
      url,
      filename: `x-bookmarks-export-${new Date().toISOString().slice(0, 10)}.zip`,
      saveAs: true
    });
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    errorMessage = undefined;
  } catch {
    errorMessage = "导出 zip 失败，请稍后重试。";
  } finally {
    isExporting = false;
    render();
  }
}

function applyResponse(response: ContentToPopupResponse): void {
  if (!response.ok) {
    state = response.state;
    errorMessage = response.error;
    return;
  }

  if ("bookmarks" in response) {
    bookmarks = response.bookmarks;
  }
  state = response.state;
  errorMessage = undefined;
}

async function runMessage(message: PopupToContentMessage): Promise<void> {
  try {
    applyResponse(await sendToActiveTab(message));
  } catch {
    errorMessage = "请先打开 X Bookmarks 页面，并确认插件已获得当前页面权限。";
  }

  render();
}

function render(): void {
  if (!root) return;

  const count = bookmarks.length;
  const isCollecting = state?.isCollecting ?? false;

  root.innerHTML = `
    <section class="panel">
      <header>
        <h1>X 书签导出</h1>
        <p class="muted">在 X Bookmarks 页面采集并导出到 Obsidian。</p>
      </header>
      ${errorMessage ? `<p class="error">${errorMessage}</p>` : ""}
      <dl class="stats">
        <div><dt>已采集</dt><dd>${count}</dd></div>
        <div><dt>本次新增</dt><dd>${state?.lastScanAdded ?? 0}</dd></div>
        <div><dt>滚动次数</dt><dd>${state?.scrollAttempts ?? 0}</dd></div>
      </dl>
      <label class="check">
        <input id="includeImages" type="checkbox" ${includeImages ? "checked" : ""} />
        下载图片附件
      </label>
      <div class="actions">
        <button id="start" type="button" ${isCollecting ? "disabled" : ""}>${isCollecting ? "采集中..." : "开始采集"}</button>
        <button id="stop" type="button" ${isCollecting ? "" : "disabled"}>停止</button>
        <button id="clear" type="button" ${count === 0 && !isCollecting ? "disabled" : ""}>清空</button>
        <button id="export" type="button" ${count === 0 || isExporting ? "disabled" : ""}>${isExporting ? "导出中..." : "导出 zip"}</button>
      </div>
      <p class="hint">视频不会下载，只会保存原帖链接和预览信息。</p>
    </section>
  `;

  document.querySelector<HTMLInputElement>("#includeImages")?.addEventListener("change", (event) => {
    includeImages = (event.currentTarget as HTMLInputElement).checked;
  });
  document.querySelector("#start")?.addEventListener("click", () => void runMessage({ type: "START_COLLECTION" }));
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

render();
void runMessage({ type: "GET_STATUS" });
