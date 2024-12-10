import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  additionalContent?: JSX.Element;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  additionalContent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white relative rounded-lg shadow-xl w-1/3">
        <div className="bg-blue-500 mb-4 rounded-t-lg">
          <h2 className="text-lg py-3 px-6 text-white font-semibold">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-base mb-4">{message}</p>
          {additionalContent && (
            <div className="flex flex-col gap-2 mb-4">
              {additionalContent}
            </div>
          )}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onConfirm}
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              Yes
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white py-2 px-4 rounded-md"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
