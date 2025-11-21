import React, { useState, useEffect } from 'react';
import { Heart, Activity, MessageCircle, Moon, Sun, User, LogOut, History } from 'lucide-react';
import VideoInput from './components/VideoInput';
import AnalysisResults from './components/AnalysisResults';
import ChatAssistant from './components/ChatAssistant';
import AuthModal from './components/AuthModal';
import { analyzeCryVideo, getQuickTips, CryAnalysisResult } from './services/analysisService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'analyze' | 'chat' | 'history'>('analyze');
  const [analysisResult, setAnalysisResult] = useState<CryAnalysisResult | null>(null);
  const [quickTips, setQuickTips] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Generate quick tips immediately when analysis starts
  const handleAnalysisStart = async (file: File, base64: string) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setQuickTips(null);
    
    try {
      // 1. Fire off Quick Tips (Fast Model)
      setLoadingPhase("Getting immediate soothing tips...");
      getQuickTips().then(tips => setQuickTips(tips));

      // 2. Start Deep Analysis (Pro Model with Thinking)
      setLoadingPhase("Analyzing cry patterns & body language...");
      const result = await analyzeCryVideo(base64, file.type);
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try a different video.");
    } finally {
      setIsLoading(false);
      setLoadingPhase('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-pink-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg text-white">
              <Heart size={24} fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              NurtureAI
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-4 py-2 rounded-full font-medium transition ${activeTab === 'analyze' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Analyzer
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-full font-medium transition ${activeTab === 'chat' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Assistant
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${activeTab === 'history' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <History size={18} />
                History
              </button>
            )}

            <div className="ml-4 flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-slate-600">{user?.email}</span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-full transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition"
                >
                  <User size={18} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {activeTab === 'analyze' && (
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-slate-800">Why is baby crying?</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Upload a short video. Our Gemini AI analyzes facial expressions, cry acoustics, and body movements to tell you why and how to help.
              </p>
            </div>

            <VideoInput onVideoSelected={handleAnalysisStart} isLoading={isLoading} />

            {/* Loading State with Quick Tips */}
            {isLoading && (
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                   <p className="text-lg font-medium text-slate-700 animate-pulse">{loadingPhase}</p>
                </div>
                
                {quickTips && (
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl text-left animate-fade-in-up">
                    <h4 className="text-indigo-800 font-bold mb-2 flex items-center gap-2">
                      <Activity size={18} /> While you wait (Quick Tips):
                    </h4>
                    <p className="text-indigo-700 leading-relaxed">{quickTips}</p>
                  </div>
                )}
              </div>
            )}

            {/* Results */}
            {analysisResult && !isLoading && (
              <AnalysisResults result={analysisResult} />
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-800">Ask Nurture</h2>
              <p className="text-slate-500">Evidence-based answers powered by Google Search.</p>
            </div>
            <ChatAssistant />
          </div>
        )}

      </main>

      {/* Footer Disclaimer */}
      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} NurtureAI. Not a medical device.</p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

// Wrap with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;