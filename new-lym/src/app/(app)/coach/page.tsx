'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2, Lightbulb, ChefHat, Scale, Apple } from 'lucide-react';
import { Header } from '@/core/components/layout';
import { Button, Card, Avatar } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: ChefHat, text: 'Idée de repas rapide', prompt: 'Propose-moi une idée de repas équilibré que je peux préparer en moins de 20 minutes.' },
  { icon: Scale, text: 'Conseil perte de poids', prompt: 'Quels sont tes meilleurs conseils pour perdre du poids de manière saine ?' },
  { icon: Apple, text: 'Collation saine', prompt: 'Suggère-moi une collation saine et rassasiante pour l\'après-midi.' },
  { icon: Lightbulb, text: 'Astuce nutrition', prompt: 'Donne-moi une astuce nutrition que peu de gens connaissent.' },
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre coach nutrition personnel. Comment puis-je vous aider aujourd\'hui ? Vous pouvez me poser des questions sur la nutrition, me demander des idées de repas, ou obtenir des conseils personnalisés.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in real app, this would call the AI API)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(messageText),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Coach IA" showNotifications={false} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  message.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white shadow-sm border border-gray-100'
                )}
              >
                <p className={cn(
                  'text-sm whitespace-pre-wrap',
                  message.role === 'user' ? 'text-white' : 'text-gray-700'
                )}>
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span className="text-sm text-gray-500">Réflexion en cours...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts (show only when few messages) */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  <Icon className="w-4 h-4 text-emerald-500" />
                  {prompt.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez votre question..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="rounded-full w-12 h-12 p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mock response generator (replace with real AI in production)
function generateMockResponse(input: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('repas') && lowerInput.includes('rapide')) {
    return `Voici une idée de repas rapide et équilibré :

**Bowl de quinoa aux légumes**
- 100g de quinoa cuit
- Poulet grillé en dés
- Concombre et tomates cerises
- Avocat en tranches
- Sauce : huile d'olive + citron

Préparation : 15 minutes
Calories : ~450 kcal
Riche en protéines et fibres !`;
  }

  if (lowerInput.includes('perte de poids') || lowerInput.includes('maigrir')) {
    return `Voici mes conseils pour une perte de poids saine :

1. **Déficit modéré** : Visez -300 à -500 kcal/jour, pas plus
2. **Protéines** : Maintenez un apport élevé (1.6-2g/kg) pour préserver vos muscles
3. **Hydratation** : 2L d'eau minimum par jour
4. **Sommeil** : 7-8h par nuit (crucial !)
5. **Activité** : Privilégiez la marche quotidienne + musculation

La patience est clé : 0.5 à 1kg par semaine est un rythme idéal.`;
  }

  if (lowerInput.includes('collation')) {
    return `Voici quelques collations saines et rassasiantes :

🥜 **Combo protéiné**
- Yaourt grec + fruits rouges
- ~150 kcal, 15g de protéines

🍎 **Option classique**
- Pomme + beurre d'amande (1 c.à.s)
- ~200 kcal, fibres + bonnes graisses

🥚 **Salé**
- 2 œufs durs + bâtonnets de légumes
- ~150 kcal, riche en protéines

Choisissez selon votre faim et vos objectifs !`;
  }

  return `Merci pour votre question ! En tant que coach nutrition, je suis là pour vous aider.

Quelques points à retenir :
- Une alimentation équilibrée est la base d'une bonne santé
- Écoutez votre corps et ses signaux de faim/satiété
- La régularité est plus importante que la perfection

N'hésitez pas à me poser des questions plus spécifiques sur vos repas, vos objectifs, ou des conseils nutritionnels personnalisés !`;
}
