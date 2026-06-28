import { useEffect, useState } from "react";
import { api } from "../services/api";

type DocumentsResponse = {
  total_documents: number;
  documents: Record<string, number>;
};

export default function Dashboard() {

  const [data, setData] =
    useState<DocumentsResponse | null>(null);

  useEffect(() => {

    api
      .get("/documents")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });

  }, []);

    useEffect(() => {

  api
    .get("/documents")
    .then((res) => {

      console.log("API RESPONSE:", res.data);

      setData(res.data);
    })
    .catch((err) => {

      console.error("API ERROR:", err);

    });

}, []);

  const totalChunks =
    data
      ? Object.values(
          data.documents
        ).reduce(
          (a, b) => a + b,
          0
        )
      : 0;

  return (
    <div>

      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-6">

        <div className="bg-slate-900 p-6 rounded-xl">

          <h2 className="text-slate-400">
            Total Documents
          </h2>

          <p className="text-4xl font-bold mt-2">
            {data?.total_documents ?? 0}
          </p>

        </div>

        <div className="bg-slate-900 p-6 rounded-xl">

          <h2 className="text-slate-400">
            Total Chunks
          </h2>

          <p className="text-4xl font-bold mt-2">
            {totalChunks}
          </p>

        </div>

      </div>

      <div className="mt-10">

        <h2 className="text-2xl font-semibold mb-4">
          Uploaded Documents
        </h2>

        <div className="bg-slate-900 rounded-xl p-6">

          {data &&
            Object.entries(
              data.documents
            ).map(
              ([name, chunks]) => (
                <div
                  key={name}
                  className="flex justify-between border-b border-slate-800 py-3"
                >
                  <span>{name}</span>

                  <span>
                    {chunks} chunks
                  </span>
                </div>
              )
            )}

        </div>

      </div>

    </div>
  );
}