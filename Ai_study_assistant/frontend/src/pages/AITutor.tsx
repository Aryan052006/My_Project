import { useState, useEffect } from "react";
import { api } from "../services/api";
import { BookOpen, HelpCircle, ArrowRight, Wand2, RefreshCw, Layers, CheckCircle, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  // generate a unique ID for the render container
  const id = "mermaid-svg-" + Math.random().toString(36).substring(2, 9);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "dark" });
    
    const renderChart = async () => {
      try {
        // Attempt to auto-fix missing quotes around nodes to help the AI out
        let safeChart = chart;
        if (!safeChart.includes('["') && safeChart.includes('[')) {
          safeChart = safeChart.replace(/\[(.*?)\]/g, '["$1"]');
        }

        // Mermaid.render often swallows errors and returns an error SVG. 
        // We use mermaid.parse to strictly validate and catch errors first.
        const isValid = await mermaid.parse(safeChart);
        if (!isValid) throw new Error("Invalid mermaid syntax");

        const { svg } = await mermaid.render(id, safeChart);
        setSvg(svg);
        setHasError(false);
      } catch (e) {
        console.error("Mermaid parsing error, falling back to text:", e);
        setHasError(true);
      }
    };
    
    renderChart();
  }, [chart]);

  if (hasError || !svg) {
    return (
      <div className="my-6 bg-[#0F172A] p-4 rounded-xl border border-red-500/30 overflow-x-auto shadow-inner">
        <p className="text-xs text-red-400 mb-2 font-bold flex items-center gap-1.5">
          <XCircle size={14} /> Failed to render diagram. Raw AI output:
        </p>
        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap"><code>{chart}</code></pre>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center my-6 bg-[#0F172A]/80 p-6 rounded-xl border border-[#1F2937] shadow-inner overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

export default function AITutor() {
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "QUIZ">("SUMMARY");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [taxonomy, setTaxonomy] = useState("Understanding");
  const [loading, setLoading] = useState(false);
  
  // Summary State
  const [summary, setSummary] = useState("");
  
  // Quiz State
  const [quiz, setQuiz] = useState<any[] | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerateSummary = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setSummary("");
    try {
      const res = await api.post("/tutor/summary", { topic, difficulty, taxonomy });
      if (res.data.success) setSummary(res.data.summary);
      else alert(res.data.error);
    } catch (e) {
      alert("Failed to generate summary.");
    }
    setLoading(false);
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuiz(null);
    setScore(0);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    try {
      const res = await api.post("/tutor/quiz", { topic, num_questions: 5, difficulty, taxonomy });
      if (res.data.success) setQuiz(res.data.quiz);
      else alert(res.data.error);
    } catch (e) {
      alert("Failed to generate quiz.");
    }
    setLoading(false);
  };

  const handleOptionClick = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === quiz![currentQIndex].correctAnswer) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentQIndex(prev => prev + 1);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto mt-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1F2937] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center">
              <Layers size={20} className="text-[#2563EB]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">AI Tutor</h1>
          </div>
          <p className="text-[#94A3B8]">Generate instant topic summaries, diagrams, and practice quizzes.</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="card p-6 border border-[#334155]/50 flex flex-col gap-6 bg-gradient-to-br from-[#0F172A] to-[#1E293B]/20">
        <div>
          <label className="text-sm font-bold text-[#E2E8F0] mb-2 block">What would you like to study?</label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Primary Markets, Cell Biology, Machine Learning"
            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl p-4 text-white placeholder-[#64748B] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] shadow-inner"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-[#E2E8F0] mb-2 block">Difficulty Level</label>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-xl p-4 text-white outline-none focus:border-[#2563EB] shadow-inner appearance-none cursor-pointer"
            >
              <option value="Easy">Easy (Beginner)</option>
              <option value="Medium">Medium (Intermediate)</option>
              <option value="Hard">Hard (Advanced)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-[#E2E8F0] mb-2 block">Bloom's Taxonomy Focus</label>
            <select 
              value={taxonomy}
              onChange={(e) => setTaxonomy(e.target.value)}
              className="w-full bg-[#1E293B] border border-[#334155] rounded-xl p-4 text-white outline-none focus:border-[#2563EB] shadow-inner appearance-none cursor-pointer"
            >
              <option value="Remembering">Remembering (Recall facts)</option>
              <option value="Understanding">Understanding (Explain ideas)</option>
              <option value="Applying">Applying (Use scenarios)</option>
              <option value="Analyzing">Analyzing (Draw connections)</option>
              <option value="Evaluating">Evaluating (Justify a stand)</option>
              <option value="Creating">Creating (Produce new work)</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab("SUMMARY")}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "SUMMARY" 
                ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/20 border border-[#3B82F6]" 
                : "bg-[#1E293B] text-[#94A3B8] border border-[#334155] hover:bg-[#1E293B]/80 hover:text-white"
            }`}
          >
            <BookOpen size={18} /> Topic Summary & Diagram
          </button>
          <button 
            onClick={() => setActiveTab("QUIZ")}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "QUIZ" 
                ? "bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20 border border-[#A78BFA]" 
                : "bg-[#1E293B] text-[#94A3B8] border border-[#334155] hover:bg-[#1E293B]/80 hover:text-white"
            }`}
          >
            <HelpCircle size={18} /> Practice Quiz
          </button>
        </div>

        {/* Action Button */}
        <button 
          onClick={activeTab === "SUMMARY" ? handleGenerateSummary : handleGenerateQuiz}
          disabled={!topic.trim() || loading}
          className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === "SUMMARY" ? "bg-[#1E3A8A] text-[#93C5FD] hover:bg-[#1E3A8A]/80 border border-[#2563EB]/50" : "bg-[#4C1D95] text-[#C4B5FD] hover:bg-[#4C1D95]/80 border border-[#8B5CF6]/50"
          }`}
        >
          {loading ? (
            <><RefreshCw size={18} className="animate-spin" /> Generating {activeTab === "SUMMARY" ? "Summary" : "Quiz"}...</>
          ) : (
            <><Wand2 size={18} /> Generate {activeTab === "SUMMARY" ? "Summary" : "Quiz"}</>
          )}
        </button>
      </div>

      {/* Content Area */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-[#64748B]">
          <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-[#2563EB]" />
          </div>
          <p className="font-semibold text-sm animate-pulse">Analyzing documents and generating content...</p>
        </div>
      )}

      {/* Summary View */}
      {!loading && activeTab === "SUMMARY" && summary && (
        <div className="card p-8 border border-[#334155]/50 bg-[#0F172A] shadow-xl animate-fade-in">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({node, inline, className, children, ...props}: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  if (!inline && match && match[1] === 'mermaid') {
                    return <Mermaid chart={String(children).replace(/\n$/, '')} />
                  }
                  return <code className={className} {...props}>{children}</code>
                }
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Quiz View */}
      {!loading && activeTab === "QUIZ" && quiz && (
        <div className="animate-fade-in flex flex-col gap-6">
          {currentQIndex < quiz.length ? (
            <div className="card p-8 border border-[#334155]/50 bg-[#0F172A] shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-[#1F2937] pb-4">
                <span className="text-xs font-bold bg-[#8B5CF6]/20 text-[#A78BFA] px-3 py-1.5 rounded-lg border border-[#8B5CF6]/20">
                  Question {currentQIndex + 1} of {quiz.length}
                </span>
                <span className="text-xs font-bold text-[#94A3B8]">Score: <span className="text-white">{score}</span></span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">{quiz[currentQIndex].question}</h3>
              
              <div className="flex flex-col gap-3">
                {quiz[currentQIndex].options.map((opt: string, idx: number) => {
                  let btnClass = "bg-[#1E293B] border-[#334155] text-[#E2E8F0] hover:border-[#8B5CF6] hover:bg-[#1E293B]/80";
                  let icon = null;

                  if (showExplanation) {
                    if (idx === quiz[currentQIndex].correctAnswer) {
                      btnClass = "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]";
                      icon = <CheckCircle size={18} />;
                    } else if (idx === selectedOption) {
                      btnClass = "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]";
                      icon = <XCircle size={18} />;
                    } else {
                      btnClass = "bg-[#0F172A] border-[#1F2937] text-[#64748B] opacity-50";
                    }
                  } else if (idx === selectedOption) {
                     btnClass = "bg-[#8B5CF6]/20 border-[#8B5CF6] text-white";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={showExplanation}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${btnClass}`}
                    >
                      <span><span className="font-bold opacity-50 mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="mt-8 animate-fade-in">
                  <div className="p-5 rounded-xl bg-[#1E293B]/50 border border-[#334155]">
                    <h4 className="text-sm font-bold text-[#E2E8F0] mb-2">Explanation</h4>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{quiz[currentQIndex].explanation}</p>
                  </div>
                  <button 
                    onClick={nextQuestion}
                    className="mt-6 w-full py-3.5 bg-[#8B5CF6] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#7C3AED] shadow-lg shadow-[#8B5CF6]/20 transition-all"
                  >
                    {currentQIndex === quiz.length - 1 ? "Finish Quiz" : "Next Question"} <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-10 border border-[#334155]/50 bg-[#0F172A] shadow-xl text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#22C55E]/10 border-2 border-[#22C55E]/20 flex items-center justify-center mb-2">
                <span className="text-3xl font-black text-[#22C55E]">{Math.round((score / quiz.length) * 100)}%</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Quiz Completed!</h2>
              <p className="text-[#94A3B8]">You scored {score} out of {quiz.length} correctly.</p>
              <button 
                onClick={handleGenerateQuiz}
                className="mt-6 px-8 py-3 bg-[#8B5CF6] text-white rounded-xl font-bold hover:bg-[#7C3AED] transition-all"
              >
                Try Another Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
