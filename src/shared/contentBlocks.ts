import type { XBookmarkContentBlock } from "./types";

function htmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markdownDestination(destination: string): string {
  const escaped = destination
    .replace(/\\/g, "\\\\")
    .replace(/</g, "\\<")
    .replace(/>/g, "\\>");

  return `<${escaped}>`;
}

function markdownImageDestination(url: string, imagePaths: Map<string, string>): string {
  const destination = imagePaths.get(url) ?? url;

  if (destination.startsWith("attachments/")) {
    return `../${destination}`;
  }

  if (destination.startsWith("../") || destination.startsWith("./")) {
    return destination;
  }

  return markdownDestination(destination);
}

function inlineMarkdownToHtml(value: string): string {
  const parts = value.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return `<strong>${htmlEscape(part.slice(2, -2))}</strong>`;
    }

    return htmlEscape(part);
  }).join("");
}

export function textFromContentBlocks(blocks: XBookmarkContentBlock[] | undefined): string {
  return (blocks ?? []).map((block) => {
    switch (block.type) {
      case "heading":
      case "paragraph":
        return block.text;
      case "list":
        return block.items.join("\n");
      case "image":
        return block.alt ?? "";
      default:
        return "";
    }
  }).filter(Boolean).join("\n\n");
}

export function renderContentBlocksMarkdown(blocks: XBookmarkContentBlock[], imagePaths = new Map<string, string>()): string {
  return blocks.map((block) => {
    switch (block.type) {
      case "heading":
        return `${"#".repeat(block.level)} ${block.text}`;
      case "paragraph":
        return block.text;
      case "list":
        return block.items.map((item) => `- ${item}`).join("\n");
      case "image":
        return `![${block.alt ?? ""}](${markdownImageDestination(block.url, imagePaths)})`;
      default:
        return "";
    }
  }).filter(Boolean).join("\n\n");
}

export function renderContentBlocksHtml(blocks: XBookmarkContentBlock[], imagePaths = new Map<string, string>()): string {
  return blocks.map((block) => {
    switch (block.type) {
      case "heading":
        return `<h${block.level}>${htmlEscape(block.text)}</h${block.level}>`;
      case "paragraph":
        return `<p>${inlineMarkdownToHtml(block.text)}</p>`;
      case "list":
        return `<ul>${block.items.map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`).join("")}</ul>`;
      case "image": {
        const destination = imagePaths.get(block.url) ?? block.url;
        return `<figure><img src="${htmlEscape(destination)}" alt="${htmlEscape(block.alt ?? "")}" /></figure>`;
      }
      default:
        return "";
    }
  }).join("");
}
