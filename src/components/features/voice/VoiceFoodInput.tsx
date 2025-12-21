'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Mic,
  MicOff,
  Loader2,
  Check,
  X,
  Volume2,
  AlertCircle,
  Sparkles,
  Plus,
  ChefHat,
  Flame,
  Beef,
  Wheat,
  Droplets,
} from 'lucide-react';
import type { MealType, FoodItem, MealItem, NutritionInfo } from '@/types/meal';

// Types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceFoodInputProps {
  mealType: MealType;
  onAddToMeal: (items: MealItem[]) => void;
  className?: string;
}

interface ParsedFood {
  name: string;
  quantity?: number;
  unit?: string;
  estimatedNutrition: NutritionInfo;
}

// Simple nutrition estimation based on common foods
const estimateNutrition = (foodName: string, quantity: number = 100): NutritionInfo => {
  const lowerName = foodName.toLowerCase();

  // Common food estimations (per 100g or portion)
  const foodDatabase: Record<string, NutritionInfo> = {
    // Fruits
    pomme: { calories: 52, proteins: 0.3, carbs: 14, fats: 0.2 },
    banane: { calories: 89, proteins: 1.1, carbs: 23, fats: 0.3 },
    orange: { calories: 47, proteins: 0.9, carbs: 12, fats: 0.1 },
    fraise: { calories: 32, proteins: 0.7, carbs: 8, fats: 0.3 },
    raisin: { calories: 69, proteins: 0.7, carbs: 18, fats: 0.2 },

    // Proteins
    poulet: { calories: 165, proteins: 31, carbs: 0, fats: 3.6 },
    boeuf: { calories: 250, proteins: 26, carbs: 0, fats: 15 },
    poisson: { calories: 120, proteins: 22, carbs: 0, fats: 3 },
    saumon: { calories: 208, proteins: 20, carbs: 0, fats: 13 },
    oeuf: { calories: 155, proteins: 13, carbs: 1.1, fats: 11 },
    oeufs: { calories: 155, proteins: 13, carbs: 1.1, fats: 11 },

    // Dairy
    lait: { calories: 42, proteins: 3.4, carbs: 5, fats: 1 },
    yaourt: { calories: 59, proteins: 3.5, carbs: 5, fats: 3.3 },
    fromage: { calories: 350, proteins: 25, carbs: 1, fats: 28 },

    // Carbs
    pain: { calories: 265, proteins: 9, carbs: 49, fats: 3.2 },
    riz: { calories: 130, proteins: 2.7, carbs: 28, fats: 0.3 },
    pates: { calories: 131, proteins: 5, carbs: 25, fats: 1.1 },
    patate: { calories: 77, proteins: 2, carbs: 17, fats: 0.1 },
    'pomme de terre': { calories: 77, proteins: 2, carbs: 17, fats: 0.1 },

    // Vegetables
    salade: { calories: 15, proteins: 1.4, carbs: 2.9, fats: 0.2 },
    tomate: { calories: 18, proteins: 0.9, carbs: 3.9, fats: 0.2 },
    carotte: { calories: 41, proteins: 0.9, carbs: 10, fats: 0.2 },
    brocoli: { calories: 34, proteins: 2.8, carbs: 7, fats: 0.4 },
    courgette: { calories: 17, proteins: 1.2, carbs: 3.1, fats: 0.3 },
    haricot: { calories: 31, proteins: 1.8, carbs: 7, fats: 0.1 },

    // Prepared foods
    pizza: { calories: 266, proteins: 11, carbs: 33, fats: 10 },
    burger: { calories: 295, proteins: 17, carbs: 24, fats: 14 },
    sandwich: { calories: 250, proteins: 12, carbs: 30, fats: 9 },
    soupe: { calories: 50, proteins: 2, carbs: 8, fats: 1 },
    'salade composee': { calories: 120, proteins: 5, carbs: 10, fats: 7 },

    // Snacks
    chocolat: { calories: 546, proteins: 5, carbs: 60, fats: 31 },
    biscuit: { calories: 450, proteins: 6, carbs: 65, fats: 18 },
    chips: { calories: 536, proteins: 7, carbs: 53, fats: 35 },

    // Drinks
    cafe: { calories: 2, proteins: 0.1, carbs: 0, fats: 0 },
    the: { calories: 1, proteins: 0, carbs: 0.3, fats: 0 },
    jus: { calories: 45, proteins: 0.5, carbs: 10, fats: 0.1 },
  };

  // Find matching food
  for (const [key, nutrition] of Object.entries(foodDatabase)) {
    if (lowerName.includes(key)) {
      const multiplier = quantity / 100;
      return {
        calories: Math.round(nutrition.calories * multiplier),
        proteins: Math.round(nutrition.proteins * multiplier * 10) / 10,
        carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
        fats: Math.round(nutrition.fats * multiplier * 10) / 10,
      };
    }
  }

  // Default estimation for unknown foods
  const multiplier = quantity / 100;
  return {
    calories: Math.round(150 * multiplier),
    proteins: Math.round(5 * multiplier * 10) / 10,
    carbs: Math.round(20 * multiplier * 10) / 10,
    fats: Math.round(5 * multiplier * 10) / 10,
  };
};

