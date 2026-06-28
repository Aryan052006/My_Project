import { useState } from "react";
import { api } from "../services/api";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: {
    pdf: string;
    chunk_id: number;
    score: number;
  }[];
};


export default function Chat() {

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  const sendQuestion = async () => {

    if (!question.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: question,
    };

    setMessages(prev => [
      ...prev,
      userMessage,
    ]);

    setLoading(true);

    try {

      const response =
  await api.post(
    "/chat",
    {
      question
    }
  );

console.log(
  "CHAT RESPONSE:",
  response.data
);

setMessages(prev => [
  ...prev,
  {
      role: "assistant",
      content: response.data.answer,
      sources: response.data.sources
  }
]);
    } catch (error) {

      console.error(error);

    }

    setQuestion("");
    setLoading(false);
  };

  return (
    <div className="h-[85vh] flex flex-col">

      <h1 className="text-4xl font-bold mb-6">
        Chat Assistant
      </h1>

      <div
        className="
        flex-1
        bg-slate-900
        rounded-xl
        p-6
        overflow-y-auto
        "
      >
        {messages.map(
          (message, index) => (

            <div
              key={index}
              className="mb-4"
            >
              <strong>
                {message.role === "user"
                  ? "You"
                  : "AI"}
                :
              </strong>

              <div>
  <p>{message.content}</p>

  {message.sources &&
    message.sources.length > 0 && (

      <div className="mt-3">

        <p className="text-sm text-slate-400">
          Sources
        </p>

        {message.sources.map(
          (source, index) => (

            <div
              key={index}
              className="
              text-xs
              text-blue-400
              mt-1
              "
            >
              {source.pdf}
              {" | Chunk "}
              {source.chunk_id}
              {" | Score "}
              {source.score}
            </div>

          )
        )}

      </div>

    )}
</div>
            </div>

          )
        )}

        {loading && (
          <p>
            Thinking...
          </p>
        )}
      </div>

      <div
        className="
        flex
        gap-3
        mt-4
        "
      >

        <input
          value={question}
          onChange={(e) =>
            setQuestion(
              e.target.value
            )
          }
          placeholder="Ask a question..."
          className="
          flex-1
          bg-slate-800
          rounded-lg
          p-3
          "
        />

        <button
          onClick={sendQuestion}
          className="
          bg-blue-600
          px-5
          rounded-lg
          "
        >
          Send
        </button>

      </div>

    </div>

  );
}

