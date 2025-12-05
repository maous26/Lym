import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type NutritionGoal = 'LOSE_WEIGHT' | 'GAIN_MUSCLE' | 'MAINTAIN';
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
export type DietType = 'OMNIVORE' | 'VEGETARIAN' | 'VEGAN' | 'PESCATARIAN' | 'KETO' | 'PALEO' | 'HALAL' | 'KOSHER';
export type CookingSkill = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CookingTime = 'QUICK' | 'MEDIUM' | 'ELABORATE';

export interface OnboardingProfile {
  // Step 1: Basic Info
  birthDate?: string;
  gender?: Gender;
  height?: number; // cm
  currentWeight?: number; // kg
  targetWeight?: number; // kg

  // Step 2: Goals
  goal?: NutritionGoal;

  // Step 3: Activity
  activityLevel?: ActivityLevel;

  // Step 4: Diet
  dietType?: DietType;
  allergies: string[];
  dislikes: string[];

  // Step 5: Cooking
  cookingSkill?: CookingSkill;
  cookingTime?: CookingTime;
}

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  profile: OnboardingProfile;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateProfile: (data: Partial<OnboardingProfile>) => void;
  resetOnboarding: () => void;
}

const initialProfile: OnboardingProfile = {
  allergies: [],
  dislikes: [],
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
        if (currentStep < totalSteps - 1) {
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
        set((state) => ({
          profile: { ...state.profile, ...data },
        })),

      resetOnboarding: () =>
        set({
          currentStep: 0,
          profile: initialProfile,
        }),
    }),
    {
      name: 'lym-onboarding',
      partialize: (state) => ({
        currentStep: state.currentStep,
        profile: state.profile,
      }),
    }
  )
);
