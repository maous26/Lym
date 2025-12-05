import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FamilyRole = 'ADMIN' | 'PARENT' | 'MEMBER' | 'CHILD';
export type AgeGroup = 'INFANT' | 'CHILD' | 'TEEN' | 'ADULT' | 'SENIOR';

export interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  role: FamilyRole;
  ageGroup: AgeGroup;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  height?: number;
  weight?: number;
  allergies: string[];
  dietaryNeeds: string[];
  dailyCalories?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  isActive: boolean;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  members: FamilyMember[];
  createdAt: string;
}

export interface FamilyChallenge {
  id: string;
  title: string;
  description?: string;
  type: 'NUTRITION' | 'ACTIVITY' | 'BUDGET' | 'ECOLOGY';
  target: number;
  current: number;
  unit?: string;
  startDate: string;
  endDate: string;
}

interface FamilyState {
  family: Family | null;
  activeMemberId: string | null;
  challenges: FamilyChallenge[];

  // Actions
  setFamily: (family: Family | null) => void;
  setActiveMember: (memberId: string) => void;
  addMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateMember: (memberId: string, data: Partial<FamilyMember>) => void;
  removeMember: (memberId: string) => void;
  addChallenge: (challenge: Omit<FamilyChallenge, 'id'>) => void;
  updateChallengeProgress: (challengeId: string, value: number) => void;

  // Getters
  getActiveMember: () => FamilyMember | null;
  getMemberById: (id: string) => FamilyMember | null;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      family: null,
      activeMemberId: null,
      challenges: [],

      setFamily: (family) => set({ family }),

      setActiveMember: (memberId) => set({ activeMemberId: memberId }),

      addMember: (member) => {
        const { family } = get();
        if (!family) return;

        const newMember: FamilyMember = {
          ...member,
          id: `member-${Date.now()}`,
        };

        set({
          family: {
            ...family,
            members: [...family.members, newMember],
          },
        });
      },

      updateMember: (memberId, data) => {
        const { family } = get();
        if (!family) return;

        set({
          family: {
            ...family,
            members: family.members.map((m) =>
              m.id === memberId ? { ...m, ...data } : m
            ),
          },
        });
      },

      removeMember: (memberId) => {
        const { family, activeMemberId } = get();
        if (!family) return;

        set({
          family: {
            ...family,
            members: family.members.filter((m) => m.id !== memberId),
          },
          activeMemberId: activeMemberId === memberId ? null : activeMemberId,
        });
      },

      addChallenge: (challenge) => {
        const newChallenge: FamilyChallenge = {
          ...challenge,
          id: `challenge-${Date.now()}`,
        };
        set((state) => ({
          challenges: [...state.challenges, newChallenge],
        }));
      },

      updateChallengeProgress: (challengeId, value) => {
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId ? { ...c, current: value } : c
          ),
        }));
      },

      getActiveMember: () => {
        const { family, activeMemberId } = get();
        if (!family || !activeMemberId) return null;
        return family.members.find((m) => m.id === activeMemberId) || null;
      },

      getMemberById: (id) => {
        const { family } = get();
        if (!family) return null;
        return family.members.find((m) => m.id === id) || null;
      },
    }),
    {
      name: 'lym-family',
      partialize: (state) => ({
        family: state.family,
        activeMemberId: state.activeMemberId,
        challenges: state.challenges,
      }),
    }
  )
);
