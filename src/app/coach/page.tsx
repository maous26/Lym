'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  MessageCircle,
  Bell,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Trophy,
  TrendingUp,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChatInterface } from '@/components/features/coach/ChatInterface';
import { useCoachStore, type CoachInsight } from '@/store/coach-store';
import { useMealStore } from '@/store/meal-store';
import { useUserStore } from '@/store/user-store';
import { generateProactiveInsights, type UserContext } from '@/app/actions/ai';
import { chatWithCoach } from '@/app/actions/ai';
import { cn } from '@/lib/utils';

type TabType = 'messages' | 'chat';

// Icon mapping for insight types
const insightIcons = {
  tip: Lightbulb,
  alert: AlertTriangle,
  motivation: TrendingUp,
  achievement: Trophy,
  reminder: Clock,
  trend: TrendingUp,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Lightbulb,
};

// Color mapping for insight types
const insightColors = {
  tip: 'from-blue-500 to-cyan-500',
  alert: 'from-amber-500 to-orange-500',
  motivation: 'from-emerald-500 to-teal-500',
  achievement: 'from-purple-500 to-pink-500',
  reminder: 'from-indigo-500 to-blue-500',
  trend: 'from-teal-500 to-emerald-500',
  success: 'from-green-500 to-emerald-500',
  warning: 'from-amber-500 to-orange-500',
  info: 'from-blue-500 to-indigo-500',
};

