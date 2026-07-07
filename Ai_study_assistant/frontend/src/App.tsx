import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Solver from "./pages/Solver";
import Documents from "./pages/Documents";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import AITutor from "./pages/AITutor";
import Revision from "./pages/Revision";

function App() {
  return (
    <BrowserRouter>
      {/* View shown when the user is NOT logged in */}
      <SignedOut>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050816]">
          <div className="mb-8 text-center animate-fade-in">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">AI Study Assistant</h1>
            <p className="text-[#94A3B8]">Sign in to access your knowledge base.</p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-sm normal-case',
                  card: 'bg-[#0F172A] border border-[#1F2937] shadow-2xl',
                  headerTitle: 'text-white',
                  headerSubtitle: 'text-[#94A3B8]',
                  socialButtonsBlockButton: 'text-white border-[#334155] hover:bg-[#1E293B]',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  dividerLine: 'bg-[#334155]',
                  dividerText: 'text-[#64748B]',
                  formFieldLabel: 'text-[#CBD5E1]',
                  formFieldInput: 'bg-[#1E293B] border-[#334155] text-white focus:border-[#2563EB]',
                  footerActionText: 'text-[#94A3B8]',
                  footerActionLink: 'text-[#2563EB] hover:text-[#3B82F6]'
                }
              }}
            />
          </div>
        </div>
      </SignedOut>

      {/* View shown when the user IS logged in */}
      <SignedIn>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/solver" element={<Solver />} />
            <Route path="/tutor" element={<AITutor />} />
            <Route path="/revision" element={<Revision />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </SignedIn>
    </BrowserRouter>
  );
}

export default App;