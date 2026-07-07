import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Settings as SettingsIcon, Save, RefreshCw } from "lucide-react";

type SettingsData = {
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  min_similarity: number;
  temperature: number;
  max_tokens: number;
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    api.get("/settings").then((res) => {
      if (res.data.success) setSettings(res.data.settings);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'number' || type === 'range' ? Number(value) : value,
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.post("/settings", settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex h-full items-center justify-center text-[#64748B]">
        <RefreshCw className="animate-spin mr-2" size={18} /> Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-fade-in pb-10">
      <div className="flex justify-between items-end border-b border-[#1F2937] pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white flex items-center gap-3">
            <SettingsIcon size={28} className="text-[#2563EB]" />
            Configuration
          </h1>
          <p className="text-[#94A3B8]">Fine-tune the behavior of your RAG pipeline and AI models.</p>
        </div>
        <div className="flex items-center gap-4">
          {showSuccess && (
            <span className="text-sm font-semibold text-[#22C55E] animate-fade-in">Saved successfully!</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary py-2 flex items-center gap-2 transition-all"
          >
            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Document Processing Settings */}
        <div className="card p-6 border border-[#334155]/50 flex flex-col gap-5 bg-gradient-to-br from-[#0F172A] to-[#1E293B]/20">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            Document Processing
          </h2>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-[#E2E8F0]">Chunk Size</label>
              <span className="text-xs bg-[#1E293B] px-2 py-1 rounded text-[#94A3B8] font-mono border border-[#334155]">{settings.chunk_size} chars</span>
            </div>
            <input type="range" name="chunk_size" min="200" max="2000" step="100" value={settings.chunk_size} onChange={handleChange} className="w-full accent-[#2563EB]" />
            <p className="text-xs text-[#64748B]">Maximum number of characters per document chunk. Larger chunks retain more context but take more time to process.</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-[#E2E8F0]">Chunk Overlap</label>
              <span className="text-xs bg-[#1E293B] px-2 py-1 rounded text-[#94A3B8] font-mono border border-[#334155]">{settings.chunk_overlap} chars</span>
            </div>
            <input type="range" name="chunk_overlap" min="0" max="500" step="50" value={settings.chunk_overlap} onChange={handleChange} className="w-full accent-[#2563EB]" />
            <p className="text-xs text-[#64748B]">Number of characters that overlap between consecutive chunks to maintain flow and context.</p>
          </div>
        </div>

        {/* Retrieval Settings */}
        <div className="card p-6 border border-[#334155]/50 flex flex-col gap-5 bg-gradient-to-br from-[#0F172A] to-[#1E293B]/20">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            Retrieval Engine
          </h2>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-[#E2E8F0]">Top-K Results</label>
              <span className="text-xs bg-[#1E293B] px-2 py-1 rounded text-[#94A3B8] font-mono border border-[#334155]">{settings.top_k}</span>
            </div>
            <input type="range" name="top_k" min="1" max="15" step="1" value={settings.top_k} onChange={handleChange} className="w-full accent-[#06B6D4]" />
            <p className="text-xs text-[#64748B]">Number of most relevant text chunks to fetch from the vector database and provide to the AI.</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-[#E2E8F0]">Similarity Threshold</label>
              <span className="text-xs bg-[#1E293B] px-2 py-1 rounded text-[#94A3B8] font-mono border border-[#334155]">{settings.min_similarity.toFixed(2)}</span>
            </div>
            <input type="range" name="min_similarity" min="0" max="1" step="0.05" value={settings.min_similarity} onChange={handleChange} className="w-full accent-[#06B6D4]" />
            <p className="text-xs text-[#64748B]">Minimum cosine similarity score required for a chunk to be considered relevant. A higher value means stricter matching.</p>
          </div>
        </div>

        {/* AI Generation Settings */}
        <div className="card p-6 border border-[#334155]/50 flex flex-col gap-5 bg-gradient-to-br from-[#0F172A] to-[#1E293B]/20">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
            AI Generation
          </h2>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-[#E2E8F0]">Temperature</label>
              <span className="text-xs bg-[#1E293B] px-2 py-1 rounded text-[#94A3B8] font-mono border border-[#334155]">{settings.temperature.toFixed(2)}</span>
            </div>
            <input type="range" name="temperature" min="0" max="1" step="0.05" value={settings.temperature} onChange={handleChange} className="w-full accent-[#8B5CF6]" />
            <p className="text-xs text-[#64748B]">Controls the creativity of the AI model. 0.0 is deterministic and focused, 1.0 is highly creative and unpredictable.</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-[#E2E8F0]">Max Tokens</label>
              <span className="text-xs bg-[#1E293B] px-2 py-1 rounded text-[#94A3B8] font-mono border border-[#334155]">{settings.max_tokens}</span>
            </div>
            <input type="range" name="max_tokens" min="100" max="2000" step="100" value={settings.max_tokens} onChange={handleChange} className="w-full accent-[#8B5CF6]" />
            <p className="text-xs text-[#64748B]">The hard limit for the maximum length of the generated response in tokens.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
