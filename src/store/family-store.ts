import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Family, FamilyMember, FamilyMealPlan, FamilyShoppingList } from '@/types/family';

// ==========================================
// STORE FAMILLE - GESTION ÉTAT GLOBALE
// ==========================================

interface FamilyState {
    // État famille
    family: Family | null;
    members: FamilyMember[];
    currentMemberId: string | null; // Membre actif (pour profil enfant)
    
    // Plans & listes
    activeMealPlan: FamilyMealPlan | null;
    shoppingList: FamilyShoppingList | null;
    
    // UI State
    isFamilyMode: boolean;
    isLoading: boolean;
    
    // Actions
    setFamily: (family: Family | null) => void;
    setMembers: (members: FamilyMember[]) => void;
    setCurrentMember: (memberId: string | null) => void;
    addMember: (member: FamilyMember) => void;
    updateMember: (memberId: string, updates: Partial<FamilyMember>) => void;
    removeMember: (memberId: string) => void;
    
    setActiveMealPlan: (plan: FamilyMealPlan | null) => void;
    setShoppingList: (list: FamilyShoppingList | null) => void;
    
    setFamilyMode: (enabled: boolean) => void;
    setLoading: (loading: boolean) => void;
    
    // Getters
    getAdmin: () => FamilyMember | null;
    getCurrentMember: () => FamilyMember | null;
    getChildrenMembers: () => FamilyMember[];
    getAdultMembers: () => FamilyMember[];
    
    // Utilities
    reset: () => void;
}

const initialState = {
    family: null,
    members: [],
    currentMemberId: null,
    activeMealPlan: null,
    shoppingList: null,
    isFamilyMode: false,
    isLoading: false,
};

export const useFamilyStore = create<FamilyState>()(
    persist(
        (set, get) => ({
            ...initialState,
            
            // Setters
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
            
            setActiveMealPlan: (plan) => set({ activeMealPlan: plan }),
            
            setShoppingList: (list) => set({ shoppingList: list }),
            
            setFamilyMode: (enabled) => set({ isFamilyMode: enabled }),
            
            setLoading: (loading) => set({ isLoading: loading }),
            
            // Getters
            getAdmin: () => {
                const { family, members } = get();
                if (!family) return null;
                return members.find((m) => m.userId === family.adminId) || null;
            },
            
            getCurrentMember: () => {
                const { currentMemberId, members } = get();
                if (!currentMemberId) return null;
                return members.find((m) => m.id === currentMemberId) || null;
            },
            
            getChildrenMembers: () => {
                const { members } = get();
                return members.filter((m) => m.role === 'child' || m.role === 'teen');
            },
            
            getAdultMembers: () => {
                const { members } = get();
                return members.filter((m) => m.role === 'admin' || m.role === 'parent' || m.role === 'senior');
            },
            
            // Reset
            reset: () => set(initialState),
        }),
        {
            name: 'family-storage',
            partialize: (state) => ({
                family: state.family,
                members: state.members,
                currentMemberId: state.currentMemberId,
                isFamilyMode: state.isFamilyMode,
            }),
        }
    )
);

// ==========================================
// HOOKS UTILITAIRES
// ==========================================

/**
 * Hook pour savoir si on est en mode famille
 */
export const useIsFamilyMode = () => {
    return useFamilyStore((state) => state.isFamilyMode);
};

/**
 * Hook pour obtenir la famille active
 */
export const useActiveFamily = () => {
    return useFamilyStore((state) => state.family);
};

/**
 * Hook pour obtenir tous les membres
 */
export const useFamilyMembers = () => {
    return useFamilyStore((state) => state.members);
};

/**
 * Hook pour obtenir le membre courant
 */
export const useCurrentMember = () => {
    const getCurrentMember = useFamilyStore((state) => state.getCurrentMember);
    return getCurrentMember();
};

/**
 * Hook pour obtenir l'admin
 */
export const useFamilyAdmin = () => {
    const getAdmin = useFamilyStore((state) => state.getAdmin);
    return getAdmin();
};

/**
 * Hook pour obtenir le plan actif
 */
export const useActiveMealPlan = () => {
    return useFamilyStore((state) => state.activeMealPlan);
};


