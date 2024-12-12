import { useEffect, useState } from "react";
import { ContentArea, Footer, Header, Sidebar } from "./components";
import { content } from "./data/content";
import payload from "./data/playload.json";
import useJsonStore from "./store/jsonStore";

function App() {
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [pageNumber, setPageNumber] = useState(1);

  const onSetJsonData = useJsonStore((state) => state.onSetJsonData);
  const onSetMarkdownContent = useJsonStore(
    (state) => state.onSetMarkdownContent
  );

  // Load data into store
  useEffect(() => {
    onSetJsonData(payload);
    onSetMarkdownContent(content);

    return () => {
      onSetMarkdownContent("");
      onSetJsonData({});
    };
  }, [onSetJsonData, onSetMarkdownContent]);

  return (
    <div className="container mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main
        className="grid min-h-0 flex-grow grid-cols-[1fr_3fr] space-x-2 overflow-hidden"
        style={{ height: "calc(100vh - 75px)" }}
      >
        {/* Sidebar */}
        <div className="bg-white overflow-y-auto">
          <Sidebar />
        </div>

        {/* Content Area */}
        <div
          className="overflow-y-auto"
          style={{
            height: "100%",
          }}
        >
          <ContentArea
            setCursorPosition={setCursorPosition}
            setPageNumber={setPageNumber}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer cursorPosition={cursorPosition} pageNumber={pageNumber} />
    </div>
  );
}

export default App;
