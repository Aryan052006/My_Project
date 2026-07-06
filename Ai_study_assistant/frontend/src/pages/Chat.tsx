import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Send, Trash2, Plus, MessageSquare, Bot, User, FileText } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: {
    pdf: string;
    chunk_id: number;
    similarity: number;
    distance: number;
  }[];
};

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [sessions, setSessions] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("default");

  useEffect(() => {
    fetchSessions();
    fetchHistory("default");
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/sessions");
      setSessions(res.data.sessions);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async (sessionId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/chat/history?session_id=${sessionId}`);
      setMessages(res.data.history);
      setCurrentSessionId(sessionId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = () => {
    const newSessionId = `chat_${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setMessages([]);
  };

  const sendQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: question,
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setQuestion("");

    try {
      const response = await api.post("/chat", {
        question: userMessage.content,
        session_id: currentSessionId
      });

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: response.data.answer,
          sources: response.data.sources
        }
      ]);
      
      if (!sessions.includes(currentSessionId)) {
        setSessions(prev => [...prev, currentSessionId]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await api.post(`/clear-chat?session_id=${currentSessionId}`);
      setMessages([]);
      fetchSessions();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-[85vh] flex gap-6 max-w-[1200px] mx-auto animate-fade-in">
      
      {/* Sidebar */}
      <div className="w-[280px] panel p-4 flex flex-col border border-[#1F2937]">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-[#2563EB]" />
            Conversations
          </h2>
        </div>

        <button
          onClick={createNewChat}
          className="w-full btn-primary py-2.5 mb-4 flex justify-center items-center gap-2 text-sm shadow-md"
        >
          <Plus size={16} /> New Chat
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
          {sessions.length === 0 && (
            <p className="text-[#64748B] text-xs text-center mt-4 font-medium">No past chats found.</p>
          )}
          {sessions.map((s) => (
            <button
              key={s}
              onClick={() => fetchHistory(s)}
              className={`text-left px-3 py-2.5 rounded-xl truncate text-sm transition-all duration-200 ${
                s === currentSessionId
                  ? "bg-[#2563EB]/10 text-[#2563EB] font-semibold border border-[#2563EB]/20"
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] border border-transparent"
              }`}
            >
              {s.replace("chat_", "Chat ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl panel border border-[#1F2937] overflow-hidden">
        <div className="flex justify-between items-center border-b border-[#1F2937] p-6 bg-[#0F172A]/50 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">AI Assistant</h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">Ask questions based on your uploaded documents.</p>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#EF4444] bg-[#1E293B] hover:bg-[#EF4444]/10 px-3 py-1.5 rounded-lg border border-[#334155] hover:border-[#EF4444]/30 transition-all"
          >
            <Trash2 size={14} /> Clear Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-[#64748B] gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1E293B] border border-[#334155] flex items-center justify-center shadow-inner">
                <Bot size={32} className="text-[#2563EB]" />
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-lg">How can I help you study?</p>
                <p className="text-sm mt-1">Start a conversation to query your knowledge base.</p>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                message.role === "user" 
                  ? "bg-[#2563EB] text-white border-[#3B82F6]/50 shadow-[#2563EB]/20" 
                  : "bg-[#1E293B] text-[#94A3B8] border-[#334155]"
              }`}>
                {message.role === "user" ? <User size={18} /> : <Bot size={20} className={message.role === "assistant" ? "text-[#06B6D4]" : ""} />}
              </div>
              <div className={`max-w-[80%] text-sm leading-relaxed p-4 rounded-2xl ${
                message.role === "user" 
                  ? "bg-[#2563EB]/10 text-white border border-[#2563EB]/20 rounded-tr-sm" 
                  : "bg-[#1E293B]/50 text-[#F8FAFC] border border-[#334155] rounded-tl-sm"
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#334155]">
                    <p className="text-[10px] font-bold text-[#94A3B8] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={12} /> Sources Referenced
                    </p>
                    <div className="flex flex-col gap-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs text-[#94A3B8] bg-[#0F172A] border border-[#1F2937] px-3 py-2 rounded-lg flex flex-wrap items-center gap-x-2 shadow-inner">
                          <span className="font-semibold text-[#E2E8F0] truncate max-w-[150px]">{source.pdf}</span> 
                          <span className="text-[#334155]">&bull;</span> Chunk {source.chunk_id}
                          <span className="text-[#334155]">&bull;</span> Match <span className="text-[#22C55E] font-bold">{(source.similarity * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] text-[#06B6D4] flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={20} />
              </div>
              <div className="bg-[#1E293B]/50 border border-[#334155] rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#06B6D4] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-[#0F172A]/80 border-t border-[#1F2937] backdrop-blur-md">
          <div className="relative flex items-center">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
              placeholder="Ask anything about your study materials..."
              className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-5 py-3.5 pr-14 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all text-white text-sm shadow-inner placeholder-[#64748B]"
            />
            <button
              onClick={sendQuestion}
              disabled={loading || !question.trim()}
              className="absolute right-2 p-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] disabled:bg-[#1E293B] disabled:text-[#475569] transition-all shadow-md"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

