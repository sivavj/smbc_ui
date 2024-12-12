import MDEditor from "@uiw/react-md-editor";
import React, { useEffect, useRef, useState } from "react";
import useJsonStore from "../store/jsonStore";
import { findKeyPosition, getCursorPosition, highlightContent } from "../utils";
import { ToggleSwitch } from "./ToggleSwitch";
import { Loading } from "./Loading";

export const ContentArea: React.FC<{
  setCursorPosition: React.Dispatch<
    React.SetStateAction<{
      line: number;
      column: number;
    }>
  >;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
}> = ({ setCursorPosition, setPageNumber }) => {
  const [showEdit, setShowEdit] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markdownRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const jsonData = useJsonStore((state) => state.jsonData);
  const selectedKey = useJsonStore((state) => state.selectedKey);
  const onSelectKey = useJsonStore((state) => state.onSelectKey);
  const onSelectContent = useJsonStore((state) => state.onSelectContent);
  const markdownContent = useJsonStore((state) => state.markdownContent);

  // Debug and set up scroll listener
  useEffect(() => {
    const contentArea = previewRef.current;

    if (!contentArea) {
      console.error("ContentAreaRef is null or undefined");
      return;
    }

    const handleScroll = () => {
      const visibleHeight = contentArea.clientHeight;
      const scrollTop = contentArea.scrollTop;
      const currentPage = Math.floor(scrollTop / visibleHeight) + 1;
      setPageNumber(currentPage);
    };

    contentArea.addEventListener("scroll", handleScroll);

    return () => {
      contentArea.removeEventListener("scroll", handleScroll);
    };
  }, [setPageNumber]);


  useEffect(() => {
    const handleSelectionChange = () => {
      getCursorPosition(previewRef, setCursorPosition);
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
      const currentValue = jsonData[selectedKey].modified_value
        ? jsonData[selectedKey].modified_value
        : jsonData[selectedKey].value;
      findKeyPosition(selectedKey, currentValue, previewRef, setCursorPosition);
      const selectedSpan = document.getElementById(selectedKey);
      if (selectedSpan) {
        selectedSpan.scrollIntoView({ behavior: "smooth", block: "center" });
        selectedSpan.focus();
      } else {
        setCursorPosition({ line: 0, column: 0 });
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
