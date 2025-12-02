import { create } from 'zustand';
import type { Family, FamilyMember } from '@/types/family';

// ==========================================
// STORE ONBOARDING FAMILLE
// Gère uniquement l'onboarding du mode famille
// ==========================================

interface FamilyOnboardingState {
    currentStep: number;
    totalSteps: number;

    // Données collectées
    familyName: string;
    weeklyBudget: number | null;
    members: Partial<FamilyMember>[];

    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    setFamilyName: (name: string) => void;
    setWeeklyBudget: (budget: number | null) => void;
    setMembers: (members: Partial<FamilyMember>[]) => void;
    addMember: (member: Partial<FamilyMember>) => void;
    updateMember: (memberId: string, updates: Partial<FamilyMember>) => void;
    removeMember: (memberId: string) => void;

    reset: () => void;
}

const initialState = {
    currentStep: 0,
    totalSteps: 3, // Welcome -> Setup Members -> Confirmation
    familyName: '',
    weeklyBudget: null,
    members: [],
};

export const useFamilyOnboardingStore = create<FamilyOnboardingState>((set, get) => ({
    ...initialState,

    setStep: (step) => set({ currentStep: step }),

    nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
            set({ currentStep: currentStep + 1 });
        }
    },

    prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
            set({ currentStep: currentStep - 1 });
        }
    },

    setFamilyName: (name) => set({ familyName: name }),

    setWeeklyBudget: (budget) => set({ weeklyBudget: budget }),

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

    reset: () => set(initialState),
}));
