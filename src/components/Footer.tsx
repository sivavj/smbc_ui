import useJsonStore from "../store/jsonStore";

export const Footer = () => {
  const counts = useJsonStore((state) => state.counts);
  return (
    <div className="fixed bottom-0 left-0 right-0">
      <div className="container mx-auto shadow-md">
        <div className="grid min-h-0 flex-grow grid-cols-[1fr_3fr] space-x-2 overflow-hidden">
          <div className="bg-gray-100 py-3 px-2 h-full overflow-x-auto">
            <div className="w-full flex justify-between items-center text-black gap-x-4">
              <p className="flex gap-2 text-center">
                Edited: <strong>{counts.edited}</strong>
              </p>
              <p className="flex gap-2 text-center">
                Added: <strong>{counts.added}</strong>
              </p>
              <p className="flex gap-2 text-center">
                Accepted: <strong>{counts.accepted}</strong>
              </p>
              <p className="flex gap-2 text-center">
                Rejected: <strong>{counts.rejected}</strong>
              </p>
            </div>
          </div>
          <div className="bg-gray-100 py-3 px-2 h-full overflow-x-auto">
            <div className="w-full flex justify-between items-center text-black gap-x-4">
              <div className="flex items-center gap-2">
                <p className="flex gap-2 text-center">
                  Ln: <strong>0</strong>
                </p>
                <p className="flex gap-2 text-center">
                  Col: <strong>0</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
