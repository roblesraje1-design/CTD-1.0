import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, Send, X, Volume2, VolumeX } from 'lucide-react';
import { useGemini } from '../hooks/useGemini';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import VoiceOverlay from './VoiceOverlay';

export default function GeminiBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const { sendMessage, loading } = useGemini();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    const response = await sendMessage(userMsg);
    setChatHistory(prev => [...prev, { role: 'model', text: response || 'No response' }]);
  };

  return (
    <>
      <VoiceOverlay isActive={isVoiceActive} onClose={() => setIsVoiceActive(false)} />
      
      <div className="fixed bottom-0 left-0 right-0 p-6 z-[100] pointer-events-none">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">
          {isOpen && (
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl mb-4 flex flex-col h-[60vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-zinc-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">Gemini Assistant</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-zinc-800 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-6">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="text-sm">Ask me anything about your tech repair jobs or the news.</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-1 items-center text-zinc-500 ml-2">
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full p-2 flex items-center gap-2 shadow-xl">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors text-zinc-400"
            >
              <Search size={20} />
            </button>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              onFocus={() => setIsOpen(true)}
              placeholder="Ask Gemini..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2"
            />
            <button 
              onClick={() => setIsVoiceActive(true)}
              className={cn(
                "p-3 rounded-full transition-all",
                isVoiceActive ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              )}
            >
              <Mic size={20} />
            </button>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
