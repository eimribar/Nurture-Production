import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic, Keyboard, X, Zap, Activity, StopCircle } from 'lucide-react';
import { sendChatMessage, ChatMessage, getLiveClient, connectLiveParams } from '../services/geminiService';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';

const ChatAssistant: React.FC = () => {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  
  // --- Text State ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm NurtureAI. Ask me anything about your baby's sleep, feeding, or development." }
  ]);
  const [input, setInput] = useState('');
  const [isTextLoading, setIsTextLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Voice State ---
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [volume, setVolume] = useState(0);
  
  // Refs for Voice
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  // --- Text Logic ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, mode]);

  const handleSendText = async () => {
    if (!input.trim() || isTextLoading) return;
    const userMsg = input;
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTextLoading(true);

    try {
      const history = messages; 
      const response = await sendChatMessage(userMsg, history);
      
      let responseText = response.text;
      if (response.sources && response.sources.length > 0) {
        const links = response.sources
            .map(chunk => chunk.web?.uri ? `[${chunk.web.title}](${chunk.web.uri})` : '')
            .filter(Boolean)
            .join(', ');
        if (links) responseText += `\n\nSources: ${links}`;
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTextLoading(false);
    }
  };

  // --- Voice Logic ---
  
  // Visualizer Loop
  useEffect(() => {
    let animId: number;
    const animate = () => {
      if (isLiveActive && analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        // Calculate average volume
        let sum = 0;
        for(let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolume(avg);
      } else if (!isLiveActive) {
        setVolume(0);
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [isLiveActive]);

  const startVoiceSession = async () => {
    try {
      setLiveStatus('connecting');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Fix: Cast window to any to support webkitAudioContext for legacy Safari
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      const outputCtx = new AudioCtx({ sampleRate: 24000 });

      // Audio Analysis Setup for Visualizer
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const liveClient = getLiveClient();
      
      const sessionPromise = liveClient.connect(connectLiveParams({
        onOpen: () => {
            setLiveStatus('connected');
            setIsLiveActive(true);

            const source = audioCtx.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            // Connect Graph: Source -> Analyser -> Processor -> Destination
            source.connect(analyser);
            source.connect(processor);
            processor.connect(audioCtx.destination);

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
        },
        onMessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
                const buffer = await decodeAudioData(base64ToUint8Array(audioData), outputCtx, 24000);
                const source = outputCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputCtx.destination);
                
                const now = outputCtx.currentTime;
                const start = Math.max(now, nextStartTimeRef.current);
                source.start(start);
                nextStartTimeRef.current = start + buffer.duration;
            }
        },
        onClose: () => stopVoiceSession(),
        onError: (e) => {
            console.error(e);
            stopVoiceSession();
        }
      }, "You are NurtureAI, a warm, comforting, and highly knowledgeable parenting assistant. Speak naturally, concisely, and with empathy. Do not list huge lists of things, just give one or two pieces of advice at a time."));
      
    } catch (err) {
      console.error("Failed to start live session", err);
      setLiveStatus('idle');
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopVoiceSession = () => {
    setIsLiveActive(false);
    setLiveStatus('idle');
    
    streamRef.current?.getTracks().forEach(t => t.stop());
    sourceRef.current?.disconnect();
    processorRef.current?.disconnect();
    analyserRef.current?.disconnect();
    audioContextRef.current?.close();
    
    // Reset audio pointer
    nextStartTimeRef.current = 0;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isLiveActive) stopVoiceSession();
    };
  }, [isLiveActive]);


  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col h-[600px] w-full max-w-4xl mx-auto overflow-hidden relative">
      
      {/* Header - Shared */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
              <Sparkles className="text-primary w-5 h-5" />
          </div>
          <div>
              <h3 className="font-bold text-slate-800">Nurture Assistant</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                  {mode === 'voice' ? 'Live Voice Mode' : 'Chat Mode with Search'}
              </p>
          </div>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex bg-white border border-slate-200 rounded-full p-1 shadow-sm">
          <button 
            onClick={() => {
              if(isLiveActive) stopVoiceSession();
              setMode('voice');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'voice' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Mic size={16} /> Voice
          </button>
          <button 
            onClick={() => {
              if(isLiveActive) stopVoiceSession();
              setMode('text');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'text' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Keyboard size={16} /> Text
          </button>
        </div>
      </div>

      {/* --- VOICE MODE UI --- */}
      {mode === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
          
          {/* Background Decoration */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-all duration-1000 ${isLiveActive ? 'scale-150 opacity-50' : 'scale-100'}`} />
            <div className={`w-64 h-64 bg-secondary/5 rounded-full blur-2xl transition-all duration-1000 absolute ${isLiveActive ? 'scale-125 opacity-50' : 'scale-100'}`} />
          </div>

          <div className="z-10 flex flex-col items-center space-y-10">
            {/* Main Visualizer / Button */}
            <div className="relative group">
              {/* Ripple Effects when active */}
              {isLiveActive && (
                <>
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="absolute -inset-4 bg-secondary/10 rounded-full animate-pulse" />
                </>
              )}

              <button
                onClick={isLiveActive ? stopVoiceSession : startVoiceSession}
                disabled={liveStatus === 'connecting'}
                className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
                  ${isLiveActive 
                    ? 'bg-gradient-to-br from-red-500 to-pink-600 scale-110' 
                    : 'bg-gradient-to-br from-primary to-indigo-600 hover:scale-105'
                  }
                  ${liveStatus === 'connecting' ? 'opacity-80 cursor-wait' : ''}
                `}
              >
                {liveStatus === 'connecting' ? (
                   <Activity className="w-12 h-12 text-white animate-spin" />
                ) : isLiveActive ? (
                   <div className="flex gap-1 items-end h-10">
                       {/* Dynamic Bars based on volume */}
                       {[...Array(5)].map((_, i) => (
                           <div 
                              key={i} 
                              className="w-2 bg-white rounded-full transition-all duration-75"
                              style={{ height: `${Math.max(20, Math.min(100, volume * (i + 1) * 0.5 + 20))}%` }}
                           />
                       ))}
                   </div>
                ) : (
                   <Mic className="w-12 h-12 text-white" />
                )}
              </button>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-800">
                    {liveStatus === 'connecting' && "Connecting..."}
                    {liveStatus === 'connected' && "I'm listening"}
                    {liveStatus === 'idle' && "Tap to speak"}
                </h2>
                <p className="text-slate-500 max-w-xs mx-auto">
                    {liveStatus === 'connected' 
                        ? "Talk naturally. I can hear you and the baby." 
                        : "Have a conversation with NurtureAI for real-time soothing advice."}
                </p>
            </div>
          </div>

        </div>
      )}

      {/* --- TEXT MODE UI --- */}
      {mode === 'text' && (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-2xl shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTextLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 ring-primary/20 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Type your question..."
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-slate-800 placeholder:text-slate-400"
              />
              <button
                onClick={handleSendText}
                disabled={!input.trim() || isTextLoading}
                className="p-3 bg-primary text-white rounded-full hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-primary transition-all"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
              <Zap size={12} /> Powered by Gemini 2.5 with Google Search
            </p>
          </div>
        </>
      )}

    </div>
  );
};

export default ChatAssistant;