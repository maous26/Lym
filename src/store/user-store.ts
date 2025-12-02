import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types/user';
import type { Family, FamilyMember } from '@/types/family';

// ==========================================
// STORE UTILISATEUR UNIFIÉ
// Gère à la fois le profil Solo ET le profil Famille
// ==========================================

export type ActiveMode = 'solo' | 'family' | null;
export type SubscriptionPlan = 'basic' | 'premium' | 'family';

interface UserState {
    // Utilisateur actuel
    userId: string | null;

    // Mode actif (solo ou famille)
    activeMode: ActiveMode;

    // Subscription plan
    subscriptionPlan: SubscriptionPlan;

    // PROFIL SOLO
    soloProfile: UserProfile | null;
    soloOnboardingCompleted: boolean;

    // PROFIL FAMILLE
    family: Family | null;
    members: FamilyMember[];
    currentMemberId: string | null; // Membre actif dans la famille
    familyOnboardingCompleted: boolean;

    // État UI
    isLoading: boolean;
    _hasHydrated: boolean;

    // Actions générales
    setUserId: (userId: string) => void;
    setActiveMode: (mode: ActiveMode) => void;
    setSubscriptionPlan: (plan: SubscriptionPlan) => void;
    setLoading: (loading: boolean) => void;
    setHasHydrated: (state: boolean) => void;

    // Actions SOLO
    setSoloProfile: (profile: UserProfile | null) => void;
    updateSoloProfile: (updates: Partial<UserProfile>) => void;
    completeSoloOnboarding: () => void;
    resetSoloProfile: () => void;

    // Actions FAMILLE
    setFamily: (family: Family | null) => void;
    setMembers: (members: FamilyMember[]) => void;
    setCurrentMember: (memberId: string | null) => void;
    addMember: (member: FamilyMember) => void;
    updateMember: (memberId: string, updates: Partial<FamilyMember>) => void;
    removeMember: (memberId: string) => void;
    completeFamilyOnboarding: () => void;
    resetFamilyProfile: () => void;

    // Getters
    hasSoloProfile: () => boolean;
    hasFamilyProfile: () => boolean;
    canSwitchMode: () => boolean;
    getAdminMember: () => FamilyMember | null;
    getCurrentMember: () => FamilyMember | null;

    // Reset global
    reset: () => void;
}

const initialState = {
    userId: null,
    activeMode: null,
    subscriptionPlan: 'basic' as SubscriptionPlan,
    soloProfile: null,
    soloOnboardingCompleted: false,
    family: null,
    members: [],
    currentMemberId: null,
    familyOnboardingCompleted: false,
    isLoading: false,
    _hasHydrated: false,
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ==========================================
            // ACTIONS GÉNÉRALES
            // ==========================================

            setUserId: (userId) => set({ userId }),

            setActiveMode: (mode) => set({ activeMode: mode }),

            setSubscriptionPlan: (plan) => set({ subscriptionPlan: plan }),

            setLoading: (loading) => set({ isLoading: loading }),

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            // ==========================================
            // ACTIONS SOLO
            // ==========================================

            setSoloProfile: (profile) => set({ soloProfile: profile }),

            updateSoloProfile: (updates) => set((state) => ({
                soloProfile: state.soloProfile
                    ? { ...state.soloProfile, ...updates }
                    : null,
            })),

            completeSoloOnboarding: () => set({
                soloOnboardingCompleted: true,
                activeMode: 'solo',
            }),

            resetSoloProfile: () => set({
                soloProfile: null,
                soloOnboardingCompleted: false,
            }),

            // ==========================================
            // ACTIONS FAMILLE
            // ==========================================

            setFamily: (family) => set({ family }),

            setMembers: (members) => set({ members }),

            setCurrentMember: (memberId) => set({ currentMemberId: memberId }),

            addMember: (member) => set((state) => ({
                members: [...state.members, member],
            })),

            updateMember: (memberId, updates) => set((state) => ({
                members: state.members.map((m) =>
                    m.id === memberId ? { ...m, ...updates } : m
                ),
            })),

            removeMember: (memberId) => set((state) => ({
                members: state.members.filter((m) => m.id !== memberId),
            })),

            completeFamilyOnboarding: () => set({
                familyOnboardingCompleted: true,
                activeMode: 'family',
            }),

            resetFamilyProfile: () => set({
                family: null,
                members: [],
                currentMemberId: null,
                familyOnboardingCompleted: false,
            }),

            // ==========================================
            // GETTERS
            // ==========================================

            hasSoloProfile: () => {
                const { soloProfile, soloOnboardingCompleted } = get();
                return soloProfile !== null && soloOnboardingCompleted;
            },

            hasFamilyProfile: () => {
                const { family, familyOnboardingCompleted } = get();
                return family !== null && familyOnboardingCompleted;
            },

            canSwitchMode: () => {
                const { hasSoloProfile, hasFamilyProfile } = get();
                return hasSoloProfile() && hasFamilyProfile();
            },

            getAdminMember: () => {
                const { family, members } = get();
                if (!family) return null;
                return members.find((m) => m.userId === family.adminId) || null;
            },

            getCurrentMember: () => {
                const { currentMemberId, members } = get();
                if (!currentMemberId) return null;
                return members.find((m) => m.id === currentMemberId) || null;
            },

            // ==========================================
            // RESET GLOBAL
            // ==========================================

            reset: () => set(initialState),
        }),
        {
            name: 'lym-user-storage',
            partialize: (state) => ({
                userId: state.userId,
                activeMode: state.activeMode,
                subscriptionPlan: state.subscriptionPlan,
                soloProfile: state.soloProfile,
                soloOnboardingCompleted: state.soloOnboardingCompleted,
                family: state.family,
                members: state.members,
                currentMemberId: state.currentMemberId,
                familyOnboardingCompleted: state.familyOnboardingCompleted,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

// ==========================================
// HOOKS UTILITAIRES
// ==========================================

/**
 * Hook pour obtenir le mode actif
 */
export const useActiveMode = () => {
    return useUserStore((state) => state.activeMode);
};

/**
 * Hook pour savoir si l'utilisateur est en mode solo
 */
export const useIsSoloMode = () => {
    return useUserStore((state) => state.activeMode === 'solo');
};

/**
 * Hook pour savoir si l'utilisateur est en mode famille
 */
export const useIsFamilyMode = () => {
    return useUserStore((state) => state.activeMode === 'family');
};

/**
 * Hook pour obtenir le profil solo
 */
export const useSoloProfile = () => {
    return useUserStore((state) => state.soloProfile);
};

/**
 * Hook pour obtenir la famille
 */
export const useFamily = () => {
    return useUserStore((state) => state.family);
};

/**
 * Hook pour obtenir les membres de la famille
 */
export const useFamilyMembers = () => {
    return useUserStore((state) => state.members);
};

/**
 * Hook pour savoir si l'utilisateur peut changer de mode
 */
export const useCanSwitchMode = () => {
    const canSwitchMode = useUserStore((state) => state.canSwitchMode);
    return canSwitchMode();
};

/**
 * Hook pour obtenir le plan de subscription
 */
export const useSubscriptionPlan = () => {
    return useUserStore((state) => state.subscriptionPlan);
};
