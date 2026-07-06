import { api } from "../services/api";
import { useEffect, useState, useRef, startTransition } from "react";
import { UploadCloud, FileText, Trash2, ShieldCheck, AlertCircle, Database, Search, Filter, MoreVertical, File } from "lucide-react";

type Document = {
  name: string;
  chunks: number;
};

export default function Documents() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      const response = await api.get("/documents");
      setDocuments(response.data.documents);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    startTransition(() => {
      void loadDocuments();
    });
  }, []);

  const uploadFile = async (selectedFile: File) => {
    setUploading(true);
    setMessage({ text: "Processing PDF and generating embeddings...", type: "info" });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const response = await api.post("/upload-pdf", formData);

      setMessage({ text: `${response.data.filename} uploaded successfully`, type: "success" });
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadDocuments();
      
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    } catch (error) {
      console.error(error);
      setMessage({ text: "Upload failed. Please try again.", type: "error" });
    } finally {
      setUploading(false);
    }
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
        uploadFile(droppedFile);
      } else {
        setMessage({ text: "Only PDF files are supported.", type: "error" });
      }
    }
  };

  const deleteDocument = async (filename: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${filename}?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/documents/${filename}`);
      loadDocuments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-[1200px] mx-auto animate-fade-in">
      <div className="flex justify-between items-end pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Knowledge Base</h1>
          <p className="text-[#94A3B8]">Upload and manage PDF documents for the AI to learn from.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="bg-[#0F172A] border border-[#1F2937] text-white text-sm rounded-xl pl-9 pr-4 py-2.5 w-64 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all placeholder-[#64748B]"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#0F172A] border border-[#1F2937] text-[#E2E8F0] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1E293B] hover:border-[#374151] transition-colors shadow-sm">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="panel p-6 border border-[#1F2937]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <UploadCloud size={20} className="text-[#2563EB]" />
              Upload Document
            </h2>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] bg-[#0F172A]/50
                ${isDragActive ? "border-[#2563EB] bg-[#2563EB]/10 scale-[1.02]" : "border-[#334155] hover:border-[#475569] hover:bg-[#1E293B]/50"}
                ${uploading ? "opacity-50 pointer-events-none border-[#2563EB]" : ""}
              `}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <input
                disabled={uploading}
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    uploadFile(e.target.files[0]);
                  }
                }}
              />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-[#2563EB]/20 border-t-[#2563EB] animate-spin" />
                  <div className="space-y-1">
                    <p className="font-semibold text-white">Processing PDF...</p>
                    <p className="text-xs text-[#94A3B8]">Extracting & Embedding Chunks</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition-transform">
                    <UploadCloud size={24} className="text-[#94A3B8]" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-white">
                      {isDragActive ? "Drop PDF here" : "Drag & drop PDF here"}
                    </p>
                    <p className="text-xs text-[#64748B]">or click to browse files</p>
                  </div>
                </div>
              )}
            </div>

            {message.text && (
              <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 text-xs border animate-fade-in ${
                message.type === 'success' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : 
                message.type === 'error' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
                'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20'
              }`}>
                {message.type === 'success' ? <ShieldCheck size={18} className="shrink-0 mt-0.5" /> : 
                 message.type === 'error' ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : 
                 <div className="w-4 h-4 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin shrink-0 mt-0.5" />}
                <div>
                  <h4 className="font-semibold text-sm mb-0.5">
                    {message.type === 'success' ? 'Upload Complete' : message.type === 'error' ? 'Upload Failed' : 'Processing'}
                  </h4>
                  <p className="text-[13px] opacity-80">{message.text}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pb-10">
            {documents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#64748B] py-20 border-2 border-dashed border-[#1F2937] rounded-2xl bg-[#0F172A]/30">
                <File size={48} className="mb-4 opacity-50" />
                <p className="font-semibold text-white text-lg">No documents uploaded</p>
                <p className="text-sm mt-1">Upload a PDF to start building your knowledge base.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div 
                    key={doc.name} 
                    className="card p-5 flex items-start gap-4 group hover:border-[#2563EB]/50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center shrink-0 group-hover:bg-[#2563EB]/10 group-hover:border-[#2563EB]/30 transition-colors">
                      <File size={22} className="text-[#94A3B8] group-hover:text-[#2563EB] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="font-bold text-white truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-semibold text-[#94A3B8] bg-[#0F172A] border border-[#1F2937] px-2 py-0.5 rounded-md">
                          {doc.chunks} chunks
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#22C55E] flex items-center gap-1.5 bg-[#22C55E]/10 px-2 py-0.5 rounded-md border border-[#22C55E]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Indexed
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteDocument(doc.name)}
                        className="text-[#64748B] hover:text-[#EF4444] p-2 rounded-lg hover:bg-[#1E293B] transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="text-[#64748B] hover:text-white p-2 rounded-lg hover:bg-[#1E293B] transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}