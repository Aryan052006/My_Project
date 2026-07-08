import { useEffect, useState } from "react";
import { api } from "../services/api";
import { FileText, Database, MessageSquare, Activity, Upload, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

type Document = {
  name: string;
  chunks: number;
};

type DocumentsResponse = {
  success: boolean;
  total_documents: number;
  documents: Document[];
};

type AnalyticsResponse = {
  success: boolean;
  total_documents: number;
  total_chunks: number;
  total_questions: number;
  total_sessions: number;
};

export default function Dashboard() {
  const [data, setData] = useState<DocumentsResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    api
      .get("/documents")
      .then((res) => setData(res.data))
      .catch((err) => console.error("API ERROR:", err));
      
    api
      .get("/analytics")
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error("Analytics API ERROR:", err));
  }, []);

  const totalChunks = data
    ? data.documents.reduce((sum, doc) => sum + doc.chunks, 0)
    : 0;

  return (
    <div className="flex flex-col gap-8 h-full max-w-[1200px] mx-auto animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Dashboard</h1>
          <p className="text-[#94A3B8]">Welcome to your AI workspace.</p>
        </div>
        <div className="flex items-center gap-2 text-[#22C55E] bg-[#22C55E]/10 px-3 py-1.5 rounded-lg border border-[#22C55E]/20 text-xs font-semibold uppercase tracking-wider">
          <Activity size={14} />
          System Online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#94A3B8] text-sm font-medium">Uploaded PDFs</h2>
            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {data?.total_documents ?? 0}
          </p>
        </div>

        <div className="card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#94A3B8] text-sm font-medium">Chunks Indexed</h2>
            <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4] group-hover:bg-[#06B6D4] group-hover:text-white transition-colors">
              <Database size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {totalChunks}
          </p>
        </div>

        <div className="card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#94A3B8] text-sm font-medium">Questions Asked</h2>
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition-colors">
              <MessageSquare size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics?.total_questions ?? 0}
          </p>
        </div>

        <div className="card p-6 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#94A3B8] text-sm font-medium">Chat Sessions</h2>
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] group-hover:bg-[#22C55E] group-hover:text-white transition-colors">
              <MessageSquare size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics?.total_sessions ?? 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-white">Recent Documents</h2>
            <Link to="/documents" className="text-sm text-[#2563EB] hover:text-[#3B82F6] font-medium transition-colors">View All</Link>
          </div>

          <div className="panel overflow-hidden border border-[#1F2937]">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#1F2937] bg-[#111827]/50">
                  <th className="py-4 px-6 font-semibold text-[#94A3B8] w-[50%]">Document Name</th>
                  <th className="py-4 px-6 font-semibold text-[#94A3B8]">Chunks</th>
                  <th className="py-4 px-6 font-semibold text-[#94A3B8] text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.documents && data.documents.length > 0 ? (
                  data.documents.slice(0, 4).map((document) => (
                    <tr
                      key={document.name}
                      className="border-b border-[#1F2937]/50 hover:bg-[#1E293B]/30 transition-colors group cursor-default last:border-0"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-[#64748B] group-hover:text-[#2563EB] transition-colors" />
                          <span className="font-medium text-[#F8FAFC] truncate max-w-[200px]">{document.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[#94A3B8] bg-[#1F2937] px-2.5 py-1 rounded-md text-xs font-medium">
                          {document.chunks}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5 text-[#22C55E] text-xs font-bold uppercase tracking-wide">
                          Ready
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-[#64748B]">
                      No documents uploaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white mb-2">Quick Actions</h2>
          
          <div className="flex flex-col gap-3">
            <Link to="/documents" className="card p-4 flex items-center gap-4 hover:border-[#2563EB]/50 group">
              <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#94A3B8] group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                <Upload size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Upload PDF</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Add to knowledge base</p>
              </div>
            </Link>
            
            <Link to="/chat" className="card p-4 flex items-center gap-4 hover:border-[#06B6D4]/50 group">
              <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#94A3B8] group-hover:bg-[#06B6D4] group-hover:text-white transition-all">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Open Chat</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Talk with your documents</p>
              </div>
            </Link>
            
            <Link to="/solver" className="card p-4 flex items-center gap-4 hover:border-[#8B5CF6]/50 group">
              <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#94A3B8] group-hover:bg-[#8B5CF6] group-hover:text-white transition-all">
                <PlayCircle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Generate Answer Sheet</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Solve a question bank</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}