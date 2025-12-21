import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  UserProfile,
  AppMode,
  SubscriptionPlan,
  NutritionalNeeds,
} from '@/types/user';
import type { Family, FamilyMember } from '@/types/family';

// User store state
interface UserState {
  // Auth
  userId: string | null;
  isAuthenticated: boolean;

  // Mode
  activeMode: AppMode | null;
  subscriptionPlan: SubscriptionPlan;

  // Solo profile
  soloProfile: UserProfile | null;
  soloOnboardingCompleted: boolean;
  soloNutritionalNeeds: NutritionalNeeds | null;

  // Family
  family: Family | null;
  familyMembers: FamilyMember[];
  currentMemberId: string | null;
  familyOnboardingCompleted: boolean;

  // UI State
  isLoading: boolean;
  isHydrated: boolean;
}

// User store actions
interface UserActions {
  // Auth
  setUserId: (userId: string | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;

  // Mode
  setActiveMode: (mode: AppMode | null) => void;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;

  // Solo
  setSoloProfile: (profile: Partial<UserProfile>) => void;
  updateSoloProfile: (updates: Partial<UserProfile>) => void;
  setSoloNutritionalNeeds: (needs: NutritionalNeeds) => void;
  completeSoloOnboarding: () => void;
  resetSoloOnboarding: () => void;

  // Family
  setFamily: (family: Family | null) => void;
  setFamilyMembers: (members: FamilyMember[]) => void;
  setCurrentMember: (memberId: string | null) => void;
  addFamilyMember: (member: FamilyMember) => void;
  updateFamilyMember: (memberId: string, updates: Partial<FamilyMember>) => void;
  removeFamilyMember: (memberId: string) => void;
  completeFamilyOnboarding: () => void;
  resetFamilyOnboarding: () => void;

  // UI
  setLoading: (isLoading: boolean) => void;
  setHydrated: (isHydrated: boolean) => void;

  // Reset
  reset: () => void;
}

// Initial state
const initialState: UserState = {
  userId: null,
  isAuthenticated: false,
  activeMode: null,
  subscriptionPlan: 'free',
  soloProfile: null,
  soloOnboardingCompleted: false,
  soloNutritionalNeeds: null,
  family: null,
  familyMembers: [],
  currentMemberId: null,
  familyOnboardingCompleted: false,
  isLoading: false,
  isHydrated: false,
};

// Create the store
export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Auth actions
      setUserId: (userId) => set({ userId, isAuthenticated: !!userId }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      logout: () => set({ ...initialState, isHydrated: true }),

      // Mode actions
      setActiveMode: (mode) => set({ activeMode: mode }),
      setSubscriptionPlan: (plan) => set({ subscriptionPlan: plan }),

      // Solo actions
      setSoloProfile: (profile) =>
        set({ soloProfile: { ...get().soloProfile, ...profile } as UserProfile }),
      updateSoloProfile: (updates) =>
        set((state) => ({
          soloProfile: state.soloProfile
            ? { ...state.soloProfile, ...updates }
            : (updates as UserProfile),
        })),
      setSoloNutritionalNeeds: (needs) => set({ soloNutritionalNeeds: needs }),
      completeSoloOnboarding: () =>
        set((state) => ({
          soloOnboardingCompleted: true,
          soloProfile: state.soloProfile
            ? { ...state.soloProfile, onboardingCompleted: true }
            : null,
        })),
      resetSoloOnboarding: () =>
        set({
          soloProfile: null,
          soloOnboardingCompleted: false,
          soloNutritionalNeeds: null,
        }),

      // Family actions
      setFamily: (family) => set({ family }),
      setFamilyMembers: (members) => set({ familyMembers: members }),
      setCurrentMember: (memberId) => set({ currentMemberId: memberId }),
      addFamilyMember: (member) =>
        set((state) => ({
          familyMembers: [...state.familyMembers, member],
        })),
      updateFamilyMember: (memberId, updates) =>
        set((state) => ({
          familyMembers: state.familyMembers.map((m) =>
            m.id === memberId ? { ...m, ...updates } : m
          ),
        })),
      removeFamilyMember: (memberId) =>
        set((state) => ({
          familyMembers: state.familyMembers.filter((m) => m.id !== memberId),
        })),
      completeFamilyOnboarding: () => set({ familyOnboardingCompleted: true }),
      resetFamilyOnboarding: () =>
        set({
          family: null,
          familyMembers: [],
          currentMemberId: null,
          familyOnboardingCompleted: false,
        }),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: (isHydrated) => set({ isHydrated }),

      // Reset
      reset: () => set({ ...initialState, isHydrated: true }),
    }),
    {
      name: 'lym-user-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
        activeMode: state.activeMode,
        subscriptionPlan: state.subscriptionPlan,
        soloProfile: state.soloProfile,
        soloOnboardingCompleted: state.soloOnboardingCompleted,
        soloNutritionalNeeds: state.soloNutritionalNeeds,
        family: state.family,
        familyMembers: state.familyMembers,
        currentMemberId: state.currentMemberId,
        familyOnboardingCompleted: state.familyOnboardingCompleted,
      }),
    }
  )
);

// Selector hooks for better performance
export const useUserId = () => useUserStore((state) => state.userId);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useActiveMode = () => useUserStore((state) => state.activeMode);
export const useIsSoloMode = () => useUserStore((state) => state.activeMode === 'solo');
export const useIsFamilyMode = () => useUserStore((state) => state.activeMode === 'family');
export const useSoloProfile = () => useUserStore((state) => state.soloProfile);
export const useSoloOnboardingCompleted = () =>
  useUserStore((state) => state.soloOnboardingCompleted);
export const useFamily = () => useUserStore((state) => state.family);
export const useFamilyMembers = () => useUserStore((state) => state.familyMembers);
export const useCurrentMember = () =>
  useUserStore((state) =>
    state.familyMembers.find((m) => m.id === state.currentMemberId)
  );
export const useSubscriptionPlan = () => useUserStore((state) => state.subscriptionPlan);
export const useIsHydrated = () => useUserStore((state) => state.isHydrated);
export const useIsLoading = () => useUserStore((state) => state.isLoading);

// Check if user can switch mode
export const useCanSwitchMode = () =>
  useUserStore((state) => {
    const hasCompletedSolo = state.soloOnboardingCompleted;
    const hasCompletedFamily = state.familyOnboardingCompleted;
    const isPremium = state.subscriptionPlan !== 'free';
    return hasCompletedSolo && (hasCompletedFamily || isPremium);
  });
