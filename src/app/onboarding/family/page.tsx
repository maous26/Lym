'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyOnboardingStore } from '@/store/family-onboarding-store';
import { useUserStore } from '@/store/user-store';
import { StepFamilySetup } from '@/components/features/onboarding/StepFamilySetup';

export default function FamilyOnboardingPage() {
    const router = useRouter();
    const { currentStep, familyName, weeklyBudget, members } = useFamilyOnboardingStore();
    const { setFamily, setMembers, completeFamilyOnboarding, setActiveMode, userId } = useUserStore();

    // Gestion de la fin de l'onboarding
    useEffect(() => {
        if (currentStep === useFamilyOnboardingStore.getState().totalSteps) {
            // Créer l'objet famille
            const family = {
                id: `family-${Date.now()}`,
                name: familyName,
                adminId: userId || `user-${Date.now()}`,
                weeklyBudget: weeklyBudget || undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Sauvegarder dans le store principal
            setFamily(family as any);
            setMembers(members as any[]);
            completeFamilyOnboarding();
            setActiveMode('family');

            // Reset onboarding store
            useFamilyOnboardingStore.getState().reset();

            // Rediriger vers la home
            router.push('/');
        }
    }, [currentStep, familyName, weeklyBudget, members, setFamily, setMembers, completeFamilyOnboarding, setActiveMode, userId, router]);

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <StepFamilySetup />;
            default:
                return <StepFamilySetup />;
        }
    };

    return <div className="min-h-screen">{renderStep()}</div>;
}
