import MDEditor from "@uiw/react-md-editor";
import { useEffect, useRef, useState } from "react";
import { content } from "../data/content";

const App = () => {
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const previewRef = useRef<HTMLDivElement | null>(null);

  const getCursorPosition = () => {
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
    const walker = document.createTreeWalker(previewRef.current, NodeFilter.SHOW_TEXT, null);

    while (walker.nextNode()) {
      const currentNode = walker.currentNode as Text;

      if (currentNode === startNode) {
        // Count lines and columns in the selected node
        const contentBeforeCursor = currentNode.textContent?.slice(0, startOffset) || "";
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

    if (found) setCursorPosition({ line, column });
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      getCursorPosition();
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  return (
    <div className="container mx-auto min-h-screen flex flex-col">
      <div className="bg-gray-100 fixed top-0 left-0 right-0 py-3 px-2 shadow-md mb-1 flex items-center justify-between">
        <span>
          Ln: {cursorPosition.line}, Col: {cursorPosition.column}
        </span>
      </div>
      <div
        ref={previewRef}
        className="border border-gray-300 min-h-[200px] p-4 mt-[60px] overflow-auto"
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          userSelect: "text",
        }}
      >
        <MDEditor.Markdown source={content} />
      </div>
    </div>
  );
};

export default App;
