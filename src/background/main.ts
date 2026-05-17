import { fetchRenderedDetailContent } from "./renderedText";
import type { BackgroundToContentResponse, ContentToBackgroundMessage } from "../shared/messages";

function isRenderedDetailTextMessage(message: unknown): message is ContentToBackgroundMessage {
  return typeof message === "object"
    && message !== null
    && "type" in message
    && message.type === "GET_RENDERED_DETAIL_TEXT"
    && "bookmark" in message;
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isRenderedDetailTextMessage(message)) {
    return false;
  }

  void fetchRenderedDetailContent(message.bookmark, {
    fullArticleImages: message.fullArticleImages
  })
    .then((content) => {
      sendResponse({
        ok: true,
        text: content?.text,
        contentBlocks: content?.contentBlocks
      } satisfies BackgroundToContentResponse);
    })
    .catch((error: unknown) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      } satisfies BackgroundToContentResponse);
    });

  return true;
});
