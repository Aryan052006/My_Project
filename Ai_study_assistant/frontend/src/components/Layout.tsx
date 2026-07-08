import Navbar from "./Navbar";
import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";
import { FileText, CheckCircle } from "lucide-react";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [processingDocs, setProcessingDocs] = useState<string[]>([]);
  const [completedDocs, setCompletedDocs] = useState<string[]>([]);
  const prevProcessingRef = useRef<string[]>([]);

  useEffect(() => {
    const checkUploadStatus = async () => {
      try {
        const response = await api.get("/upload-status");
        if (response.data.success) {
          const statuses = response.data.statuses;
          const currentlyProcessing = Object.keys(statuses).filter(k => statuses[k] === "processing");
          const readyDocs = Object.keys(statuses).filter(k => statuses[k] === "ready");
          
          setProcessingDocs(currentlyProcessing);
          
          // Check for newly completed docs
          const newCompletions = readyDocs.filter(doc => prevProcessingRef.current.includes(doc));
          
          if (newCompletions.length > 0) {
            setCompletedDocs(prev => [...prev, ...newCompletions]);
            
            // Auto dismiss success toast after 5 seconds
            setTimeout(() => {
              setCompletedDocs(prev => prev.filter(d => !newCompletions.includes(d)));
            }, 5000);
          }
          
          prevProcessingRef.current = currentlyProcessing;
        }
      } catch (error) {
        console.error("Failed to fetch upload status:", error);
      }
    };

    void checkUploadStatus();
    const interval = setInterval(checkUploadStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-[#F8FAFC] flex overflow-hidden selection:bg-[#2563EB]/30">
      <Navbar />
      <main className="flex-1 p-10 h-screen overflow-y-auto relative">
        <div className="max-w-[1200px] mx-auto animate-fade-in pb-20">
          {children}
        </div>
        
        {/* Global Processing Toast */}
        {processingDocs.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-[#0F172A] border border-[#EAB308]/30 shadow-2xl rounded-xl p-4 flex items-center gap-4 z-50 animate-fade-in max-w-sm">
            <div className="w-10 h-10 rounded-full bg-[#EAB308]/10 border border-[#EAB308]/20 flex items-center justify-center shrink-0">
              <div className="w-5 h-5 rounded-full border-2 border-[#EAB308]/30 border-t-[#EAB308] animate-spin" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Processing {processingDocs.length} Document{processingDocs.length !== 1 && 's'}</p>
              <p className="text-xs text-[#94A3B8] truncate w-48">{processingDocs[processingDocs.length - 1]}</p>
            </div>
          </div>
        )}

        {/* Global Success Toast */}
        {completedDocs.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-[#0F172A] border border-[#22C55E]/30 shadow-2xl rounded-xl p-4 flex items-center gap-4 z-50 animate-fade-in max-w-sm mb-20">
            <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center shrink-0">
              <CheckCircle size={20} className="text-[#22C55E]" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Upload Complete!</p>
              <p className="text-xs text-[#94A3B8] truncate w-48">{completedDocs[completedDocs.length - 1]} is ready.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}