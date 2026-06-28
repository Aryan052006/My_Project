import { useState } from "react";
import { api } from "../services/api";

export default function Solver() {

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [downloadUrl, setDownloadUrl] =
    useState("");

  const [message, setMessage] =
    useState("");

  const generateAnswers =
    async () => {

      if (!file) return;

      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      try {

  const response =
    await api.post(
      "/generate-answer-sheet",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  console.log(
    "ANSWER SHEET RESPONSE:",
    response.data
  );

  setMessage(
    `Generated answers for ${response.data.questions_found} questions`
  );

  setDownloadUrl(
    "http://127.0.0.1:8000/download-answer-sheet"
  );

} catch (error) {

  console.error(error);

  setMessage(
    "Generation failed"
  );
}
      setLoading(false);
    };

  return (
    <div>

      <h1 className="text-4xl font-bold mb-8">
        Question Solver
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
          onClick={generateAnswers}
          className="
          mt-4
          bg-blue-600
          px-5
          py-2
          rounded-lg
          block
          "
        >
          Generate Answer Sheet
        </button>

        {loading && (

          <p className="mt-4">
            Generating answers...
          </p>

        )}

        {message && (

          <p className="mt-4">
            {message}
          </p>

        )}

        {downloadUrl && (

          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="
            inline-block
            mt-4
            bg-green-600
            px-5
            py-2
            rounded-lg
            "
          >
            Download PDF
          </a>

        )}

      </div>

    </div>
  );
}