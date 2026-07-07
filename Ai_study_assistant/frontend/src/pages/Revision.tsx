import { useState } from "react";
import { api } from "../services/api";
import { Zap, BookText, Wand2, RefreshCw, Layers, ArrowRight, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Revision() {
  const [activeTab, setActiveTab] = useState<"FLASHCARDS" | "CHEATSHEET">("FLASHCARDS");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Flashcards State
  const [flashcards, setFlashcards] = useState<any[] | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Cheat Sheet State
  const [cheatsheet, setCheatsheet] = useState("");

  const handleGenerateFlashcards = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setFlashcards(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    try {
      const res = await api.post("/revision/flashcards", { topic, num_cards: 10 });
      if (res.data.success) setFlashcards(res.data.flashcards);
      else alert(res.data.error);
    } catch (e) {
      alert("Failed to generate flashcards.");
    }
    setLoading(false);
  };

  const handleGenerateCheatsheet = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setCheatsheet("");
    try {
      const res = await api.post("/revision/cheatsheet", { topic });
      if (res.data.success) setCheatsheet(res.data.cheatsheet);
      else alert(res.data.error);
    } catch (e) {
      alert("Failed to generate cheat sheet.");
    }
    setLoading(false);
  };

  const nextCard = () => {
    if (flashcards && currentCardIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev - 1), 150);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto mt-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1F2937] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
              <Zap size={20} className="text-[#F59E0B]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Smart Revision</h1>
          </div>
          <p className="text-[#94A3B8]">Instantly generate digital flashcards and hyper-condensed cheat sheets.</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="card p-6 border border-[#334155]/50 flex flex-col gap-6 bg-gradient-to-br from-[#0F172A] to-[#1E293B]/20">
        <div>
          <label className="text-sm font-bold text-[#E2E8F0] mb-2 block">What do you need to revise?</label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Photosynthesis, Cloud Computing, Macroeconomics"
            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl p-4 text-white placeholder-[#64748B] outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] shadow-inner"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab("FLASHCARDS")}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "FLASHCARDS" 
                ? "bg-[#F59E0B] text-[#78350F] shadow-lg shadow-[#F59E0B]/20 border border-[#FCD34D]" 
                : "bg-[#1E293B] text-[#94A3B8] border border-[#334155] hover:bg-[#1E293B]/80 hover:text-white"
            }`}
          >
            <Layers size={18} /> Flashcards
          </button>
          <button 
            onClick={() => setActiveTab("CHEATSHEET")}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "CHEATSHEET" 
                ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20 border border-[#34D399]" 
                : "bg-[#1E293B] text-[#94A3B8] border border-[#334155] hover:bg-[#1E293B]/80 hover:text-white"
            }`}
          >
            <BookText size={18} /> Cheat Sheet
          </button>
        </div>

        {/* Action Button */}
        <button 
          onClick={activeTab === "FLASHCARDS" ? handleGenerateFlashcards : handleGenerateCheatsheet}
          disabled={!topic.trim() || loading}
          className="w-full py-3.5 bg-[#1E293B] border border-[#334155] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#334155] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><RefreshCw size={18} className="animate-spin" /> Generating {activeTab === "FLASHCARDS" ? "Flashcards" : "Cheat Sheet"}...</>
          ) : (
            <><Wand2 size={18} /> Generate {activeTab === "FLASHCARDS" ? "Flashcards" : "Cheat Sheet"}</>
          )}
        </button>
      </div>

      {/* Content Area */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-[#64748B]">
          <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-[#F59E0B]" />
          </div>
          <p className="font-semibold text-sm animate-pulse">Condensing knowledge base...</p>
        </div>
      )}

      {/* Flashcards View */}
      {!loading && activeTab === "FLASHCARDS" && flashcards && (
        <div className="animate-fade-in flex flex-col items-center gap-8">
          <div className="w-full max-w-2xl relative" style={{ perspective: "1000px" }}>
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className={`w-full h-80 cursor-pointer transition-all duration-500 rounded-2xl relative`}
              style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
              {/* Front */}
              <div 
                className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-2 border-[#334155] hover:border-[#F59E0B] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-[#0F172A]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="absolute top-4 left-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Flashcard {currentCardIndex + 1} of {flashcards.length}</div>
                <h3 className="text-3xl font-black text-white leading-tight">{flashcards[currentCardIndex]?.front}</h3>
                <p className="absolute bottom-4 text-xs text-[#F59E0B] animate-pulse">Click to reveal answer</p>
              </div>
              
              {/* Back */}
              <div 
                className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#F59E0B]/20 to-[#0F172A] border-2 border-[#F59E0B] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-[#F59E0B]/10"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="absolute top-4 left-4 text-xs font-bold text-[#FCD34D] uppercase tracking-wider">Answer</div>
                <p className="text-xl font-medium text-[#E2E8F0] leading-relaxed">{flashcards[currentCardIndex]?.back}</p>
                <p className="absolute bottom-4 text-xs text-[#64748B]">Click to flip back</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={prevCard} 
              disabled={currentCardIndex === 0}
              className="p-4 rounded-full bg-[#1E293B] border border-[#334155] text-white hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <span className="font-bold text-[#94A3B8]">Card {currentCardIndex + 1} / {flashcards.length}</span>
            <button 
              onClick={nextCard} 
              disabled={currentCardIndex === flashcards.length - 1}
              className="p-4 rounded-full bg-[#1E293B] border border-[#334155] text-white hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Cheat Sheet View */}
      {!loading && activeTab === "CHEATSHEET" && cheatsheet && (
        <div className="card p-10 border border-[#334155]/50 bg-[#0F172A] shadow-xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-bl-full pointer-events-none" />
          <div className="prose prose-invert prose-emerald max-w-none relative z-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {cheatsheet}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
