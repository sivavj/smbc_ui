import { useEffect, useState } from "react";
import { DeleteIcon, UploadIcon } from "../icons";
import useJsonStore from "../store/jsonStore";
import { bytesToMB, removeEscapedChars } from "../utils";

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

  const jsonData = useJsonStore((state) => state.jsonData);
  const onSetJsonData = useJsonStore((state) => state.onSetJsonData);

  const onSetMarkdownContent = useJsonStore(
    (state) => state.onSetMarkdownContent
  );

  useEffect(() => {
    if (JSON.stringify(jsonData) === "{}") {
      setIsDialogOpen(true);
    } else {
      setIsDialogOpen(false);
    }
    return () => {
      setIsDialogOpen(false);
    };
  }, [jsonData]);

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

    // Check if the file is a PDF
    if (file.type !== "application/pdf") {
      setErrorMessage("Only PDF files are allowed.");
      return;
    }

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
        onSetJsonData(JSON.parse(data.json_data));
        onSetMarkdownContent(removeEscapedChars(data.markdown_text));
        setIsDialogOpen(false);
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
                  !uploadedFile || isUploading ? "bg-gray-200 text-gray-500" : "bg-green-500 text-white"
                }   rounded-md`}
                disabled={!uploadedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="#1C64F2"
                      />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
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
