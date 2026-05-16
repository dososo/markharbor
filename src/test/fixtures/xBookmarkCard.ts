export const xBookmarkCardHtml = `
  <main>
    <article data-testid="tweet">
      <div data-testid="User-Name">
        <span>Alice Zhang</span>
        <span>@alice</span>
        <time datetime="2026-05-15T12:30:00.000Z">May 15</time>
      </div>
      <div data-testid="tweetText">Useful thread about local-first tools.</div>
      <a href="/alice/status/1234567890">View post</a>
      <img alt="Image" src="https://pbs.twimg.com/media/example.jpg?format=jpg&name=small" />
    </article>
    <article data-testid="tweet">
      <div data-testid="User-Name">
        <span>Bob Lee</span>
        <span>@bob</span>
      </div>
      <div data-testid="tweetText">Video note</div>
      <a href="/bob/status/222">View post</a>
      <div data-testid="videoPlayer">
        <img src="https://pbs.twimg.com/ext_tw_video_thumb/video.jpg" />
      </div>
    </article>
  </main>
`;
