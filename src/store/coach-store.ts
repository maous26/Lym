// Coach Store - Manages AI coach insights and notifications
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type InsightType = 'success' | 'warning' | 'info' | 'tip' | 'achievement';
export type InsightPriority = 'high' | 'medium' | 'low';

export interface CoachInsight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  message: string;
  action?: string;
  actionLink?: string;
  icon?: string;
  createdAt: string;
  read: boolean;
  dismissed: boolean;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CoachState {
  // Insights
  insights: CoachInsight[];
  hasUnreadInsights: boolean;

  // Conversation
  messages: ConversationMessage[];
  isTyping: boolean;

  // Quick suggestions
  quickSuggestions: string[];

  // Stats
  totalMessages: number;
  streakDays: number;
}

interface CoachActions {
  // Insights
  addInsight: (
    insight: Omit<CoachInsight, 'id' | 'createdAt' | 'read' | 'dismissed'>
  ) => void;
  markAsRead: (id: string) => void;
  dismissInsight: (id: string) => void;
  clearOldInsights: () => void;
  getUnreadCount: () => number;
  getTopInsights: (limit: number) => CoachInsight[];

  // Conversation
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;

  // Suggestions
  setQuickSuggestions: (suggestions: string[]) => void;

  // Stats
  incrementStreak: () => void;

  // Reset
  reset: () => void;
}

const DEFAULT_SUGGESTIONS = [
  'Idée de petit-déjeuner sain 🥑',
  'Comment manger plus de protéines ? 💪',
  'Recette rapide pour ce soir 🍳',
  "Astuce pour boire plus d'eau 💧",
  'Snack healthy pour le goûter 🍎',
  'Comment réduire le sucre ? 🍬',
];

const initialState: CoachState = {
  insights: [],
  hasUnreadInsights: false,
  messages: [],
  isTyping: false,
  quickSuggestions: DEFAULT_SUGGESTIONS,
  totalMessages: 0,
  streakDays: 0,
};

export const useCoachStore = create<CoachState & CoachActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Insights
      addInsight: (insight) => {
        const newInsight: CoachInsight = {
          ...insight,
          id: `insight-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
          read: false,
          dismissed: false,
        };

        set((state) => ({
          insights: [newInsight, ...state.insights].slice(0, 50), // Keep max 50
          hasUnreadInsights: true,
        }));
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedInsights = state.insights.map((insight) =>
            insight.id === id ? { ...insight, read: true } : insight
          );

          const hasUnread = updatedInsights.some((i) => !i.read && !i.dismissed);

          return {
            insights: updatedInsights,
            hasUnreadInsights: hasUnread,
          };
        });
      },

      dismissInsight: (id) => {
        set((state) => {
          const updatedInsights = state.insights.map((insight) =>
            insight.id === id ? { ...insight, dismissed: true, read: true } : insight
          );

          const hasUnread = updatedInsights.some((i) => !i.read && !i.dismissed);

          return {
            insights: updatedInsights,
            hasUnreadInsights: hasUnread,
          };
        });
      },

      clearOldInsights: () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        set((state) => ({
          insights: state.insights.filter(
            (insight) => new Date(insight.createdAt) > sevenDaysAgo
          ),
        }));
      },

      getUnreadCount: () => {
        return get().insights.filter((i) => !i.read && !i.dismissed).length;
      },

      getTopInsights: (limit) => {
        const { insights } = get();
        const priorityOrder = { high: 0, medium: 1, low: 2 };

        return insights
          .filter((i) => !i.dismissed)
          .sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .slice(0, limit);
      },

      // Conversation
      addMessage: (role, content) => {
        const message: ConversationMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role,
          content,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, message],
          totalMessages: state.totalMessages + 1,
        }));
      },

      setTyping: (typing) => set({ isTyping: typing }),

      clearMessages: () => set({ messages: [] }),

      // Suggestions
      setQuickSuggestions: (suggestions) => set({ quickSuggestions: suggestions }),

      // Stats
      incrementStreak: () => {
        set((state) => ({ streakDays: state.streakDays + 1 }));
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'lym-coach-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        insights: state.insights,
        messages: state.messages.slice(-20), // Keep last 20 messages
        totalMessages: state.totalMessages,
        streakDays: state.streakDays,
      }),
    }
  )
);

// Selectors
export const useUnreadInsights = () =>
  useCoachStore((state) => state.insights.filter((i) => !i.read && !i.dismissed));

export const useCoachMessages = () => useCoachStore((state) => state.messages);
