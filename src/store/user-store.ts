import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  UserProfile,
  AppMode,
  SubscriptionPlan,
  NutritionalNeeds,
} from '@/types/user';
import type { Family, FamilyMember } from '@/types/family';
import { saveUserProfile, loadUserProfile, type UserProfileData } from '@/app/actions/sync';

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

  // Database sync
  syncFromDatabase: () => Promise<void>;
  syncToDatabase: () => Promise<void>;

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
      setSoloProfile: (profile) => {
        set({ soloProfile: { ...get().soloProfile, ...profile } as UserProfile });
        // Sync to database after update
        setTimeout(() => get().syncToDatabase(), 100);
      },
      updateSoloProfile: (updates) => {
        set((state) => ({
          soloProfile: state.soloProfile
            ? { ...state.soloProfile, ...updates }
            : (updates as UserProfile),
        }));
        // Sync to database after update
        setTimeout(() => get().syncToDatabase(), 100);
      },
      setSoloNutritionalNeeds: (needs) => {
        set({ soloNutritionalNeeds: needs });
        // Sync to database after update
        setTimeout(() => get().syncToDatabase(), 100);
      },
      completeSoloOnboarding: () => {
        set((state) => ({
          soloOnboardingCompleted: true,
          soloProfile: state.soloProfile
            ? { ...state.soloProfile, onboardingCompleted: true }
            : null,
        }));
        // Sync to database after completing onboarding
        setTimeout(() => get().syncToDatabase(), 100);
      },
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

      // Database sync
      syncFromDatabase: async () => {
        set({ isLoading: true });
        try {
          const result = await loadUserProfile();
          if (result.success && result.profile) {
            const profile = result.profile;

            // Convert DB profile to local profile format
            const localProfile: Partial<UserProfile> = {
              firstName: profile.firstName || undefined,
              lastName: profile.lastName || undefined,
              birthDate: profile.birthDate || undefined,
              gender: profile.gender as 'male' | 'female' | 'other' | undefined,
              height: profile.height || undefined,
              weight: profile.weight || undefined,
              targetWeight: profile.targetWeight || undefined,
              activityLevel: profile.activityLevel as UserProfile['activityLevel'],
              goal: profile.goal as UserProfile['goal'],
              dietType: profile.dietType as UserProfile['dietType'],
              allergies: profile.allergies || [],
              intolerances: profile.intolerances || [],
              dislikedFoods: profile.dislikedFoods || [],
              likedFoods: profile.likedFoods || [],
              cookingSkillLevel: profile.cookingSkillLevel as UserProfile['cookingSkillLevel'],
              cookingTimeWeekday: profile.cookingTimeWeekday || undefined,
              cookingTimeWeekend: profile.cookingTimeWeekend || undefined,
              weeklyBudget: profile.weeklyBudget || undefined,
              onboardingCompleted: profile.onboardingCompleted,
            };

            // Calculate nutritional needs from DB values with default micronutrients
            const nutritionalNeeds: NutritionalNeeds | null = profile.dailyCaloriesTarget ? {
              calories: profile.dailyCaloriesTarget,
              proteins: profile.proteinTarget || 0,
              carbs: profile.carbsTarget || 0,
              fats: profile.fatTarget || 0,
              fiber: 25,
              water: 2,
              calcium: 1000,
              iron: 14,
              vitaminD: 600,
              vitaminC: 90,
              vitaminB12: 2.4,
              zinc: 11,
              magnesium: 400,
              potassium: 3500,
              omega3: 1.6,
            } : null;

            set({
              soloProfile: localProfile as UserProfile,
              soloOnboardingCompleted: profile.onboardingCompleted || false,
              soloNutritionalNeeds: nutritionalNeeds,
              subscriptionPlan: (profile.subscriptionPlan as SubscriptionPlan) || 'free',
            });
          }
        } catch (error) {
          console.error('Error syncing user profile from database:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      syncToDatabase: async () => {
        const state = get();
        if (!state.soloProfile) return;

        const profile = state.soloProfile;
        const needs = state.soloNutritionalNeeds;

        const dbProfile: UserProfileData = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          birthDate: profile.birthDate,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          targetWeight: profile.targetWeight,
          activityLevel: profile.activityLevel,
          goal: profile.goal,
          dailyCaloriesTarget: needs?.calories,
          proteinTarget: needs?.proteins,
          carbsTarget: needs?.carbs,
          fatTarget: needs?.fats,
          dietType: profile.dietType,
          allergies: profile.allergies,
          intolerances: profile.intolerances,
          dislikedFoods: profile.dislikedFoods,
          likedFoods: profile.likedFoods,
          cookingSkillLevel: profile.cookingSkillLevel,
          cookingTimeWeekday: profile.cookingTimeWeekday,
          cookingTimeWeekend: profile.cookingTimeWeekend,
          weeklyBudget: profile.weeklyBudget,
          fastingSchedule: profile.fastingSchedule,
          onboardingCompleted: state.soloOnboardingCompleted,
          subscriptionPlan: state.subscriptionPlan,
        };

        try {
          await saveUserProfile(dbProfile);
        } catch (error) {
          console.error('Error syncing user profile to database:', error);
        }
      },

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
