import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");

if (root) {
  root.innerHTML = `
    <section class="panel">
      <h1>X 书签导出</h1>
      <p class="muted">打开 X Bookmarks 页面后开始采集。</p>
      <button type="button" disabled>开始采集</button>
    </section>
  `;
}
