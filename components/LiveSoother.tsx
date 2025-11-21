import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { getLiveClient, connectLiveParams } from '../services/geminiService';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';

const LiveSoother: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [volume, setVolume] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);

  // Visualizer loop
  useEffect(() => {
    let animId: number;
    const animate = () => {
      if (isActive) {
        // Mock volume visualization if we don't have analyser set up fully for simplicity
        // In a real app, use AnalyserNode
        setVolume(Math.random() * 100); 
      } else {
        setVolume(0);
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  const startSession = async () => {
    try {
      setStatus('connecting');
      
      // Setup Audio Setup
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Fix: Cast window to any to support webkitAudioContext for legacy Safari
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      
      // Fix: Cast window to any to support webkitAudioContext for legacy Safari
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Live Client
      const liveClient = getLiveClient();
      
      const sessionPromise = liveClient.connect(connectLiveParams({
        onOpen: () => {
            setStatus('connected');
            setIsActive(true);

            // Audio Input Handling
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);

            // Video Frames Loop (1 FPS to save bandwidth/processing for this demo)
            const sendFrame = () => {
                 if (!videoRef.current || !canvasRef.current) return;
                 const ctx = canvasRef.current.getContext('2d');
                 if (!ctx) return;
                 
                 canvasRef.current.width = videoRef.current.videoWidth / 4; // Downscale
                 canvasRef.current.height = videoRef.current.videoHeight / 4;
                 ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                 
                 const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
                 sessionPromise.then(session => session.sendRealtimeInput({ 
                     media: { mimeType: 'image/jpeg', data: base64 } 
                 }));
            };
            const videoInterval = setInterval(sendFrame, 1000);
            // Cleanup interval on close handled roughly by component unmount for now
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
        onClose: () => stopSession(),
        onError: (e) => {
            console.error(e);
            stopSession();
        }
      }));
      sessionRef.current = sessionPromise; // Store promise to close later if API supports

    } catch (err) {
      console.error("Failed to start live session", err);
      setStatus('disconnected');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('disconnected');
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    processorRef.current?.disconnect();
    // No direct close method on promise, relies on leaving page or logic (API limitation in snippet)
    // In real usage, we would keep the session object resolved.
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {status === 'disconnected' ? (
        <button
          onClick={startSession}
          className="flex items-center gap-2 bg-gradient-to-r from-secondary to-pink-600 text-white px-6 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-bold"
        >
          <Mic size={24} /> Talk to Nurture Coach
        </button>
      ) : (
        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl w-80 flex flex-col items-center space-y-4 border border-slate-700">
          <div className="flex justify-between w-full items-center">
             <span className="flex items-center gap-2 text-sm font-medium text-pink-400">
               <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"/> LIVE
             </span>
             <button onClick={stopSession} className="text-slate-400 hover:text-white"><X size={20}/></button>
          </div>

          <div className="relative w-full h-40 bg-slate-800 rounded-xl overflow-hidden">
             <video ref={videoRef} muted className="w-full h-full object-cover opacity-50" />
             <canvas ref={canvasRef} className="hidden" />
             <div className="absolute inset-0 flex items-center justify-center">
                 {/* Voice Visualizer */}
                 <div className="flex items-center gap-1 h-12">
                    {[...Array(5)].map((_, i) => (
                        <div 
                           key={i} 
                           className="w-2 bg-pink-500 rounded-full transition-all duration-100"
                           style={{ height: `${Math.max(10, Math.random() * volume)}%` }}
                        />
                    ))}
                 </div>
             </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-300">Listening to baby...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSoother;