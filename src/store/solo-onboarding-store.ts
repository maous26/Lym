import { create } from 'zustand';
import { UserProfile, ChildProfile } from '@/types/user';

// ==========================================
// STORE ONBOARDING SOLO
// Gère uniquement l'onboarding du mode solo
// ==========================================

interface SoloOnboardingState {
    currentStep: number;
    totalSteps: number;
    profile: Partial<UserProfile>;

    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    updateProfile: (data: Partial<UserProfile>) => void;
    addChild: (child: ChildProfile) => void;
    removeChild: (id: string) => void;
    reset: () => void;
}

const initialProfile: Partial<UserProfile> = {
    name: '',
    age: null,
    gender: null,
    height: null,
    weight: null,
    targetWeight: null,
    activityLevel: null,
    primaryGoal: null,
    dietaryPreferences: 'omnivore',
    allergies: [],
    isParent: false,
    children: [],
    cookingTimePerDay: 30,
    weightLossGoalKg: undefined,
    suggestedDurationWeeks: undefined,
    cookingSkillLevel: undefined,
    cookingTimeWeekday: 30,
    cookingTimeWeekend: 60,
    fastingSchedule: { type: 'none' },
    weeklyBudget: undefined,
    pricePreference: 'balanced',
    sportType: undefined,
    sportFrequency: undefined,
    sportIntensity: undefined,
};

export const useSoloOnboardingStore = create<SoloOnboardingState>((set, get) => ({
    currentStep: 0,
    totalSteps: 7, // 7 steps: Welcome(0), BasicInfo(1), Activity(2), Goals(3), Diet(4), Cooking(5), Analysis(6)
    profile: initialProfile,

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

    updateProfile: (data) =>
        set((state) => ({ profile: { ...state.profile, ...data } })),

    addChild: (child) =>
        set((state) => ({
            profile: {
                ...state.profile,
                children: [...(state.profile.children || []), child],
            },
        })),

    removeChild: (id) =>
        set((state) => ({
            profile: {
                ...state.profile,
                children: (state.profile.children || []).filter((c) => c.id !== id),
            },
        })),

    reset: () => set({ currentStep: 0, profile: initialProfile }),
}));
