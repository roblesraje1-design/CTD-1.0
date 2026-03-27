import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface VoiceOverlayProps {
  isActive: boolean;
  onClose: () => void;
}

export default function VoiceOverlay({ isActive, onClose }: VoiceOverlayProps) {
  const [status, setStatus] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [transcript, setTranscript] = useState('');
  const [bars, setBars] = useState<number[]>(new Array(20).fill(10));

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 40 + 10));
    }, 100);

    // Simulate a conversation
    const timer = setTimeout(() => {
      setStatus('thinking');
      setTimeout(() => {
        setStatus('speaking');
        setTranscript("I'm checking your tech repair schedule. You have a screen replacement at 2 PM.");
      }, 1500);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center p-8"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-400 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-3 mb-12">
            <Sparkles className="text-blue-500" />
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Gemini Voice</span>
          </div>

          <div className="flex items-end gap-1 h-32 mb-12">
            {bars.map((h, i) => (
              <motion.div 
                key={i}
                animate={{ height: h }}
                className={cn(
                  "w-2 rounded-full",
                  status === 'listening' ? "bg-blue-500" : status === 'thinking' ? "bg-purple-500" : "bg-green-500"
                )}
              />
            ))}
          </div>

          <div className="text-center max-w-2xl">
            <h2 className="text-3xl font-light mb-4 text-white">
              {status === 'listening' ? "Listening..." : status === 'thinking' ? "Thinking..." : "Speaking"}
            </h2>
            <p className="text-xl text-zinc-400 font-light italic">
              {transcript || "Try asking: 'What's on my to-do list today?'"}
            </p>
          </div>

          <div className="absolute bottom-12 flex gap-8">
            <button className="p-6 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
              <Volume2 size={32} />
            </button>
            <button 
              onClick={onClose}
              className="p-6 bg-red-500 rounded-full text-white hover:scale-110 transition-transform shadow-lg shadow-red-500/20"
            >
              <Mic size={32} />
            </button>
            <button className="p-6 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
              <VolumeX size={32} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