// Parse voice input to extract food items
const parseVoiceInput = (text: string): ParsedFood[] => {
  const foods: ParsedFood[] = [];

  // Common patterns: "une pomme", "200g de poulet", "deux oeufs"
  const quantityWords: Record<string, number> = {
    'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5,
    'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
  };

  // Split by "et", "avec", "plus", commas
  const parts = text.toLowerCase().split(/\s*(?:et|avec|plus|,)\s*/);

  for (const part of parts) {
    if (!part.trim()) continue;

    let quantity = 100; // default to 100g
    let unit = 'g';
    let name = part.trim();

    // Check for number quantity (e.g., "200g de poulet")
    const gramMatch = part.match(/(\d+)\s*(?:g|gr|grammes?)\s*(?:de\s+)?(.+)/i);
    if (gramMatch) {
      quantity = parseInt(gramMatch[1]);
      name = gramMatch[2].trim();
    } else {
      // Check for word quantity (e.g., "deux oeufs")
      for (const [word, num] of Object.entries(quantityWords)) {
        if (part.startsWith(word + ' ')) {
          quantity = num * 50; // Assume 50g per unit
          name = part.replace(word + ' ', '').trim();
          unit = 'portion';
          break;
        }
      }
    }

    // Clean up name
    name = name.replace(/^(?:de |du |des |la |le |les |d')\s*/i, '');

    if (name) {
      foods.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        quantity,
        unit,
        estimatedNutrition: estimateNutrition(name, quantity),
      });
    }
  }

  return foods.length > 0 ? foods : [{
    name: text.charAt(0).toUpperCase() + text.slice(1),
    quantity: 100,
    unit: 'g',
    estimatedNutrition: estimateNutrition(text, 100),
  }];
};

