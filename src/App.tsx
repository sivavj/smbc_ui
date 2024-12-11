import { useEffect, useState } from "react";
import { ContentArea, Footer, Header, Sidebar } from "./components";
import { content } from "./data/content";
import useJsonStore from "./store/jsonStore";
import  payload  from "./data/playload.json";

function App() {
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const onSetJsonData = useJsonStore((state) => state.onSetJsonData);

  const onSetMarkdownContent = useJsonStore(
    (state) => state.onSetMarkdownContent
  );

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
        style={{ height: "calc(100vh - 70px)" }}
      >
        {/* Sidebar */}
        <div className="bg-gray-100 h-full overflow-y-auto">
          <Sidebar />
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto">
          <ContentArea setCursorPosition={setCursorPosition} />
        </div>
      </main>
      <Footer cursorPosition={cursorPosition} />
    </div>
  );
}

export default App;
