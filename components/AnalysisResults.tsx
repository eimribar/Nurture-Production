import React, { useState } from 'react';
import { CryAnalysisResult, speakAdvice } from '../services/geminiService';
import { Play, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
      
      // Fix: Cast window to any to support webkitAudioContext for legacy Safari
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

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Actionable Steps */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-500" /> Actionable Steps
            </h3>
            <ul className="space-y-3">
              {result.actionableSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chart */}
          <div className="h-64 md:h-auto min-h-[250px] relative">
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2 absolute top-0 left-0 z-10">
              <Activity className="text-secondary" /> Analysis Breakdown
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={result.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {result.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
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