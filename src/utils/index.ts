import { Payload } from "../types";

const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters
};

export const highlightContent = (
  jsonData: Payload,
  markdown: string,
  selectedKey: string | null,
  showEdit: boolean
) => {
  let highlightedContent = markdown;

  Object.entries(jsonData).forEach(
    ([key, { value, modified_value, status }]) => {
      // Check if the value is already wrapped in a <span> tag
      const spanRegex = new RegExp(`<span id="${key}">.*?</span>`, "g");
      const isAlreadyWrapped = spanRegex.test(highlightedContent);

      let replacement: string;

      // If the value is not already wrapped, we need to wrap it with the correct background color
      if (!isAlreadyWrapped && showEdit) {
        // Check for selectedKey and edited status and handle accordingly
        const escapedValue = escapeRegExp(value);
        if (selectedKey === key) {
          if (status === "edited") {
            replacement = `
              <span class="bg-blue-100 line-through px-1">${value}</span>
              <span id="${key}" class="bg-blue-100 px-1">${modified_value}</span>
            `;
            highlightedContent = highlightedContent.replace(
              new RegExp(`(${escapedValue})`, "g"),
              replacement
            );
          } else {
            replacement = `<span id="${key}" class="bg-blue-100 px-1">${value}</span>`;
            highlightedContent = highlightedContent.replace(
              new RegExp(`(${escapedValue})`, "g"),
              replacement
            );
          }
        } else if (showEdit) {
          if (status === "edited") {
            replacement = `
              <span class="bg-red-200 line-through px-1">${value}</span>
              <span id="${key}" class="bg-green-200 px-1">${modified_value}</span>
            `;
            highlightedContent = highlightedContent.replace(
              new RegExp(`(${escapedValue})`, "g"),
              replacement
            );
          } else {
            const backgroundColor =
              status === "accepted"
                ? "bg-green-200"
                : status === "rejected"
                ? "bg-red-200"
                : "bg-gray-200";

            replacement = `<span id="${key}" class="${backgroundColor} px-1">${value}</span>`;
            highlightedContent = highlightedContent.replace(
              new RegExp(`(${escapedValue})`, "g"),
              replacement
            );
          }
        } else {
          // Default case for unmodified values
          replacement = `<span id="${key}" class="bg-gray-200 px-1">${value}</span>`;
          highlightedContent = highlightedContent.replace(
            new RegExp(`(${escapedValue})`, "g"),
            replacement
          );
        }

        // Replace the newly wrapped content with the correct replacement
        highlightedContent = highlightedContent.replace(spanRegex, replacement);
      } else {
        // If the content is already wrapped, just update it as needed
        let replacement: string;
        if (selectedKey === key) {
          if (status === "edited") {
            replacement = `
              <span class="bg-blue-100 line-through px-1">${value}</span>
              <span id="${key}" class="bg-blue-100 px-1">${modified_value}</span>
            `;
          } else {
            replacement = `<span id="${key}" class="bg-blue-100 px-1">${value}</span>`;
          }
        } else if (showEdit) {
          if (status === "edited") {
            replacement = `
              <span class="bg-red-200 line-through px-1">${value}</span>
              <span id="${key}" class="bg-green-200 px-1">${modified_value}</span>
            `;
          } else {
            const backgroundColor =
              status === "accepted"
                ? "bg-green-200"
                : status === "rejected"
                ? "bg-red-200"
                : "bg-gray-200";

            replacement = `<span id="${key}" class="${backgroundColor} px-1">${value}</span>`;
          }
        } else {
          // Default case for unmodified values
          replacement = `<span id="${key}" class="bg-gray-200 px-1">${value}</span>`;
        }

        // Replace the existing wrapped content with the new replacement
        highlightedContent = highlightedContent.replace(spanRegex, replacement);
      }
    }
  );

  return highlightedContent;
};

export function bytesToMB(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2);
}

export const removeEscapedChars = (str: string) => {
  return str.replace(/\\"/g, '"').replace(/\\\\/g, "");
};

function getValuePosition(line: string, value: string): number {
  // Find the index of the value in the line
  const index = line.indexOf(value);
  return index; // Returns the index of the first occurrence, or -1 if not found
}

export const findKeyPosition = (
  key: string,
  value: string,
  previewRef: React.MutableRefObject<HTMLDivElement | null>,
  setCursorPosition: ({
    line,
    column,
  }: {
    line: number;
    column: number;
  }) => void
) => {
  if (!previewRef.current) return null;

  const span = previewRef.current.querySelector(`span[id="${key}"]`);
  if (!span) return null;

  const range = document.createRange();
  range.selectNode(span);
  range.setStart(previewRef.current, 0);

  const rangeText = range.toString(); // Get text from start to the `span`
  const lines = rangeText.split("\n");
  const lastLine = lines[lines.length - 1];

  const line = lines.length;
  const column =  getValuePosition(lastLine, value);; // +1 for the column to be 1-based

  setCursorPosition({ line, column });
  return { line, column };
};

export const getCursorPosition = (
  previewRef: React.MutableRefObject<HTMLDivElement | null>,
  setCursorPosition: ({
    line,
    column,
  }: {
    line: number;
    column: number;
  }) => void
) => {
  if (!previewRef.current) return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const startNode = range.startContainer;
  const startOffset = range.startOffset;

  let line = 1; // Start with line 1
  let column = 1; // Start with column 1
  let found = false;

  // Traverse child nodes to calculate line and column
  const walker = document.createTreeWalker(
    previewRef.current,
    NodeFilter.SHOW_TEXT,
    null
  );

  while (walker.nextNode()) {
    const currentNode = walker.currentNode as Text;

    if (currentNode === startNode) {
      // Count lines and columns in the selected node
      const contentBeforeCursor =
        currentNode.textContent?.slice(0, startOffset) || "";
      line += (contentBeforeCursor.match(/\n/g) || []).length;
      column = startOffset - (contentBeforeCursor.lastIndexOf("\n") + 1);
      found = true;
      break;
    }

    // Update line count based on current node's text
    const nodeText = currentNode.textContent || "";
    line += (nodeText.match(/\n/g) || []).length;

    // Update column only if no newlines are present
    if (!nodeText.includes("\n")) {
      column += nodeText.length;
    } else {
      column = nodeText.length - nodeText.lastIndexOf("\n");
    }
  }

  if (found) {
    setCursorPosition({ line, column });
  }
  return { line, column };
};
