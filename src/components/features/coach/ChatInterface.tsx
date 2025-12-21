'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Send,
  User,
  Sparkles,
  Lightbulb,
  ArrowUp,
  Mic,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { useCoachStore, useCoachMessages } from '@/store/coach-store';
import { useUserStore } from '@/store/user-store';

// Message component
const ChatMessage = ({
  role,
  content,
  isNew = false,
}: {
  role: 'user' | 'assistant';
  content: string;
  isNew?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-start gap-3',
        role === 'user' ? 'flex-row-reverse' : ''
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm',
          role === 'user'
            ? 'bg-gradient-to-br from-primary-500 to-emerald-600 text-white'
            : 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600'
        )}
      >
        {role === 'user' ? (
          <User className="w-5 h-5" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
      </div>

      {/* Message bubble */}
      <div className="group relative max-w-[85%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
            role === 'user'
              ? 'bg-gradient-to-br from-primary-500 to-emerald-600 text-white rounded-tr-md'
              : 'bg-white border border-stone-100 text-stone-700 rounded-tl-md'
          )}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>

        {/* Copy button for assistant messages */}
        {role === 'assistant' && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            onClick={handleCopy}
            className="absolute -bottom-6 right-0 p-1.5 text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Typing indicator
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-start gap-3"
  >
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
      <Sparkles className="w-5 h-5" />
    </div>
    <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
      <div className="flex space-x-1.5">
        <motion.div
          className="w-2 h-2 bg-purple-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-purple-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
        />
        <motion.div
          className="w-2 h-2 bg-purple-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
        />
      </div>
    </div>
  </motion.div>
);

// Quick suggestion button
const SuggestionButton = ({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="text-left text-xs p-3 bg-white border border-stone-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-colors text-stone-600 flex items-center gap-2 shadow-sm"
  >
    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
    <span className="line-clamp-1">{text}</span>
  </motion.button>
);

interface ChatInterfaceProps {
  onSendMessage?: (message: string) => Promise<string>;
  className?: string;
}

export function ChatInterface({ onSendMessage, className }: ChatInterfaceProps) {
  const { soloProfile } = useUserStore();
  const messages = useCoachMessages();
  const { addMessage, isTyping, setTyping, quickSuggestions, clearMessages } =
    useCoachStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message
  const welcomeMessage = soloProfile?.firstName
    ? `Bonjour ${soloProfile.firstName} ! 👋 Je suis votre coach nutritionnel personnel. Comment puis-je vous aider aujourd'hui ?`
    : "Bonjour ! Je suis votre coach nutritionnel personnel. Comment puis-je vous aider aujourd'hui ?";

  // Initialize with welcome message if empty
  useEffect(() => {
    if (messages.length === 0) {
      addMessage('assistant', welcomeMessage);
    }
  }, []);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Handle send message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = text.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);
    setTyping(true);

    try {
      if (onSendMessage) {
        const response = await onSendMessage(userMessage);
        addMessage('assistant', response);
      } else {
        // Default fallback response
        await new Promise((resolve) => setTimeout(resolve, 1500));
        addMessage(
          'assistant',
          "Je suis désolé, le service de chat n'est pas disponible pour le moment. Veuillez réessayer plus tard. 🙏"
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(
        'assistant',
        "Désolé, j'ai rencontré une erreur. Veuillez réessayer. 😔"
      );
    } finally {
      setIsLoading(false);
      setTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleReset = () => {
    clearMessages();
    addMessage('assistant', welcomeMessage);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-hide">
        {messages.map((msg, index) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isNew={index === messages.length - 1}
          />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>

        {/* Quick suggestions */}
        <AnimatePresence>
          {messages.length < 3 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-2 mt-4"
            >
              {quickSuggestions.slice(0, 4).map((suggestion, idx) => (
                <SuggestionButton
                  key={idx}
                  text={suggestion}
                  onClick={() => handleSendMessage(suggestion)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-stone-100">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-200 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
            {/* Reset button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              title="Nouvelle conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez une question..."
              className="flex-1 bg-transparent py-2 focus:outline-none text-stone-800 placeholder:text-stone-400"
              disabled={isLoading}
            />

            {/* Voice button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-stone-400 hover:text-purple-600 transition-colors"
              title="Recherche vocale"
            >
              <Mic className="w-4 h-4" />
            </motion.button>

            {/* Send button */}
            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-2.5 rounded-xl transition-all',
                input.trim() && !isLoading
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                  : 'bg-stone-200 text-stone-400'
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </form>

        {/* Powered by */}
        <div className="text-center mt-2 text-xs text-stone-400">
          Propulsé par l'IA · Conseils personnalisés
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
