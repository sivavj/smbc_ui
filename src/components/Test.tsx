import MDEditor from "@uiw/react-md-editor";
import { useEffect, useRef, useState } from "react";
import { content } from "../data/content";

const jsonKeys = {
  Party_A: {
    value: "JPMorgan Chase Bank, N.A., Mumbai Branch (\"JPMorgan\")",
    modified_value: null,
    status: "pending",
  },
  Party_B: {
    value: "Customer",
    modified_value: null,
    status: "pending",
  },
  Trade_date: {
    value: "16 October 23",
    modified_value: null,
    status: "pending",
  },
  Effective_date: {
    value: "23-October-2024",
    modified_value: null,
    status: "pending",
  },
  Termination_date: {
    value: "22-October-2034",
    modified_value: null,
    status: "pending",
  },
  Notional: {
    value: "1,000,000",
    modified_value: null,
    status: "pending",
  },
};

const App = () => {
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [matchedPosition, setMatchedPosition] = useState<{ line: number; column: number } | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const findKeyPosition = (key: string) => {
    if (!previewRef.current) return null;

    const span = previewRef.current.querySelector(`span[id="${key}"]`);
    if (!span) return null;

    let line = 1;
    let column = 1;

    const walker = document.createTreeWalker(previewRef.current, NodeFilter.SHOW_TEXT, null);

    while (walker.nextNode()) {
      const currentNode = walker.currentNode as Text;

      if (currentNode === span.firstChild) {
        const contentBeforeCursor = currentNode.textContent || "";
        line += (contentBeforeCursor.match(/\n/g) || []).length;
        column = contentBeforeCursor.length - (contentBeforeCursor.lastIndexOf("\n") + 1);
        break;
      }

      const nodeText = currentNode.textContent || "";
      line += (nodeText.match(/\n/g) || []).length;
    }
    setCursorPosition({ line, column });
    return { line, column };
  };

  const handleKeySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setSelectedKey(key);

    const position = findKeyPosition(key);
    setMatchedPosition(position || null);
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      // Update cursor position logic here if needed.
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  return (
    <div className="container mx-auto min-h-screen flex flex-col">
      <div className="bg-gray-100 fixed top-0 left-0 right-0 py-3 px-2 shadow-md mb-1 flex items-center justify-between">
        <div>
          Ln: {cursorPosition.line}, Col: {cursorPosition.column}
        </div>
        <div className="flex items-center">
          <label htmlFor="key-select" className="mr-2">
            Select JSON Key:
          </label>
          <select
            id="key-select"
            className="border px-2 py-1"
            onChange={handleKeySelect}
            value={selectedKey || ""}
          >
            <option value="" disabled>
              Select a key
            </option>
            {Object.keys(jsonKeys).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
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
        <MDEditor.Markdown
          source={content}
        />
      </div>
      {matchedPosition && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
          <strong>Matched Position:</strong> Ln: {matchedPosition.line}, Col: {matchedPosition.column}
        </div>
      )}
    </div>
  );
};

export default App;
