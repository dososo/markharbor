import { createCollectionController } from "./collection";

const controller = createCollectionController();

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  sendResponse(controller.handleMessage(message));
});
