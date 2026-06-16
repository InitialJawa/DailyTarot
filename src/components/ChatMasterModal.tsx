import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, User as UserIcon, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { Reading, ChatMessage } from '../types';
import { generateId } from '../utils';

interface ChatMasterModalProps {
  reading: Reading;
  isOpen: boolean;
  onClose: () => void;
  onSaveHistory: (readingId: string, history: ChatMessage[]) => void;
}

export function ChatMasterModal({ reading, isOpen, onClose, onSaveHistory }: ChatMasterModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(reading.chatHistory || []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages(reading.chatHistory || []);
    }
  }, [isOpen, reading.chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          readingContext: {
            type: reading.type,
            question: reading.question,
            interpretation: reading.interpretation,
            cards: reading.cards.map(c => c.name).join(', ')
          },
          message: userMsg.content,
          chatHistory: messages
            .filter(m => !m.content.includes("Maaf, energi saat ini sedang tidak stabil"))
            .map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      onSaveHistory(reading.id, finalMessages);
      
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: "Maaf, energi saat ini sedang tidak stabil. Saya tidak dapat merespons. Silakan coba lagi.",
        timestamp: new Date().toISOString()
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-bg-primary text-text-primary w-full max-w-2xl h-[80vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col border border-text-secondary/20 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-text-secondary/10 bg-bg-primary/90 backdrop-blur-md z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-serif italic font-bold">Tarot Master</h3>
                <p className="text-[10px] uppercase tracking-widest text-text-secondary">Konsultasi Bacaan Anda</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-text-secondary/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-text-secondary italic font-serif flex flex-col items-center gap-4 mt-10">
                <Sparkles size={32} className="opacity-50" />
                <p>Silakan tanyakan apa saja mengenai hasil bacaan Anda hari ini.</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0 mt-1">
                    <Sparkles size={14} />
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-text-secondary/10 border border-text-secondary/20 text-text-primary rounded-tr-sm' 
                    : 'bg-bg-primary border border-accent/30 text-text-primary/90 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                     <div className="markdown-body text-sm">
                       <Markdown>{msg.content}</Markdown>
                     </div>
                  ) : (
                     <p className="text-sm px-2">{msg.content}</p>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-text-secondary/20 flex items-center justify-center text-text-secondary flex-shrink-0 mt-1">
                    <UserIcon size={14} />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <Sparkles size={14} className="animate-spin" />
                </div>
                <div className="bg-bg-primary border border-accent/30 text-text-primary/90 rounded-2xl rounded-tl-sm p-4 w-16 flex items-center justify-center">
                   <div className="flex gap-1">
                     <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                     <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                     <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                   </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-text-secondary/10 bg-bg-primary">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                disabled={isLoading}
                placeholder="Tanyakan makna kartu, saran, dll..."
                className="flex-1 bg-text-secondary/5 border border-text-secondary/20 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-accent text-bg-primary hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} className="-ml-1" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
