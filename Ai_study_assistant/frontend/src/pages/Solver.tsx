import { useState, useRef } from "react";
import { api } from "../services/api";
import { FileQuestion, BrainCircuit, Wand2, UploadCloud, CheckCircle, AlertCircle, RefreshCw, FileText, File } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Question = {
  id: number;
  text: string;
  marks: number;
  answer?: string;
  loading?: boolean;
};

export default function Solver() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"UPLOAD" | "PREVIEW" | "GENERATED">("UPLOAD");
  const [questions, setQuestions] = useState<Question[]>([]);

  const extractQuestions = async () => {
    if (!file) return;
    setLoading(true);
    setMessage({ text: "Extracting questions...", type: "info" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/extract-questions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setQuestions(response.data.questions);
        setStep("PREVIEW");
        setMessage({ text: "", type: "" });
      } else {
        setMessage({ text: response.data.error || "Failed to extract questions.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: "Extraction failed. Please try again.", type: "error" });
    }
    setLoading(false);
  };

  const handleQuestionChange = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const generateAnswers = async () => {
    setStep("GENERATED");
    
    // Generate sequentially to show progress
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.answer) continue; // Skip if already answered
      
      setQuestions(prev => prev.map(p => p.id === q.id ? { ...p, loading: true } : p));
      
      try {
        const res = await api.post("/generate-individual-answer", { question: q.text, marks: q.marks });
        if (res.data.success) {
          setQuestions(prev => prev.map(p => p.id === q.id ? { ...p, loading: false, answer: res.data.answer } : p));
        } else {
          setQuestions(prev => prev.map(p => p.id === q.id ? { ...p, loading: false, answer: "Error generating answer." } : p));
        }
      } catch (err) {
         setQuestions(prev => prev.map(p => p.id === q.id ? { ...p, loading: false, answer: "Error generating answer." } : p));
      }
    }
  };

  const regenerateAnswer = async (id: number) => {
    const q = questions.find(q => q.id === id);
    if (!q) return;

    setQuestions(prev => prev.map(p => p.id === id ? { ...p, loading: true } : p));
    
    try {
      const res = await api.post("/generate-individual-answer", { question: q.text, marks: q.marks });
      if (res.data.success) {
        setQuestions(prev => prev.map(p => p.id === id ? { ...p, loading: false, answer: res.data.answer } : p));
      }
    } catch (err) {
      setQuestions(prev => prev.map(p => p.id === id ? { ...p, loading: false } : p));
    }
  };

  const exportAnswers = async (format: string) => {
    setMessage({ text: `Exporting to ${format.toUpperCase()}...`, type: "info" });
    try {
      const qaPairs = questions.map(q => ({ question: q.text, answer: q.answer || "" }));
      const res = await api.post("/export-answers", { qa_pairs: qaPairs, format });
      
      if (res.data.success) {
        window.open(api.defaults.baseURL + res.data.download_url, "_blank");
        setMessage({ text: "", type: "" });
      } else {
        setMessage({ text: "Export failed.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Export failed.", type: "error" });
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = () => { setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile); setMessage({ text: "", type: "" }); setStep("UPLOAD");
      } else {
        setMessage({ text: "Only PDF files are supported.", type: "error" });
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto mt-10 animate-fade-in pb-20">
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#8B5CF6]/10">
          <BrainCircuit size={32} className="text-[#8B5CF6]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-white">Question Solver</h1>
        <p className="text-[#94A3B8] text-base max-w-lg mx-auto">Upload a PDF containing questions to extract, edit, and automatically generate a complete answer sheet.</p>
      </div>

      {step === "UPLOAD" && (
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
            <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={(e) => {
              if (e.target.files && e.target.files[0]) { setFile(e.target.files[0]); setMessage({ text: "", type: "" }); }
            }} />
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
                    <CheckCircle size={12} /> Ready for extraction
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

          <button onClick={extractQuestions} disabled={!file || loading} className="w-full max-w-md bg-[#8B5CF6] text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 hover:bg-[#7C3AED] transition-all shadow-lg shadow-[#8B5CF6]/20">
            {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Extracting...</> : <><Wand2 size={18} /> Extract Questions</>}
          </button>
        </div>
      )}

      {step === "PREVIEW" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="flex justify-between items-center bg-[#1E293B] p-4 rounded-xl border border-[#334155]">
            <div>
              <h2 className="text-lg font-bold text-white">Review Questions</h2>
              <p className="text-xs text-[#94A3B8]">Edit extracted questions and marks before generating answers.</p>
            </div>
            <button onClick={generateAnswers} className="bg-[#8B5CF6] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#7C3AED]">
              <Wand2 size={16} /> Generate Answers
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-[#0F172A] border border-[#1F2937] p-5 rounded-xl shadow-inner flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <span className="bg-[#1E293B] text-[#94A3B8] px-2 py-1 rounded text-xs font-bold border border-[#334155]">Q{index + 1}</span>
                  <div className="flex-1 flex flex-col gap-2">
                    <textarea 
                      value={q.text} 
                      onChange={(e) => handleQuestionChange(q.id, "text", e.target.value)}
                      className="w-full bg-[#1E293B]/50 border border-[#334155] rounded-lg p-3 text-sm text-white focus:border-[#8B5CF6] outline-none min-h-[80px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-24">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase">Marks</label>
                    <input 
                      type="number" 
                      value={q.marks} 
                      onChange={(e) => handleQuestionChange(q.id, "marks", parseInt(e.target.value) || 0)}
                      className="w-full bg-[#1E293B]/50 border border-[#334155] rounded-lg p-2 text-sm text-center text-white focus:border-[#8B5CF6] outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "GENERATED" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="flex justify-between items-center bg-[#1E293B] p-4 rounded-xl border border-[#334155]">
            <div>
              <h2 className="text-lg font-bold text-white">Generated Answers</h2>
              <p className="text-xs text-[#94A3B8]">Review, regenerate, and export your answer sheet.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportAnswers('pdf')} className="bg-[#EF4444] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#DC2626]">
                <FileText size={14} /> PDF
              </button>
              <button onClick={() => exportAnswers('docx')} className="bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#1D4ED8]">
                <File size={14} /> DOCX
              </button>
              <button onClick={() => exportAnswers('md')} className="bg-[#10B981] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#059669]">
                <FileText size={14} /> MD
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-[#0F172A] border border-[#1F2937] rounded-xl shadow-inner overflow-hidden">
                <div className="bg-[#1E293B]/50 p-4 border-b border-[#1F2937] flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-[#8B5CF6]/20 text-[#8B5CF6] px-2 py-1 rounded text-xs font-bold border border-[#8B5CF6]/20">Q{index + 1}</span>
                    <p className="text-sm font-semibold text-white mt-0.5">{q.text}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="bg-[#334155] text-white px-2 py-0.5 rounded text-xs font-bold border border-[#475569]">{q.marks} Marks</span>
                    <button 
                      onClick={() => regenerateAnswer(q.id)}
                      disabled={q.loading}
                      className="text-xs text-[#8B5CF6] hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={q.loading ? "animate-spin" : ""} /> Regenerate
                    </button>
                  </div>
                </div>
                <div className="p-5 text-sm text-[#E2E8F0] whitespace-pre-wrap">
                  {q.loading ? (
                    <div className="flex items-center gap-3 text-[#64748B]">
                      <div className="w-4 h-4 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin" />
                      Generating answer...
                    </div>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                      }}
                    >
                      {q.answer || "No answer generated."}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {message.text && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl flex items-start gap-3 text-xs border shadow-2xl animate-fade-in z-50 ${
          message.type === 'success' ? 'bg-[#22C55E]/90 text-white border-[#22C55E]' : 
          message.type === 'error' ? 'bg-[#EF4444]/90 text-white border-[#EF4444]' :
          'bg-[#8B5CF6]/90 text-white border-[#8B5CF6]'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : 
           message.type === 'error' ? <AlertCircle size={16} className="shrink-0 mt-0.5" /> : 
           <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0 mt-0.5" />}
          <div>
            <h4 className="font-semibold text-sm mb-0.5">
              {message.type === 'success' ? 'Success' : message.type === 'error' ? 'Error' : 'Processing'}
            </h4>
            <p className="text-[13px] opacity-90">{message.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}