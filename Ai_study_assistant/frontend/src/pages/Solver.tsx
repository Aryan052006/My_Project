import { useState, useRef } from "react";
import { api } from "../services/api";
import { FileQuestion, Download, BrainCircuit, Wand2, UploadCloud, CheckCircle, AlertCircle } from "lucide-react";

export default function Solver() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateAnswers = async () => {
    if (!file) return;

    setLoading(true);
    setDownloadUrl("");
    setMessage({ text: "Analyzing questions and generating answers...", type: "info" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/generate-answer-sheet", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage({ text: `Success! Generated answers for ${response.data.questions_found} questions`, type: "success" });
      setDownloadUrl("http://127.0.0.1:8000/download-answer-sheet");
    } catch (error) {
      console.error(error);
      setMessage({ text: "Answer generation failed. Please try again.", type: "error" });
    }
    setLoading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setDownloadUrl("");
        setMessage({ text: "", type: "" });
      } else {
        setMessage({ text: "Only PDF files are supported.", type: "error" });
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto mt-10 animate-fade-in">
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#8B5CF6]/10">
          <BrainCircuit size={32} className="text-[#8B5CF6]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-white">Question Solver</h1>
        <p className="text-[#94A3B8] text-base max-w-lg mx-auto">Upload a PDF containing questions (exams, assignments, quizzes) to automatically generate a complete answer sheet.</p>
      </div>

      <div className="panel p-8 flex flex-col items-center gap-6 border border-[#1F2937]">
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
          className={`w-full max-w-md border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
            isDragActive ? "border-[#8B5CF6] bg-[#8B5CF6]/10 scale-[1.02]" : 
            file ? "border-[#475569] bg-[#1E293B]/80" : "border-[#334155] hover:border-[#64748B] bg-[#0F172A]/50 hover:bg-[#1E293B]/50"
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            id="solver-upload"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
                setDownloadUrl("");
                setMessage({ text: "", type: "" });
              }
            }}
          />
          <div className="flex flex-col items-center gap-4 w-full">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${
              file ? "bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/20" : "bg-[#1E293B] text-[#94A3B8] border-[#334155]"
            }`}>
              {file ? <FileQuestion size={24} /> : <UploadCloud size={24} />}
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-bold text-white truncate max-w-[250px]">{file.name}</p>
                <p className="text-xs text-[#22C55E] mt-1 font-medium flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> Ready for analysis
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold text-white">Select Question PDF</p>
                <p className="text-xs text-[#64748B] mt-1">Drag & drop or click to browse</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={generateAnswers}
          disabled={!file || loading}
          className="w-full max-w-md bg-[#8B5CF6] text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 hover:bg-[#7C3AED] transition-all shadow-lg shadow-[#8B5CF6]/20"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Generating Answers...
            </>
          ) : (
            <>
              <Wand2 size={18} />
              Solve Questions
            </>
          )}
        </button>

        {message.text && (
          <div className={`w-full max-w-md p-4 rounded-xl flex items-start gap-3 text-xs border animate-fade-in ${
            message.type === 'success' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : 
            message.type === 'error' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
            'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20'
          }`}>
            {message.type === 'success' ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : 
             message.type === 'error' ? <AlertCircle size={16} className="shrink-0 mt-0.5" /> : 
             <div className="w-4 h-4 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin shrink-0 mt-0.5" />}
            <div>
              <h4 className="font-semibold text-sm mb-0.5">
                {message.type === 'success' ? 'Success' : message.type === 'error' ? 'Error' : 'Processing'}
              </h4>
              <p className="text-[13px] opacity-80">{message.text}</p>
            </div>
          </div>
        )}

        {downloadUrl && (
          <div className="w-full max-w-md animate-fade-in">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#22C55E]/20"
            >
              <Download size={18} />
              Download Answer PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}