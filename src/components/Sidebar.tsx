import { useState } from "react";
import {
  AcceptedIcon,
  DownArrowIcon,
  EditIcon,
  PendingIcon,
  RejectedIcon,
  TickIcon,
  UpArrowIcon,
} from "../icons";
import useJsonStore from "../store/jsonStore";
import ConfirmationDialog from "./ConfirmationDialog";
import { SidebarSkeleton } from "./SidebarSkeleton";

const renderIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <PendingIcon />;
    case "accepted":
      return <AcceptedIcon />;
    case "rejected":
      return <RejectedIcon />;
    case "edited":
      return <EditIcon />;
    default:
      return <PendingIcon />;
  }
};

export const Sidebar: React.FC = () => {
  const jsonData = useJsonStore((state) => state.jsonData);
  const selectedKey = useJsonStore((state) => state.selectedKey);
  const onSelectKey = useJsonStore((state) => state.onSelectKey);
  const acceptAll = useJsonStore((state) => state.acceptAll);
  const onSelectContent = useJsonStore((state) => state.onSelectContent);

  const isReadyToSend = Object.values(jsonData).every(
    (item) => item.status !== "pending"
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const keys = Object.keys(jsonData);

  const handleClick = (key: string) => {
    onSelectKey(key);
    onSelectContent("");
  };

  // Function to handle down arrow click
  const handleDownClick = () => {
    if (selectedKey === null) return;
    const currentIndex = keys.indexOf(selectedKey);
    const nextIndex = (currentIndex + 1) % keys.length; // Loop back to the first item
    onSelectKey(keys[nextIndex]);
    onSelectContent("");
  };

  // Function to handle up arrow click
  const handleUpClick = () => {
    if (selectedKey === null) return;
    const currentIndex = keys.indexOf(selectedKey);
    const prevIndex = (currentIndex - 1 + keys.length) % keys.length; // Loop to the last item
    onSelectKey(keys[prevIndex]);
    onSelectContent("");
  };

  // Function to open the confirmation modal
  const handleAcceptAllClick = () => {
    setIsModalOpen(true);
  };

  // Function to confirm accepting all
  const handleConfirmAcceptAll = () => {
    acceptAll(); // Accept all trade details
    setIsModalOpen(false); // Close the modal
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal without taking any action
  };

  return (
    <div className="bg-white h-full relative">
      <div className="bg-[#505050] py-3 px-2 flex items-center justify-between">
        <h1 className="text-xl text-white font-bold">Trade Details</h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full bg-white"
            onClick={handleUpClick}
            disabled={selectedKey === null}
          >
            <UpArrowIcon />
          </button>
          <button
            className="rounded-full bg-white"
            onClick={handleDownClick}
            disabled={selectedKey === null}
          >
            <DownArrowIcon />
          </button>
        </div>
      </div>
      <div className="m-4">
        <button
          className={`${
            !isReadyToSend ? "bg-blue-500" : "bg-blue-200"
          } text-white p-3 w-full flex items-center justify-center gap-2 rounded-md`}
          onClick={handleAcceptAllClick}
          disabled={isReadyToSend}
        >
          <TickIcon />
          Accept All
        </button>
      </div>
      {/* JSON Payload */}
      {JSON.stringify(jsonData) !== "{}" ? (
        <ul>
          {Object.entries(jsonData).map(([key, value]) => {
            const { value: original_value, modified_value, status } = value;
            return (
              <li
                className={`p-4 rounded-md shadow-sm cursor-pointer ${
                  selectedKey === key ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
                key={key}
                onClick={() => handleClick(key)}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold">{key}</h2>
                  {renderIcon(status)}
                </div>
                <p className="text-sm text-gray-600">
                  {modified_value || original_value}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <SidebarSkeleton />
      )}

      {/* Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isModalOpen}
        title="Accept All"
        message="Are you sure you want to accept all trade details?"
        onConfirm={handleConfirmAcceptAll}
        onClose={handleCloseModal}
      />
    </div>
  );
};
