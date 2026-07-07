import { useEffect, useState } from "react";
import { api } from "../services/api";
import { FileText, Database, MessageSquare, Activity, Clock, Zap } from "lucide-react";

type AnalyticsResponse = {
  success: boolean;
  total_documents: number;
  total_chunks: number;
  total_questions: number;
  total_sessions: number;
  avg_retrieval_ms: number;
  avg_generation_ms: number;
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    api
      .get("/analytics")
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error("API ERROR:", err));
  }, []);

  return (
    <div className="flex flex-col gap-8 h-full max-w-[1200px] mx-auto animate-fade-in">
      <div className="flex justify-between items-end pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Analytics & Performance</h1>
          <p className="text-[#94A3B8]">Deep dive into usage statistics and system latency monitoring.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText size={64} />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-[#94A3B8] text-sm font-medium">Uploaded PDFs</h2>
            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors shadow-sm">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">
            {analytics?.total_documents ?? 0}
          </p>
        </div>

        <div className="card p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database size={64} />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-[#94A3B8] text-sm font-medium">Chunks Indexed</h2>
            <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4] group-hover:bg-[#06B6D4] group-hover:text-white transition-colors shadow-sm">
              <Database size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">
            {analytics?.total_chunks ?? 0}
          </p>
        </div>

        <div className="card p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <MessageSquare size={64} />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-[#94A3B8] text-sm font-medium">Questions Asked</h2>
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition-colors shadow-sm">
              <MessageSquare size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">
            {analytics?.total_questions ?? 0}
          </p>
        </div>

        <div className="card p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={64} />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-[#94A3B8] text-sm font-medium">Active Sessions</h2>
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] group-hover:bg-[#22C55E] group-hover:text-white transition-colors shadow-sm">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">
            {analytics?.total_sessions ?? 0}
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <h2 className="text-xl font-bold text-white mb-4">Performance Monitoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-6 border border-[#334155]/50 flex items-center justify-between bg-gradient-to-r from-[#0F172A] to-[#1E293B]/50 hover:border-[#EAB308]/50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#EAB308]/10 flex items-center justify-center text-[#EAB308] border border-[#EAB308]/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#94A3B8] mb-1">Average Retrieval Speed</p>
                <p className="text-3xl font-bold text-white flex items-baseline gap-1">
                  {analytics?.avg_retrieval_ms ? (analytics.avg_retrieval_ms / 1000).toFixed(2) : "0.00"}
                  <span className="text-sm font-normal text-[#64748B] ml-1">seconds</span>
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm text-[#64748B] max-w-[200px] leading-relaxed">
                Vector search latency via Hybrid BM25 & Semantic matching.
              </p>
            </div>
          </div>

          <div className="card p-6 border border-[#334155]/50 flex items-center justify-between bg-gradient-to-r from-[#0F172A] to-[#1E293B]/50 hover:border-[#EC4899]/50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#EC4899]/10 flex items-center justify-center text-[#EC4899] border border-[#EC4899]/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#94A3B8] mb-1">Average Generation Speed</p>
                <p className="text-3xl font-bold text-white flex items-baseline gap-1">
                  {analytics?.avg_generation_ms ? (analytics.avg_generation_ms / 1000).toFixed(2) : "0.00"}
                  <span className="text-sm font-normal text-[#64748B] ml-1">seconds</span>
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm text-[#64748B] max-w-[200px] leading-relaxed">
                LLM inference latency from the local Ollama Engine stream.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
