import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Send, Trash2, Plus, MessageSquare, Bot, User, FileText, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: "user" | "assistant";
  content: string;
  confidence?: number;
  followups?: string[];
  isComplete?: boolean;
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
  
  const [availableModels, setAvailableModels] = useState<string[]>(['qwen3:1.7b']);
  const [selectedModel, setSelectedModel] = useState<string>('qwen3:1.7b');

  useEffect(() => {
    fetchSessions();
    fetchHistory("default");
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await api.get("/models");
      if (res.data.models && res.data.models.length > 0) {
        setAvailableModels(res.data.models);
        // default to first model if current isn't in list or just set it
        if (!res.data.models.includes(selectedModel)) {
          setSelectedModel(res.data.models[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

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
      
      // Mark fetched history messages as complete
      const historyMessages = res.data.history.map((m: any) => ({
        ...m,
        isComplete: true
      }));
      
      setMessages(historyMessages);
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

  const sendQuestion = async (qToSubmit?: string) => {
    const finalQuestion = qToSubmit || question;
    if (!finalQuestion.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: finalQuestion,
      isComplete: true
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setQuestion("");

    try {
      const response = await fetch("http://127.0.0.1:8000/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage.content,
          session_id: currentSessionId,
          model: selectedModel
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const assistantMessage: Message = { role: "assistant", content: "", sources: [], confidence: 0, followups: [], isComplete: false };
      
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === "metadata") {
              assistantMessage.sources = data.sources;
              assistantMessage.confidence = data.confidence;
            } else if (data.type === "text") {
              assistantMessage.content += data.content;
            } else if (data.type === "followups") {
              assistantMessage.followups = data.content;
            } else if (data.type === "error") {
               assistantMessage.content = "Error: " + data.message;
            }
            
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { ...assistantMessage };
              return newMessages;
            });
          } catch(e) {
            // Ignore incomplete JSON chunks (stream edge cases)
          }
        }
      }
      
      // Stream is fully done
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === "assistant") {
           newMessages[newMessages.length - 1] = { ...lastMsg, isComplete: true };
        }
        return newMessages;
      });
      
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
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
              AI Assistant
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-[#1E293B] border border-[#334155] text-xs font-medium text-[#60A5FA] px-2 py-1 rounded-md outline-none focus:border-[#2563EB] cursor-pointer hover:border-[#2563EB]/50 transition-colors"
                title="Select AI Model"
              >
                {availableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </h1>
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
                <div className="whitespace-pre-wrap">
                  {message.role === "assistant" ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 text-white" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mb-3 text-white" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2 text-white" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                        code: ({node, ...props}) => <code className="bg-[#0F172A] text-[#E2E8F0] px-1.5 py-0.5 rounded text-xs border border-[#334155]" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
                
                {message.sources && message.sources.length > 0 && message.isComplete !== false && (
                  <div className="mt-4 pt-4 border-t border-[#334155] animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={12} /> Sources Referenced
                      </p>
                      {message.confidence !== undefined && (
                         <div className="flex items-center gap-1.5 bg-[#0F172A] px-2 py-1 rounded-md border border-[#1F2937]">
                           <Sparkles size={10} className="text-[#22C55E]" />
                           <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">
                             Confidence: {message.confidence}%
                           </span>
                         </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs text-[#94A3B8] bg-[#0F172A] border border-[#1F2937] px-3 py-2 rounded-lg flex flex-wrap items-center justify-between gap-x-2 shadow-inner hover:border-[#334155] transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#E2E8F0] truncate max-w-[250px]">{source.pdf}</span> 
                          </div>
                          <span className="bg-[#1E293B] px-2 py-0.5 rounded text-[10px] font-bold text-[#3B82F6] border border-[#2563EB]/20">
                            Match {(source.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {message.followups && message.followups.length > 0 && message.isComplete !== false && (
                  <div className="mt-4 pt-4 border-t border-[#334155] flex flex-col gap-2 animate-fade-in">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                      Suggested Follow-ups
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {message.followups.map((f, i) => (
                        <button 
                          key={i} 
                          onClick={() => {
                            setQuestion(f);
                          }}
                          className="text-xs bg-[#2563EB]/5 text-[#60A5FA] border border-[#2563EB]/20 hover:bg-[#2563EB]/20 hover:border-[#2563EB]/40 px-3 py-2 rounded-lg transition-all text-left flex items-center justify-between group"
                        >
                          <span className="truncate">{f}</span>
                          <Send size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
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
              <div className="bg-[#1E293B]/50 border border-[#334155] rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 h-[52px]">
                <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#06B6D4] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-[#0F172A]/80 border-t border-[#1F2937] backdrop-blur-md">
          <div className="relative flex items-center group">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
              placeholder="Ask anything about your study materials..."
              className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-5 py-3.5 pr-14 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all text-white text-sm shadow-inner placeholder-[#64748B]"
            />
            <button
              onClick={() => sendQuestion()}
              disabled={loading || !question.trim()}
              className="absolute right-2 p-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] disabled:bg-[#1E293B] disabled:text-[#475569] transition-all shadow-md group-focus-within:bg-[#1D4ED8]"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

