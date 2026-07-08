import { api } from "../services/api";
import { useEffect, useState, useRef, startTransition } from "react";
import { UploadCloud, FileText, Trash2, ShieldCheck, AlertCircle, Search, File, Edit2, RefreshCw, Eye, X } from "lucide-react";

type Document = {
  name: string;
  chunks: number;
};

export default function Documents() {
  const [, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processingDocs, setProcessingDocs] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modals state
  const [previewDoc, setPreviewDoc] = useState<{name: string, content: string} | null>(null);

  const loadDocuments = async () => {
    try {
      const response = await api.get("/documents");
      setDocuments(response.data.documents);
    } catch (error) {
      console.error(error);
    }
  };

  const checkUploadStatus = async () => {
    try {
      const response = await api.get("/upload-status");
      if (response.data.success) {
        const statuses = response.data.statuses;
        const currentlyProcessing = Object.keys(statuses).filter(k => statuses[k] === "processing");
        const newlyReady = Object.keys(statuses).filter(k => statuses[k] === "ready");
        
        setProcessingDocs(prev => {
            const newCompletions = newlyReady.filter(doc => prev.includes(doc));
            if (newCompletions.length > 0) {
               window.alert(`Success! Your document(s) have been processed and are ready to use: \n${newCompletions.join(', ')}`);
               // Run loadDocuments outside of the state update
               setTimeout(() => loadDocuments(), 0);
            }
            return currentlyProcessing;
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    startTransition(() => {
      void loadDocuments();
      void checkUploadStatus();
    });
    
    // Poll status every 3 seconds
    const interval = setInterval(() => {
       checkUploadStatus();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const uploadFile = async (selectedFile: File) => {
    setUploading(true);
    setMessage({ text: "Uploading PDF to server...", type: "info" });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const response = await api.post("/upload-pdf", formData);

      setMessage({ text: `${response.data.filename} is now processing in the background! You will be notified when it's ready.`, type: "success" });
      setFile(null);
      setProcessingDocs(prev => [...prev, response.data.filename]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await checkUploadStatus();
      
      setTimeout(() => setMessage({ text: "", type: "" }), 6000);
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
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;
    try {
      await api.delete(`/documents/${filename}`);
      loadDocuments();
    } catch (error) {
      console.error(error);
    }
  };

  const renameDocument = async (oldName: string) => {
    const newName = window.prompt("Enter new document name (include .pdf):", oldName);
    if (!newName || newName === oldName) return;
    try {
      await api.put(`/documents/${oldName}/rename`, { new_name: newName });
      loadDocuments();
    } catch (error) {
      alert("Failed to rename document.");
      console.error(error);
    }
  };

  const reindexDocument = async (filename: string) => {
    if (!window.confirm(`Are you sure you want to re-index ${filename}? This will extract and chunk the text again.`)) return;
    try {
      setMessage({ text: `Re-indexing ${filename}...`, type: "info" });
      await api.post(`/documents/${filename}/reindex`);
      setMessage({ text: `${filename} re-indexed successfully.`, type: "success" });
      loadDocuments();
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    } catch (error) {
      alert("Failed to re-index document.");
      setMessage({ text: "", type: "" });
    }
  };

  const showPreview = async (filename: string) => {
    try {
      const res = await api.get(`/documents/${filename}/preview`);
      if (res.data.success) {
        setPreviewDoc({ name: filename, content: res.data.preview });
      } else {
        alert("Preview not available.");
      }
    } catch(e) {
      alert("Failed to load preview.");
    }
  };

  const filteredDocs = documents.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 h-full max-w-[1200px] mx-auto animate-fade-in relative">
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
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents..." 
              className="bg-[#0F172A] border border-[#1F2937] text-white text-sm rounded-xl pl-9 pr-4 py-2.5 w-64 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all placeholder-[#64748B]"
            />
          </div>
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
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] bg-[#0F172A]/50 relative overflow-hidden
                ${isDragActive ? "border-[#2563EB] bg-[#2563EB]/10 scale-[1.02]" : "border-[#334155] hover:border-[#475569] hover:bg-[#1E293B]/50"}
                ${uploading ? "opacity-90 pointer-events-none border-[#2563EB]" : ""}
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
                <div className="flex flex-col items-center gap-4 w-full z-10">
                  <div className="w-10 h-10 rounded-full border-2 border-[#2563EB]/20 border-t-[#2563EB] animate-spin" />
                  <div className="space-y-2 w-full text-center">
                    <p className="font-semibold text-white">Processing PDF...</p>
                    <p className="text-xs text-[#94A3B8]">Extracting & Embedding Chunks</p>
                    {/* Simulated Progress Bar */}
                    <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden mt-3">
                       <div className="h-full bg-[#2563EB] animate-[pulse_1s_ease-in-out_infinite]" style={{width: '75%', transition: 'width 2s ease-in-out'}}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 z-10">
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
                    {message.type === 'success' ? 'Complete' : message.type === 'error' ? 'Failed' : 'Processing'}
                  </h4>
                  <p className="text-[13px] opacity-80">{message.text}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pb-10 pr-2">
            {filteredDocs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#64748B] py-20 border-2 border-dashed border-[#1F2937] rounded-2xl bg-[#0F172A]/30">
                <File size={48} className="mb-4 opacity-50" />
                <p className="font-semibold text-white text-lg">No documents found</p>
                <p className="text-sm mt-1">{searchQuery ? "Try a different search term." : "Upload a PDF to start building your knowledge base."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {/* Processing Documents */}
                {processingDocs.map((docName) => (
                  <div key={`processing-${docName}`} className="card p-5 flex items-center justify-between group border-[#EAB308]/30 bg-[#EAB308]/5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#EAB308]/30 flex items-center justify-center shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-[#EAB308]/20 border-t-[#EAB308] animate-spin" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate text-sm" title={docName}>
                          {docName}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] uppercase font-bold text-[#EAB308] flex items-center gap-1.5 bg-[#EAB308]/10 px-2 py-0.5 rounded-md border border-[#EAB308]/20">
                            Processing PDF & Extracting Data...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Ready Documents */}
                {filteredDocs.map((doc) => (
                  <div 
                    key={doc.name} 
                    className="card p-5 flex items-center justify-between group hover:border-[#2563EB]/50 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center shrink-0 group-hover:bg-[#2563EB]/10 group-hover:border-[#2563EB]/30 transition-colors">
                        <File size={22} className="text-[#94A3B8] group-hover:text-[#2563EB] transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate text-sm" title={doc.name}>
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs font-semibold text-[#94A3B8] bg-[#0F172A] border border-[#1F2937] px-2 py-0.5 rounded-md">
                            {doc.chunks} chunks
                          </span>
                          <span className="text-[10px] uppercase font-bold text-[#22C55E] flex items-center gap-1.5 bg-[#22C55E]/10 px-2 py-0.5 rounded-md border border-[#22C55E]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Indexed
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => showPreview(doc.name)}
                        className="text-[#64748B] hover:text-[#3B82F6] p-2 rounded-lg hover:bg-[#3B82F6]/10 transition-colors"
                        title="Preview Document"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => renameDocument(doc.name)}
                        className="text-[#64748B] hover:text-[#EAB308] p-2 rounded-lg hover:bg-[#EAB308]/10 transition-colors"
                        title="Rename Document"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => reindexDocument(doc.name)}
                        className="text-[#64748B] hover:text-[#10B981] p-2 rounded-lg hover:bg-[#10B981]/10 transition-colors"
                        title="Re-index Document"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button 
                        onClick={() => deleteDocument(doc.name)}
                        className="text-[#64748B] hover:text-[#EF4444] p-2 rounded-lg hover:bg-[#EF4444]/10 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-[#0F172A] border border-[#1F2937] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#1F2937] bg-[#1E293B]/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-[#2563EB]" />
                Preview: {previewDoc.name}
              </h3>
              <button onClick={() => setPreviewDoc(null)} className="text-[#64748B] hover:text-white p-1 rounded-md hover:bg-[#334155] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-[#E2E8F0] leading-relaxed whitespace-pre-wrap bg-[#0B1120]">
              <div className="bg-[#1E293B]/30 border border-[#334155] p-5 rounded-xl font-mono text-xs">
                {previewDoc.content}
              </div>
              <p className="text-center text-xs text-[#64748B] mt-4 italic">Showing first extracted chunk only...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}