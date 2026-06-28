import { useState } from "react";
import { api } from "../services/api";

export default function Documents() {

  const [file, setFile] =
    useState<File | null>(null);

  const [message, setMessage] =
    useState("");

  const uploadFile = async () => {

    if (!file) return;

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    try {

      const response =
        await api.post(
          "/upload-pdf",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      setMessage(
        `Uploaded ${response.data.filename}`
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "Upload failed"
      );
    }
  };

  return (
    <div>

      <h1 className="text-4xl font-bold mb-8">
        Documents
      </h1>

      <div className="bg-slate-900 p-8 rounded-xl">

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {

            if (
              e.target.files &&
              e.target.files[0]
            ) {

              setFile(
                e.target.files[0]
              );
            }
          }}
        />

        <button
          onClick={uploadFile}
          className="
          mt-4
          bg-blue-600
          px-5
          py-2
          rounded-lg
          "
        >
          Upload PDF
        </button>

        <p className="mt-4">
          {message}
        </p>

      </div>

    </div>
  );
}