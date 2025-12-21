// Family Store - Manages family mode state
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Family,
  FamilyMember,
  FamilyMealPlan,
  FamilyShoppingList,
  FamilyChallenge,
  FamilyNotification,
  FamilyHealthDashboard,
} from '@/types/family';

interface FamilyState {
  // Core data
  isFamilyMode: boolean;
  family: Family | null;
  members: FamilyMember[];
  currentMemberId: string | null;

  // Meal planning
  activeMealPlan: FamilyMealPlan | null;
  mealPlanHistory: FamilyMealPlan[];

  // Shopping
  activeShoppingList: FamilyShoppingList | null;
  shoppingHistory: FamilyShoppingList[];

  // Challenges
  activeChallenges: FamilyChallenge[];

  // Notifications
  notifications: FamilyNotification[];
  unreadCount: number;

  // Dashboard
  healthDashboard: FamilyHealthDashboard | null;

  // Loading states
  isLoading: boolean;
}

interface FamilyActions {
  // Mode
  setFamilyMode: (enabled: boolean) => void;
  toggleFamilyMode: () => void;

  // Family
  setFamily: (family: Family | null) => void;
  updateFamily: (updates: Partial<Family>) => void;

  // Members
  setMembers: (members: FamilyMember[]) => void;
  addMember: (member: FamilyMember) => void;
  updateMember: (memberId: string, updates: Partial<FamilyMember>) => void;
  removeMember: (memberId: string) => void;
  setCurrentMember: (memberId: string | null) => void;
  getMember: (memberId: string) => FamilyMember | undefined;

  // Meal Plan
  setActiveMealPlan: (plan: FamilyMealPlan | null) => void;
  addMealPlanToHistory: (plan: FamilyMealPlan) => void;

  // Shopping
  setActiveShoppingList: (list: FamilyShoppingList | null) => void;
  toggleShoppingItem: (itemId: string) => void;
  updateShoppingItemPrice: (itemId: string, price: number) => void;

  // Challenges
  setActiveChallenges: (challenges: FamilyChallenge[]) => void;
  addChallenge: (challenge: FamilyChallenge) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;

  // Notifications
  setNotifications: (notifications: FamilyNotification[]) => void;
  addNotification: (notification: FamilyNotification) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Dashboard
  setHealthDashboard: (dashboard: FamilyHealthDashboard | null) => void;

  // Utils
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState: FamilyState = {
  isFamilyMode: false,
  family: null,
  members: [],
  currentMemberId: null,
  activeMealPlan: null,
  mealPlanHistory: [],
  activeShoppingList: null,
  shoppingHistory: [],
  activeChallenges: [],
  notifications: [],
  unreadCount: 0,
  healthDashboard: null,
  isLoading: false,
};

export const useFamilyStore = create<FamilyState & FamilyActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Mode
      setFamilyMode: (enabled) => set({ isFamilyMode: enabled }),
      toggleFamilyMode: () => set((state) => ({ isFamilyMode: !state.isFamilyMode })),

      // Family
      setFamily: (family) => set({ family }),
      updateFamily: (updates) =>
        set((state) => ({
          family: state.family ? { ...state.family, ...updates } : null,
        })),

      // Members
      setMembers: (members) => set({ members }),
      addMember: (member) =>
        set((state) => ({
          members: [...state.members, member],
        })),
      updateMember: (memberId, updates) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, ...updates } : m
          ),
        })),
      removeMember: (memberId) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== memberId),
        })),
      setCurrentMember: (memberId) => set({ currentMemberId: memberId }),
      getMember: (memberId) => get().members.find((m) => m.id === memberId),

      // Meal Plan
      setActiveMealPlan: (plan) => set({ activeMealPlan: plan }),
      addMealPlanToHistory: (plan) =>
        set((state) => ({
          mealPlanHistory: [plan, ...state.mealPlanHistory].slice(0, 10),
        })),

      // Shopping
      setActiveShoppingList: (list) => set({ activeShoppingList: list }),
      toggleShoppingItem: (itemId) =>
        set((state) => {
          if (!state.activeShoppingList) return state;
          return {
            activeShoppingList: {
              ...state.activeShoppingList,
              items: state.activeShoppingList.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      isChecked: !item.isChecked,
                      checkedAt: !item.isChecked ? new Date().toISOString() : undefined,
                    }
                  : item
              ),
            },
          };
        }),
      updateShoppingItemPrice: (itemId, price) =>
        set((state) => {
          if (!state.activeShoppingList) return state;
          const items = state.activeShoppingList.items.map((item) =>
            item.id === itemId ? { ...item, actualPrice: price } : item
          );
          const actualTotal = items.reduce(
            (sum, item) => sum + (item.actualPrice || item.estimatedPrice || 0),
            0
          );
          return {
            activeShoppingList: {
              ...state.activeShoppingList,
              items,
              actualTotal,
            },
          };
        }),

      // Challenges
      setActiveChallenges: (challenges) => set({ activeChallenges: challenges }),
      addChallenge: (challenge) =>
        set((state) => ({
          activeChallenges: [...state.activeChallenges, challenge],
        })),
      updateChallengeProgress: (challengeId, progress) =>
        set((state) => ({
          activeChallenges: state.activeChallenges.map((c) =>
            c.id === challengeId ? { ...c, progress, goal: { ...c.goal, current: progress } } : c
          ),
        })),

      // Notifications
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 50),
          unreadCount: state.unreadCount + 1,
        })),
      markNotificationRead: (notificationId) =>
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          );
          return {
            notifications,
            unreadCount: notifications.filter((n) => !n.isRead).length,
          };
        }),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
            readAt: n.readAt || new Date().toISOString(),
          })),
          unreadCount: 0,
        })),
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

      // Dashboard
      setHealthDashboard: (dashboard) => set({ healthDashboard: dashboard }),

      // Utils
      setLoading: (loading) => set({ isLoading: loading }),
      reset: () => set(initialState),
    }),
    {
      name: 'lym-family-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isFamilyMode: state.isFamilyMode,
        family: state.family,
        members: state.members,
        currentMemberId: state.currentMemberId,
        activeMealPlan: state.activeMealPlan,
        activeShoppingList: state.activeShoppingList,
        activeChallenges: state.activeChallenges,
      }),
    }
  )
);

// Selectors
export const useIsFamily = () => useFamilyStore((state) => state.isFamilyMode);
export const useFamily = () => useFamilyStore((state) => state.family);
export const useFamilyMembers = () => useFamilyStore((state) => state.members);
export const useCurrentMember = () =>
  useFamilyStore((state) =>
    state.currentMemberId
      ? state.members.find((m) => m.id === state.currentMemberId)
      : null
  );
export const useFamilyNotifications = () =>
  useFamilyStore((state) => ({
    notifications: state.notifications,
    unreadCount: state.unreadCount,
  }));
