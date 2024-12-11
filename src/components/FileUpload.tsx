import { useState } from "react";
import { DeleteIcon, UploadIcon } from "../icons";
import { bytesToMB } from "../utils";

interface UploadedFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "failed" | "completed";
}

export const FileUpload = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const MAX_FILE_SIZE_MB = 10;

  const toggleDialog = () => {
    setIsDialogOpen((prevState) => !prevState);
    setUploadedFile(null);
    setErrorMessage("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setErrorMessage(`File size exceeds ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    const newFile: UploadedFile = {
      file,
      progress: 0,
      status: "pending",
    };

    setUploadedFile(newFile);
    setErrorMessage("");
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files ? event.dataTransfer.files[0] : null;

    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setErrorMessage(`File size exceeds ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    const newFile: UploadedFile = {
      file,
      progress: 0,
      status: "pending",
    };

    setUploadedFile(newFile);
    setErrorMessage("");
  };

  const uploadFile = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    const fileToUpload = { ...uploadedFile, status: "uploading" };
    setUploadedFile(fileToUpload as UploadedFile);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile.file);

      const response = await fetch("http://192.168.1.146:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadedFile({ ...fileToUpload, status: "completed" });
        const data = await response.json();
        console.log("data", data);
      } else {
        setUploadedFile({ ...fileToUpload, status: "failed" });
      }
    } catch {
      setUploadedFile({ ...fileToUpload, status: "failed" });
    }

    setIsUploading(false);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={toggleDialog}
      >
        <UploadIcon />
        Upload
      </button>

      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
              >
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Supported file type: PDF
                </p>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </div>

            {errorMessage && (
              <p className="mt-4 text-red-500 text-center">{errorMessage}</p>
            )}

            {uploadedFile && (
              <div className="mt-4">
                <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                  <div>
                    <p>{uploadedFile.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {bytesToMB(uploadedFile.file.size)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-xs">
                      {uploadedFile.status === "uploading"
                        ? "Uploading..."
                        : uploadedFile.status === "completed"
                        ? "Uploaded"
                        : uploadedFile.status === "failed"
                        ? "Failed"
                        : ""}
                    </p>
                    {uploadedFile.status === "failed" && (
                      <button
                        className="text-red-500 text-sm"
                        onClick={uploadFile}
                      >
                        Retry
                      </button>
                    )}
                    <button className="ml-2" onClick={removeFile}>
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={uploadFile}
                className={`px-4 py-2 ${
                  !uploadedFile || isUploading ? "bg-gray-200" : "bg-green-500"
                }  text-white rounded-md`}
                disabled={!uploadedFile || isUploading}
              >
                Upload
              </button>
              <button
                onClick={toggleDialog}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
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
