'use client';

import { useState, useRef, useEffect } from 'react';
import { chatWithAICoach } from '@/app/actions/ai-coach';
import { useOnboardingStore } from '@/store/onboarding-store';
import { Send, User, Bot, Sparkles, Lightbulb, ArrowUp } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const QUICK_SUGGESTIONS = [
    "Idée de petit-déjeuner sain 🥑",
    "Comment manger plus de protéines ? 💪",
    "Recette rapide pour ce soir 🍳",
    "Astuce pour boire plus d'eau 💧"
];

export function ChatInterface() {
    const { profile } = useOnboardingStore();
    
    // Message d'accueil personnalisé
    const getWelcomeMessage = () => {
        if (profile.name) {
            return `Bonjour ${profile.name} ! 👋 Je suis votre coach nutritionnel personnel. Je connais votre profil et vos objectifs${profile.primaryGoal === 'weight_loss' ? ' de perte de poids' : profile.primaryGoal === 'muscle_gain' ? ' de prise de muscle' : ''}. Comment puis-je vous aider aujourd'hui ?`;
        }
        return 'Bonjour ! Je suis votre coach nutritionnel personnel. Je m\'adapte à vos habitudes et vos objectifs. Comment puis-je vous aider aujourd\'hui ?';
    };

    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: getWelcomeMessage() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update welcome message when profile changes
    useEffect(() => {
        setMessages([{ role: 'assistant', content: getWelcomeMessage() }]);
    }, [profile.name]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage = text.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Passer le profil complet à l'agent IA
            const result = await chatWithAICoach(
                userMessage, 
                'default',
                undefined, // nutritionContext - peut être ajouté plus tard
                profile    // Profil utilisateur complet
            );

            if (result.success && result.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: result.response! }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer." }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Une erreur inattendue s'est produite." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex-1 overflow-y-auto space-y-6 mb-4 p-2 no-scrollbar">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                                : 'bg-white border border-gray-100 text-purple-600'
                            }`}>
                            {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                        </div>
                        <div
                            className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot size={18} />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                            <div className="flex space-x-1.5">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Suggestions (only show if few messages) */}
                {messages.length < 3 && !isLoading && (
                    <div className="grid grid-cols-2 gap-2 mt-4 px-2">
                        {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendMessage(suggestion)}
                                className="text-left text-xs p-3 bg-white border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-100 transition-colors text-gray-600 flex items-center gap-2 shadow-sm"
                            >
                                <Lightbulb size={14} className="text-yellow-500 shrink-0" />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="relative bg-white p-2 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez une question à votre coach..."
                    className="w-full pl-4 pr-12 py-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-200"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <ArrowUp size={20} />
                    )}
                </button>
            </form>
        </div>
    );
}
