import MDEditor from "@uiw/react-md-editor";
import React, { useEffect, useRef, useState } from "react";
import useJsonStore from "../store/jsonStore";
import { highlightContent } from "../utils";
import { ToggleSwitch } from "./ToggleSwitch";
import { Loading } from "./Loading";

export const ContentArea: React.FC = () => {
  const [showEdit, setShowEdit] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markdownRef = useRef<any>(null);

  const jsonData = useJsonStore((state) => state.jsonData);
  const selectedKey = useJsonStore((state) => state.selectedKey);
  const onSelectKey = useJsonStore((state) => state.onSelectKey);
  const onSelectContent = useJsonStore((state) => state.onSelectContent);
  const markdownContent = useJsonStore((state) => state.markdownContent);

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
      const selectedSpan = document.getElementById(selectedKey);
      if (selectedSpan) {
        selectedSpan.scrollIntoView({ behavior: "smooth", block: "center" });
        selectedSpan.focus();
      }
    }
  }, [selectedKey]);

  const onToggle = (state: boolean) => {
    setShowEdit(state);
    onSelectKey(null);
  };

  return (
    <div className="h-full" onMouseUp={handleMouseUp}>
      <div className="bg-[#505050] py-3 px-2 mb-1 flex items-center justify-between">
        <h1 className="text-xl text-white font-bold">Verification Document</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-white font-semibold">Show Edits</p>
          <ToggleSwitch onToggle={onToggle} initialState={showEdit} />
        </div>
      </div>
      <div className="bg-white p-4 rounded-md shadow-md border border-gray-200 h-full overflow-auto">
        {markdownContent ? (
          <MDEditor.Markdown
            ref={markdownRef}
            source={highlightContent(
              jsonData,
              markdownContent,
              selectedKey,
              showEdit
            )}
          />
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};