// Insight card component
function InsightCard({
  insight,
  onMarkRead,
  onDismiss,
}: {
  insight: CoachInsight;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const router = useRouter();
  const Icon = insightIcons[insight.type as keyof typeof insightIcons] || Lightbulb;
  const colorClass = insightColors[insight.type as keyof typeof insightColors] || 'from-blue-500 to-cyan-500';

  const handleClick = () => {
    onMarkRead(insight.id);
    if (insight.actionLink) {
      router.push(insight.actionLink);
    }
  };

  const timeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        'relative bg-white rounded-2xl p-4 shadow-sm border',
        !insight.read ? 'border-primary-200 bg-primary-50/30' : 'border-stone-100'
      )}
    >
      {/* Unread indicator */}
      {!insight.read && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary-500" />
      )}

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(insight.id)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-stone-100 text-stone-400"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0',
            `bg-gradient-to-br ${colorClass}`
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-stone-800 text-sm">{insight.title}</h3>
            {insight.priority === 'high' && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded">
                Important
              </span>
            )}
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{insight.message}</p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-stone-400">{timeAgo(insight.createdAt)}</span>

            {insight.action && (
              <button
                onClick={handleClick}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                {insight.action}
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CoachPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('messages');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Stores
  const {
    insights,
    addInsight,
    markAsRead,
    dismissInsight,
    getUnreadCount,
    totalMessages,
    streakDays,
  } = useCoachStore();
  const { meals } = useMealStore();
  const { soloProfile, soloNutritionalNeeds } = useUserStore();

  // Get unread insights
  const unreadInsights = insights.filter((i) => !i.read && !i.dismissed);
  const allActiveInsights = insights.filter((i) => !i.dismissed);
  const unreadCount = getUnreadCount();

  // Build context for proactive insights
  const buildUserContext = useCallback((): UserContext | null => {
    if (!soloProfile || !soloNutritionalNeeds) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals[today];

    // Calculate today's nutrition
    const consumed = todayMeals?.totalNutrition || { calories: 0, proteins: 0, carbs: 0, fats: 0 };
    const targets = {
      calories: soloNutritionalNeeds.calories || 2000,
      proteins: soloNutritionalNeeds.proteins || 100,
      carbs: soloNutritionalNeeds.carbs || 250,
      fats: soloNutritionalNeeds.fats || 65,
    };

    // Build weekly data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayMeals = meals[dateKey];

      weeklyData.push({
        date: dateKey,
        calories: dayMeals?.totalNutrition?.calories || 0,
        proteins: dayMeals?.totalNutrition?.proteins || 0,
        carbs: dayMeals?.totalNutrition?.carbs || 0,
        fats: dayMeals?.totalNutrition?.fats || 0,
        mealsLogged: [
          dayMeals?.breakfast,
          dayMeals?.lunch,
          dayMeals?.snack,
          dayMeals?.dinner,
        ].filter(Boolean).length,
      });
    }

    return {
      profile: soloProfile,
      todayNutrition: { consumed, targets },
      weeklyData,
      streakDays,
    };
  }, [soloProfile, soloNutritionalNeeds, meals, streakDays]);

  // Load proactive insights
  const loadProactiveInsights = useCallback(async () => {
    const context = buildUserContext();
    if (!context) return;

    setIsLoadingInsights(true);
    try {
      const result = await generateProactiveInsights(context);
      if (result.success && result.insights) {
        // Add new insights that don't already exist
        result.insights.forEach((insight) => {
          const exists = insights.some(
            (i) => i.title === insight.title && !i.dismissed
          );
          if (!exists) {
            addInsight({
              type: insight.type as any,
              priority: insight.priority,
              title: insight.title,
              message: insight.message,
              action: insight.action,
              actionLink: insight.actionLink,
            });
          }
        });
      }
    } catch (error) {
      console.error('Error loading proactive insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [buildUserContext, insights, addInsight]);

  // Load insights on mount
  useEffect(() => {
    // Only load if we haven't loaded recently (check last insight time)
    const lastInsight = insights[0];
    const shouldLoad =
      !lastInsight ||
      Date.now() - new Date(lastInsight.createdAt).getTime() > 30 * 60 * 1000; // 30 min

    if (shouldLoad && soloProfile) {
      loadProactiveInsights();
    }
  }, [soloProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real AI chat handler
  const handleSendMessage = async (message: string): Promise<string> => {
    const context = buildUserContext();

    const result = await chatWithCoach(
      message,
      context
        ? {
            consumed: context.todayNutrition.consumed,
            targets: context.todayNutrition.targets,
          }
        : undefined,
      soloProfile || undefined
    );

    if (result.success && result.message) {
      return result.message;
    }

    return "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.";
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-stone-800">Coach LYM</h1>
              <p className="text-xs text-stone-500">Votre assistant nutritionnel</p>
            </div>
          </div>

          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Tabs */}
        <div className="flex border-t border-stone-100">
          <button
            onClick={() => setActiveTab('messages')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'messages'
                ? 'text-primary-600'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            <Bell className="w-4 h-4" />
            Messages
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {activeTab === 'messages' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'chat'
                ? 'text-primary-600'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Chat
            {activeTab === 'chat' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
              />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'messages' ? (
            <motion.div
              key="messages"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto pb-20"
            >
              {/* Stats */}
              <div className="flex items-center justify-center gap-6 py-3 bg-white border-b border-stone-100">
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{totalMessages} échanges</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-stone-300" />
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{streakDays} jours d'affilée</span>
                </div>
              </div>

              {/* Insights list */}
              <div className="p-4 space-y-3">
                {isLoadingInsights && allActiveInsights.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
                      />
                      <span className="text-sm text-stone-500">
                        Analyse de vos habitudes...
                      </span>
                    </div>
                  </div>
                )}

                {allActiveInsights.length === 0 && !isLoadingInsights && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-stone-400" />
                    </div>
                    <h3 className="font-semibold text-stone-800 mb-1">
                      Pas de nouveaux messages
                    </h3>
                    <p className="text-sm text-stone-500 max-w-xs">
                      Votre coach vous enverra des conseils personnalisés basés sur vos habitudes.
                    </p>
                    <button
                      onClick={loadProactiveInsights}
                      className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      Rafraîchir
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {allActiveInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onMarkRead={markAsRead}
                      onDismiss={dismissInsight}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <ChatInterface
                onSendMessage={handleSendMessage}
                className="h-[calc(100vh-140px)]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
