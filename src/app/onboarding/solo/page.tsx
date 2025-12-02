'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
import { useUserStore } from '@/store/user-store';
import { StepWelcome } from '@/components/features/onboarding/StepWelcome';
import { StepBasicInfo } from '@/components/features/onboarding/StepBasicInfo';
import { StepActivity } from '@/components/features/onboarding/StepActivity';
import { StepGoals } from '@/components/features/onboarding/StepGoals';
import { StepDiet } from '@/components/features/onboarding/StepDiet';
import { StepCooking } from '@/components/features/onboarding/StepCooking';
import { StepAnalysis } from '@/components/features/onboarding/StepAnalysis';

export default function SoloOnboardingPage() {
    const router = useRouter();
    const { currentStep } = useSoloOnboardingStore();
    const { profile: storeProfile } = useSoloOnboardingStore();
    const { setSoloProfile, completeSoloOnboarding, setActiveMode } = useUserStore();

    // Gestion de la fin de l'onboarding (après StepAnalysis)
    // Note: Cette logique sera aussi appellée depuis StepAnalysis après 3 secondes
    useEffect(() => {
        const totalSteps = useSoloOnboardingStore.getState().totalSteps;
        // On ne trigger la sauvegarde que si on retourne à la page d'accueil via la redirection
        // StepAnalysis gère elle-même la redirection
    }, []);

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <StepWelcome />;
            case 1:
                return <StepBasicInfo />;
            case 2:
                return <StepActivity />;
            case 3:
                return <StepGoals />;
            case 4:
                return <StepDiet />;
            case 5:
                return <StepCooking />;
            case 6:
                return <StepAnalysis />;
            default:
                return <StepWelcome />;
        }
    };

    return <div className="min-h-screen">{renderStep()}</div>;
}
