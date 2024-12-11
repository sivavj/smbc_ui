import MDEditor from "@uiw/react-md-editor";
import React, { useEffect, useRef, useState } from "react";
import useJsonStore from "../store/jsonStore";
import { highlightContent } from "../utils";
import { ToggleSwitch } from "./ToggleSwitch";
import { Loading } from "./Loading";

export const ContentArea: React.FC<{
  setCursorPosition: React.Dispatch<
    React.SetStateAction<{
      line: number;
      column: number;
    }>
  >;
}> = ({ setCursorPosition }) => {
  const [showEdit, setShowEdit] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markdownRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const jsonData = useJsonStore((state) => state.jsonData);
  const selectedKey = useJsonStore((state) => state.selectedKey);
  const onSelectKey = useJsonStore((state) => state.onSelectKey);
  const onSelectContent = useJsonStore((state) => state.onSelectContent);
  const markdownContent = useJsonStore((state) => state.markdownContent);

  const findKeyPosition = (key: string) => {
    if (!previewRef.current) return null;

    const span = previewRef.current.querySelector(`span[id="${key}"]`);
    if (!span) return null;

    let line = 1;
    let column = 1;

    const walker = document.createTreeWalker(
      previewRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    while (walker.nextNode()) {
      const currentNode = walker.currentNode as Text;

      if (currentNode === span.firstChild) {
        const contentBeforeCursor = currentNode.textContent || "";
        line += (contentBeforeCursor.match(/\n/g) || []).length;
        column =
          contentBeforeCursor.length -
          (contentBeforeCursor.lastIndexOf("\n") + 1);
        break;
      }

      const nodeText = currentNode.textContent || "";
      line += (nodeText.match(/\n/g) || []).length;
    }
    setCursorPosition({ line, column });
    return { line, column };
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseUp = () => {
    onSelectKey(null);
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      onSelectContent(selection.toString());
    } else {
      onSelectContent("");
    }
  };

  useEffect(() => {
    if (selectedKey) {
      findKeyPosition(selectedKey);
      const selectedSpan = document.getElementById(selectedKey);
      if (selectedSpan) {
        selectedSpan.scrollIntoView({ behavior: "smooth", block: "center" });
        selectedSpan.focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const onToggle = (state: boolean) => {
    setShowEdit(state);
    onSelectKey(null);
  };

  return (
    <div className="h-full relative" onMouseUp={handleMouseUp}>
      <div className="bg-[#505050] absolute top-0 left-0 right-0 py-3 px-2 mb-1 flex items-center justify-between">
        <h1 className="text-xl text-white font-bold">Verification Document</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-white font-semibold">Show Edits</p>
          <ToggleSwitch onToggle={onToggle} initialState={showEdit} />
        </div>
      </div>
      <div
        ref={previewRef}
        className="bg-white p-4 rounded-md shadow-md border border-gray-200 h-full overflow-auto"
      >
        {markdownContent ? (
          <MDEditor.Markdown
            ref={markdownRef}
            source={highlightContent(
              jsonData,
              markdownContent,
              selectedKey,
              showEdit
            )}
            style={{
              marginTop: "3rem",
            }}
          />
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};
