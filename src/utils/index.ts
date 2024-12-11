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

export const getCursorPosition = (
  selection: Selection | null,
  markdownElement: HTMLElement
) => {
  if (!selection) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Get position relative to the top left of the markdown content
  const offsetTop = rect.top - markdownElement.getBoundingClientRect().top;
  const offsetLeft = rect.left - markdownElement.getBoundingClientRect().left;

  return {
    top: offsetTop,
    left: offsetLeft,
  };
};

export function bytesToMB(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2);
}

export const removeEscapedChars = (str: string) => {
  return str.replace(/\\"/g, '"').replace(/\\\\/g, "");
};
