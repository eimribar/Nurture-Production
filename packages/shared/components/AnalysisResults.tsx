import React, { useState } from 'react';
import { CryAnalysisResult } from '../services/analysisService';
import { speakAdvice } from '../services/geminiService';
import { Play, CheckCircle, AlertCircle, Activity, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalysisResultsProps {
  result: CryAnalysisResult;
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleSpeak = async () => {
    if (isPlayingAudio) return;
    try {
      setIsPlayingAudio(true);
      const textToSpeak = `Here is the analysis. The primary reason seems to be ${result.primaryReason}. ${result.actionableSteps.join('. ')}`;
      const buffer = await speakAdvice(textToSpeak);
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlayingAudio(false);
      source.start();
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">{result.primaryReason}</h2>
              <p className="opacity-90 mt-1 text-lg">Confidence: {result.confidenceScore}% • State: {result.emotionalState}</p>
            </div>
            <button 
              onClick={handleSpeak}
              disabled={isPlayingAudio}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full transition disabled:opacity-50"
              aria-label="Read advice"
            >
              <Play fill="currentColor" className={isPlayingAudio ? "animate-pulse" : ""} />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Actionable Steps */}
          <div className="order-2 lg:order-1">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-500" /> Actionable Steps
            </h3>
            <ul className="space-y-3">
              {result.actionableSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chart & Context */}
          <div className="order-1 lg:order-2 flex flex-col gap-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 z-10 relative">
                <Activity className="text-secondary w-5 h-5" /> Analysis Breakdown
               </h3>
               
               <div className="flex flex-col sm:flex-row items-center gap-6 z-10 relative">
                 {/* Donut Chart */}
                 <div className="w-48 h-48 relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={4}
                        >
                          {result.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-slate-800">{result.confidenceScore}%</span>
                        <span className="text-xs text-slate-400 uppercase font-semibold">Match</span>
                    </div>
                 </div>

                 {/* Custom Legend */}
                 <div className="flex-1 w-full">
                   <div className="space-y-2">
                      {result.chartData.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between group">
                          <div className="flex items-center gap-2">
                             <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                             <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{entry.name}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-600 group-hover:text-primary">{entry.value}%</span>
                        </div>
                      ))}
                   </div>
                 </div>
               </div>
               
               {/* Analysis Context */}
               {result.analysisContext && (
                 <div className="mt-6 pt-4 border-t border-slate-200">
                   <div className="flex gap-2 items-start text-sm text-slate-600 bg-white/50 p-3 rounded-lg">
                     <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                     <p className="leading-relaxed">{result.analysisContext}</p>
                   </div>
                 </div>
               )}

               {/* Decorative Background Blob */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 p-4 border-t border-amber-100 flex items-start gap-3 text-sm text-amber-800">
          <AlertCircle className="flex-shrink-0 w-5 h-5" />
          <p>{result.medicalDisclaimer || "This app is an AI assistant and does not replace professional medical advice. If your baby has a fever, is lethargic, or you are concerned, please contact a pediatrician immediately."}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;