import { create } from 'zustand';
import type {
  Gender,
  ActivityLevel,
  Goal,
  DietType,
  CookingSkillLevel,
  FastingSchedule,
  ChildProfile,
} from '@/types/user';

// Solo onboarding steps
export type SoloOnboardingStep =
  | 'welcome'
  | 'basic-info'
  | 'activity'
  | 'goals'
  | 'diet'
  | 'cooking'
  | 'budget'
  | 'fasting'
  | 'analysis'
  | 'complete';

// Sport intensity type
export type SportIntensity = 'light' | 'moderate' | 'intense';

// Solo onboarding data
export interface SoloOnboardingData {
  // Step 1: Basic Info
  firstName: string;
  lastName?: string;
  birthDate?: string;
  gender?: Gender;
  height?: number;
  weight?: number;
  targetWeight?: number;

  // Step 2: Activity
  activityLevel?: ActivityLevel;
  doesSport?: boolean;
  sportType?: string;
  sportOther?: string; // Si "autre" sport
  sportFrequency?: number; // jours par semaine
  sportIntensity?: SportIntensity;
  sportsFrequency?: number; // legacy
  sportsTypes?: string[]; // legacy

  // Step 3: Goals
  goal?: Goal;

  // Step 4: Diet
  dietType?: DietType;
  allergies?: string[];
  intolerances?: string[];
  dislikedFoods?: string[];
  likedFoods?: string[];

  // Step 5: Cooking
  cookingSkillLevel?: CookingSkillLevel;
  cookingTimeAvailable?: number; // legacy - use weekday/weekend instead
  cookingTimeWeekday?: number; // minutes available on weekdays
  cookingTimeWeekend?: number; // minutes available on weekends
  kitchenEquipment?: string[];

  // Step 6: Budget
  weeklyBudget?: number; // euros per week
  pricePreference?: 'economy' | 'balanced' | 'premium';

  // Step 7: Fasting (optional)
  fastingSchedule?: FastingSchedule;

  // Step 7: Children (optional for family mode hint)
  hasChildren?: boolean;
  children?: ChildProfile[];
}

interface SoloOnboardingState {
  currentStep: SoloOnboardingStep;
  data: SoloOnboardingData;
  completedSteps: SoloOnboardingStep[];
  isComplete: boolean;
}

interface SoloOnboardingActions {
  setStep: (step: SoloOnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<SoloOnboardingData>) => void;
  markStepComplete: (step: SoloOnboardingStep) => void;
  complete: () => void;
  reset: () => void;
}

const STEPS_ORDER: SoloOnboardingStep[] = [
  'welcome',
  'basic-info',
  'activity',
  'goals',
  'diet',
  'cooking',
  'budget',
  'fasting',
  'analysis',
  'complete',
];

const initialState: SoloOnboardingState = {
  currentStep: 'welcome',
  data: {
    firstName: '',
  },
  completedSteps: [],
  isComplete: false,
};

export const useSoloOnboardingStore = create<SoloOnboardingState & SoloOnboardingActions>(
  (set, get) => ({
    ...initialState,

    setStep: (step) => set({ currentStep: step }),

    nextStep: () => {
      const { currentStep } = get();
      const currentIndex = STEPS_ORDER.indexOf(currentStep);
      if (currentIndex < STEPS_ORDER.length - 1) {
        set({ currentStep: STEPS_ORDER[currentIndex + 1] });
      }
    },

    prevStep: () => {
      const { currentStep } = get();
      const currentIndex = STEPS_ORDER.indexOf(currentStep);
      if (currentIndex > 0) {
        set({ currentStep: STEPS_ORDER[currentIndex - 1] });
      }
    },

    updateData: (data) =>
      set((state) => ({
        data: { ...state.data, ...data },
      })),

    markStepComplete: (step) =>
      set((state) => ({
        completedSteps: state.completedSteps.includes(step)
          ? state.completedSteps
          : [...state.completedSteps, step],
      })),

    complete: () => set({ isComplete: true, currentStep: 'complete' }),

    reset: () => set(initialState),
  })
);

// Family onboarding
export type FamilyOnboardingStep =
  | 'intro'
  | 'family-name'
  | 'admin-profile'
  | 'add-members'
  | 'member-details'
  | 'preferences'
  | 'complete';

export interface FamilyMemberInput {
  id: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  gender?: Gender;
  role: 'parent' | 'child' | 'teen' | 'senior';
  height?: number;
  weight?: number;
  activityLevel?: ActivityLevel;
  dietType?: DietType;
  allergies?: string[];
  intolerances?: string[];
}

export interface FamilyOnboardingData {
  familyName: string;
  weeklyBudget?: number;
  sharedGoals: string[];
  members: FamilyMemberInput[];
}

interface FamilyOnboardingState {
  currentStep: FamilyOnboardingStep;
  data: FamilyOnboardingData;
  currentMemberIndex: number;
  isComplete: boolean;
}

interface FamilyOnboardingActions {
  setStep: (step: FamilyOnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<FamilyOnboardingData>) => void;
  addMember: (member: FamilyMemberInput) => void;
  updateMember: (id: string, data: Partial<FamilyMemberInput>) => void;
  removeMember: (id: string) => void;
  setCurrentMemberIndex: (index: number) => void;
  complete: () => void;
  reset: () => void;
}

const FAMILY_STEPS_ORDER: FamilyOnboardingStep[] = [
  'intro',
  'family-name',
  'admin-profile',
  'add-members',
  'member-details',
  'preferences',
  'complete',
];

const familyInitialState: FamilyOnboardingState = {
  currentStep: 'intro',
  data: {
    familyName: '',
    sharedGoals: [],
    members: [],
  },
  currentMemberIndex: 0,
  isComplete: false,
};

export const useFamilyOnboardingStore = create<
  FamilyOnboardingState & FamilyOnboardingActions
>((set, get) => ({
  ...familyInitialState,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get();
    const currentIndex = FAMILY_STEPS_ORDER.indexOf(currentStep);
    if (currentIndex < FAMILY_STEPS_ORDER.length - 1) {
      set({ currentStep: FAMILY_STEPS_ORDER[currentIndex + 1] });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    const currentIndex = FAMILY_STEPS_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      set({ currentStep: FAMILY_STEPS_ORDER[currentIndex - 1] });
    }
  },

  updateData: (data) =>
    set((state) => ({
      data: { ...state.data, ...data },
    })),

  addMember: (member) =>
    set((state) => ({
      data: {
        ...state.data,
        members: [...state.data.members, member],
      },
    })),

  updateMember: (id, data) =>
    set((state) => ({
      data: {
        ...state.data,
        members: state.data.members.map((m) =>
          m.id === id ? { ...m, ...data } : m
        ),
      },
    })),

  removeMember: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        members: state.data.members.filter((m) => m.id !== id),
      },
    })),

  setCurrentMemberIndex: (index) => set({ currentMemberIndex: index }),

  complete: () => set({ isComplete: true, currentStep: 'complete' }),

  reset: () => set(familyInitialState),
}));

// Get step progress
export const getStepProgress = (step: SoloOnboardingStep): number => {
  const index = STEPS_ORDER.indexOf(step);
  return Math.round((index / (STEPS_ORDER.length - 1)) * 100);
};

export const getFamilyStepProgress = (step: FamilyOnboardingStep): number => {
  const index = FAMILY_STEPS_ORDER.indexOf(step);
  return Math.round((index / (FAMILY_STEPS_ORDER.length - 1)) * 100);
};