export function VoiceFoodInput({ mealType, onAddToMeal, className }: VoiceFoodInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [parsedFoods, setParsedFoods] = useState<ParsedFood[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError('La reconnaissance vocale n\'est pas supportee par votre navigateur.');
      }
    }
  }, []);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript((prev) => prev + (prev ? ' ' : '') + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Acces au microphone refuse. Autorisez l\'acces dans les parametres.');
      } else if (event.error === 'no-speech') {
        setError('Aucune parole detectee. Reessayez.');
      } else {
        setError('Erreur de reconnaissance vocale.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) return;

    setTranscript('');
    setInterimTranscript('');
    setParsedFoods([]);
    setError(null);

    recognitionRef.current = initRecognition();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setError('Impossible de demarrer la reconnaissance vocale.');
      }
    }
  }, [isSupported, initRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Process transcript
  const processTranscript = useCallback(() => {
    if (!transcript.trim()) return;

    setIsProcessing(true);

    // Parse the voice input
    setTimeout(() => {
      const foods = parseVoiceInput(transcript);
      setParsedFoods(foods);
      setIsProcessing(false);
    }, 500);
  }, [transcript]);

  // Add foods to meal
  const handleAddFoods = useCallback(() => {
    if (parsedFoods.length === 0) return;

    const mealItems: MealItem[] = parsedFoods.map((food, index) => {
      const foodItem: FoodItem = {
        id: `voice-${Date.now()}-${index}`,
        name: food.name,
        serving: food.quantity || 100,
        servingUnit: (food.unit as 'g' | 'ml' | 'portion') || 'g',
        nutrition: food.estimatedNutrition,
        source: 'manual',
      };

      return {
        id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
        food: foodItem,
        quantity: 1,
        customServing: food.quantity,
      };
    });

    onAddToMeal(mealItems);

    // Reset state
    setTranscript('');
    setInterimTranscript('');
    setParsedFoods([]);
  }, [parsedFoods, onAddToMeal]);

  // Clear everything
  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
    setParsedFoods([]);
    setError(null);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-stone-800">Saisie vocale</h2>
        <p className="text-sm text-stone-500">
          Decrivez ce que vous avez mange
        </p>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main interface */}
      {isSupported && (
        <div className="space-y-4">
          {/* Microphone button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopListening : startListening}
              className={cn(
                'relative w-24 h-24 rounded-full flex items-center justify-center transition-all',
                isListening
                  ? 'bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/50'
                  : 'bg-stone-100 hover:bg-stone-200'
              )}
            >
              {isListening ? (
                <>
                  {/* Pulsing animation */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-rose-400"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <MicOff className="w-10 h-10 text-white relative z-10" />
                </>
              ) : (
                <Mic className="w-10 h-10 text-stone-600" />
              )}
            </motion.button>
          </div>

          {/* Instructions */}
          <p className="text-center text-sm text-stone-500">
            {isListening
              ? 'Parlez maintenant... Appuyez pour arreter'
              : 'Appuyez pour commencer'}
          </p>

          {/* Transcript display */}
          <AnimatePresence>
            {(transcript || interimTranscript) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl p-4 border border-stone-200"
              >
                <div className="flex items-start gap-3">
                  <Volume2 className="w-5 h-5 text-rose-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-stone-700">
                      {transcript}
                      {interimTranscript && (
                        <span className="text-stone-400 italic"> {interimTranscript}</span>
                      )}
                    </p>
                  </div>
                  {transcript && (
                    <button
                      onClick={handleClear}
                      className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Process button */}
          {transcript && !isListening && parsedFoods.length === 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={processTranscript}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Analyser
            </motion.button>
          )}

          {/* Parsed foods */}
          <AnimatePresence>
            {parsedFoods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <h3 className="font-semibold text-stone-700 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-rose-500" />
                  Aliments detectes
                </h3>

                {parsedFoods.map((food, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-4 border border-stone-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-stone-800">{food.name}</p>
                        <p className="text-sm text-stone-500">
                          {food.quantity}{food.unit}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-600 text-sm font-medium">
                        {food.estimatedNutrition.calories} kcal
                      </span>
                    </div>

                    {/* Macros */}
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1 text-stone-500">
                        <Beef className="w-3 h-3" />
                        {food.estimatedNutrition.proteins}g prot
                      </span>
                      <span className="flex items-center gap-1 text-stone-500">
                        <Wheat className="w-3 h-3" />
                        {food.estimatedNutrition.carbs}g gluc
                      </span>
                      <span className="flex items-center gap-1 text-stone-500">
                        <Droplets className="w-3 h-3" />
                        {food.estimatedNutrition.fats}g lip
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Add button */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClear}
                    className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-medium"
                  >
                    Recommencer
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddFoods}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Ajouter
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Examples */}
          {!transcript && !isListening && (
            <div className="bg-rose-50 rounded-xl p-4">
              <h4 className="font-medium text-rose-700 mb-2">Exemples</h4>
              <ul className="space-y-1 text-sm text-rose-600">
                <li>"Une pomme et un yaourt"</li>
                <li>"200 grammes de poulet avec du riz"</li>
                <li>"Salade composee et un cafe"</li>
                <li>"Deux oeufs au plat avec du pain"</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Not supported message */}
      {!isSupported && (
        <div className="text-center py-8">
          <MicOff className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">
            La reconnaissance vocale n'est pas disponible sur ce navigateur.
            <br />
            Essayez avec Chrome ou Safari.
          </p>
        </div>
      )}
    </div>
  );
}

export default VoiceFoodInput;
