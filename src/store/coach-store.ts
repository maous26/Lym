import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InsightType = 'success' | 'warning' | 'info' | 'tip';
export type InsightPriority = 'high' | 'medium' | 'low';

export interface CoachInsight {
    id: string;
    type: InsightType;
    priority: InsightPriority;
    title: string;
    message: string;
    action?: string;
    actionLink?: string;
    createdAt: Date;
    read: boolean;
    dismissed: boolean;
}

interface CoachState {
    insights: CoachInsight[];
    hasUnreadInsights: boolean;
    lastCheckDate: string | null;

    // Actions
    addInsight: (insight: Omit<CoachInsight, 'id' | 'createdAt' | 'read' | 'dismissed'>) => void;
    markAsRead: (id: string) => void;
    dismissInsight: (id: string) => void;
    clearOldInsights: () => void;
    getUnreadCount: () => number;
    getTopInsights: (limit: number) => CoachInsight[];
}

export const useCoachStore = create<CoachState>()(
    persist(
        (set, get) => ({
            insights: [],
            hasUnreadInsights: false,
            lastCheckDate: null,

            addInsight: (insight) => {
                const newInsight: CoachInsight = {
                    ...insight,
                    id: `insight-${Date.now()}-${Math.random()}`,
                    createdAt: new Date(),
                    read: false,
                    dismissed: false,
                };

                set((state) => ({
                    insights: [newInsight, ...state.insights],
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

                // Filter non-dismissed, sort by priority and date
                const priorityOrder = { high: 0, medium: 1, low: 2 };

                return insights
                    .filter((i) => !i.dismissed)
                    .sort((a, b) => {
                        // First by priority
                        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                        if (priorityDiff !== 0) return priorityDiff;

                        // Then by date (newest first)
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .slice(0, limit);
            },
        }),
        {
            name: 'lym-coach-storage',
        }
    )
);
