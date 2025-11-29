import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, ChildProfile } from '@/types/user';

interface OnboardingState {
    currentStep: number;
    totalSteps: number;
    profile: UserProfile;

    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    updateProfile: (data: Partial<UserProfile>) => void;
    addChild: (child: ChildProfile) => void;
    removeChild: (id: string) => void;
    reset: () => void;
}

const initialProfile: UserProfile = {
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
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            currentStep: 0,
            totalSteps: 6,
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
                        children: [...state.profile.children, child],
                    },
                })),

            removeChild: (id) =>
                set((state) => ({
                    profile: {
                        ...state.profile,
                        children: state.profile.children.filter((c) => c.id !== id),
                    },
                })),

            reset: () => set({ currentStep: 0, profile: initialProfile }),
        }),
        {
            name: 'vitality-onboarding',
        }
    )
);
