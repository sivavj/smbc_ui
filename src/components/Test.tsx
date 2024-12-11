import MDEditor from "@uiw/react-md-editor"; // Import MarkdownPreview
import { useEffect, useRef, useState } from "react";
import { content } from "../data/content";

const App = () => {
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const previewRef = useRef<HTMLDivElement | null>(null);

  const getCursorPosition = () => {
    if (previewRef.current) {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      // Temporary div for rendering markdown as HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;

      let line = 0;
      let column = 0;
      let currentPos = 0;

      // Use a TreeWalker to traverse the text nodes in the HTML
      const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null
      );

      while (walker.nextNode()) {
        const textNode = walker.currentNode as Text;
        const textContent = textNode.textContent || "";

        const textLength = textContent.length;

        // Check if the selection start is within this text node
        if (
          range.startOffset >= currentPos &&
          range.startOffset < currentPos + textLength
        ) {
          line =
            (textContent.substring(0, range.startOffset).match(/\n/g) || [])
              .length + 1;
          column =
            range.startOffset -
            textContent.lastIndexOf("\n", range.startOffset);
          break;
        }

        currentPos += textLength;
      }

      setCursorPosition({ line, column });
    }
  };

  useEffect(() => {
    // Add a listener to detect selection in the preview pane
    const handleMouseUp = () => {
      getCursorPosition();
    };

    const previewElement = previewRef.current;
    previewElement?.addEventListener("mouseup", handleMouseUp);

    return () => {
      previewElement?.removeEventListener("mouseup", handleMouseUp);
    };
  }, [content]);

  return (
    <div className="container mx-auto min-h-screen flex flex-col">
      <div className="bg-gray-100  fixed top-0 left-0 right-0 py-3 px-2 shadow-md mb-1 flex items-center justify-between">
        Ln:{" "}{cursorPosition.line}, Col:{" "}{cursorPosition.column}
      </div>
      <div
        ref={previewRef}
        style={{
          border: "1px solid #ccc",
          minHeight: "200px",
          padding: "10px",
          marginTop: "60px",
        }}
      >
        <MDEditor.Markdown source={content} />
      </div>
    </div>
  );
};

export default App;
