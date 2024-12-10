import { useEffect, useState } from "react";
import useJsonStore from "../store/jsonStore";
import ConfirmationDialog from "./ConfirmationDialog";
import { FileUpload } from "./FileUpload";

export const Header = () => {
  const jsonData = useJsonStore((state) => state.jsonData);
  const selectedKey = useJsonStore((state) => state.selectedKey);
  const acceptKey = useJsonStore((state) => state.accept);
  const rejectKey = useJsonStore((state) => state.reject);
  const editValue = useJsonStore((state) => state.edit);
  const selectedContent = useJsonStore((state) => state.selectedContent);
  const onSelectContent = useJsonStore((state) => state.onSelectContent);
  const addNewContent = useJsonStore((state) => state.add);
  const counts = useJsonStore((state) => state.counts);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openPricingToolModal, setOpenPricingToolModal] = useState(false);

  const isReadyToSend = Object.values(jsonData).every(
    (item) => item.status !== "pending"
  );

  // Local state for input value
  const [inputValue, setInputValue] = useState<string>("");
  const [inputKey, setInputKey] = useState<string>("");

  const handleAdd = (key: string, value: string) => {
    addNewContent(key, value);
    setIsModalOpen(false);
    setInputKey("");
    onSelectContent("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInputKey("");
    onSelectContent("");
  };

  useEffect(() => {
    // Sync the local inputValue with the selected key data
    if (selectedKey) {
      setInputValue(
        jsonData[selectedKey]?.modified_value || jsonData[selectedKey]?.value
      );
    }
  }, [selectedKey, jsonData]);

  const handleAccept = () => {
    if (selectedKey) {
      acceptKey(selectedKey);
    }
  };

  const handleReject = () => {
    if (selectedKey) {
      rejectKey(selectedKey);
    }
    setOpenRejectModal(false);
  };

  const handleUpdate = () => {
    if (selectedKey) {
      // Update store with the current local input value
      editValue(selectedKey, inputValue);
    }
  };

  const handleUndo = () => {
    if (selectedKey) {
      // Revert the input value to the original one from the store
      setInputValue(
        jsonData[selectedKey]?.modified_value
          ? jsonData[selectedKey]?.modified_value
          : jsonData[selectedKey]?.value
      );
    }
  };

  const isModified =
    (selectedKey &&
      inputValue !==
        (jsonData[selectedKey]?.value ||
          inputValue !== jsonData[selectedKey]?.modified_value)) ||
    "";

  const isAccepted =
    selectedKey && jsonData[selectedKey]?.status === "accepted";

  return (
    <div className="bg-white py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <FileUpload />
        {selectedContent ? (
          <>
            <div className="flex items-center w-1/3 gap-2">
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={inputKey}
                placeholder="Enter Trade Detail Name"
                onChange={(e) => setInputKey(e.target.value)}
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Add
              </button>
            </div>
          </>
        ) : null}
        {selectedKey ? (
          <>
            <div className="flex items-center w-2/3 gap-2">
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              {isModified ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Update
                  </button>
                  <button
                    onClick={handleUndo}
                    className="ml-2 px-4 py-2 bg-gray-300 text-black rounded-md"
                  >
                    Undo
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAccept}
                    className={`ml-2 px-4 py-2 ${
                      isAccepted ? "bg-green-200" : "bg-green-500"
                    } text-white rounded-md`}
                    disabled={Boolean(isAccepted)}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setOpenRejectModal(true)}
                    className="ml-2 px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div></div>
        )}
        <button
          className={`ml-2 px-4 py-2 ${
            isReadyToSend ? "bg-blue-500" : "bg-blue-200"
          } text-white rounded-md`}
          disabled={!isReadyToSend}
          onClick={() => setOpenPricingToolModal(true)}
        >
          Send to Pricing Tool
        </button>
      </div>
      {/* Confirmation Modal */}

      <ConfirmationDialog
        isOpen={openRejectModal}
        title="Reject Trade Detail"
        message="Are you sure you want to reject trade detail?"
        onConfirm={handleReject}
        onClose={() => setOpenRejectModal(false)}
      />

      <ConfirmationDialog
        isOpen={isModalOpen}
        title="Add New Trade Detail"
        message="Are you sure you want to add new trade details?"
        additionalContent={
          <>
            <code>key:{inputKey}</code>
            <code>value: {selectedContent}</code>
          </>
        }
        onConfirm={() => handleAdd(inputKey, selectedContent)}
        onClose={handleCloseModal}
      />

      <ConfirmationDialog
        isOpen={openPricingToolModal}
        title="Send to Pricing Tool"
        message="Are you sure you want to send to the pricing tool?"
        additionalContent={
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <tbody>
              <tr>
                <td className="px-4 py-2 border text-start">
                  Edited trade details
                </td>
                <td className="px-4 py-2 border text-center">
                  <strong>{counts.edited}</strong>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border text-start">
                  Added trade details
                </td>
                <td className="px-4 py-2 border text-center">
                  <strong>{counts.added}</strong>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border text-start">
                  Accepted trade details
                </td>
                <td className="px-4 py-2 border text-center">
                  <strong>{counts.accepted}</strong>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border text-start">
                  Rejected trade details
                </td>
                <td className="px-4 py-2 border text-center">
                  <strong>{counts.rejected}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        }
        onConfirm={() => {
          console.log("pricing tool");
          setOpenPricingToolModal(false);
        }}
        onClose={() => setOpenPricingToolModal(false)}
      />
    </div>
  );
};
