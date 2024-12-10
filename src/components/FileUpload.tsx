import { useState } from "react";
import { UploadIcon } from "../icons";
import { bytesToMB } from "../utils";

export const FileUpload = () => {
  // State to toggle the dialog visibility
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Function to toggle the dialog visibility
  const toggleDialog = () => {
    setIsDialogOpen((prevState) => !prevState);
    setUploadedFile(null);
    setErrorMessage("");
  };

  // Handle file upload and send to API
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      // Store the file locally
      setUploadedFile(file);

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Set uploading state to true
        setIsUploading(true);

        // Send the file via an API request (you need to replace the URL with your own)
        const response = await fetch("http://localhost:3000/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          // Handle the response if needed (e.g., show success message)
          console.log("File uploaded successfully", file);

          // Close the dialog after successful upload
          setIsDialogOpen(false);
        } else {
          // Handle error response
          console.error("File upload failed", response.statusText);
          setErrorMessage(response.statusText);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error uploading file:", error);
        setErrorMessage(error.message);
      } finally {
        // Reset uploading state
        setIsUploading(false);
      }
    }
  };

  return (
    <div>
      {/* Upload button */}
      <button
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={toggleDialog}
      >
        <UploadIcon />
        Upload
      </button>

      {/* Conditional rendering for the dialog below the button */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    DOC, PDF only
                  </p>
                </div>
                {/* Input field for file upload, only allowing .doc and .pdf file types */}
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept=".doc,.pdf" // Restrict file types
                  onChange={handleFileChange} // Handle file change event
                  disabled={isUploading} // Disable the input while uploading
                />
              </label>
            </div>
            {errorMessage && (
              <p className="mt-4 text-red-500 text-center">{errorMessage}</p>
            )}
            {uploadedFile && (
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <p>{uploadedFile.name}</p> -
                  <p>{bytesToMB(uploadedFile.size)} MB</p>
                </div>
              </div>
            )}
            <div className="mt-4 text-center">
              <button
                onClick={toggleDialog}
                className=" px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
