'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSoloOnboardingStore } from '@/store/solo-onboarding-store';
import { useUserStore } from '@/store/user-store';
import { StepBasicInfo } from '@/components/features/onboarding/StepBasicInfo';
import { StepActivity } from '@/components/features/onboarding/StepActivity';
import { StepGoals } from '@/components/features/onboarding/StepGoals';
import { StepDiet } from '@/components/features/onboarding/StepDiet';
import { StepCooking } from '@/components/features/onboarding/StepCooking';
import { StepBudget } from '@/components/features/onboarding/StepBudget';
import { StepFasting } from '@/components/features/onboarding/StepFasting';
import { StepAnalysis } from '@/components/features/onboarding/StepAnalysis';
import { Loader2 } from 'lucide-react';

export default function SoloOnboardingPage() {
    const router = useRouter();
    const { currentStep, setStep } = useSoloOnboardingStore();
    const { setActiveMode } = useUserStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Attendre l'hydratation avant d'afficher le contenu
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Commencer directement a l'etape basic-info au lieu de welcome
    useEffect(() => {
        if (isHydrated && currentStep === 'welcome') {
            setStep('basic-info');
        }
    }, [currentStep, setStep, isHydrated]);

    // Afficher un loader pendant l'hydratation
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 'welcome':
            case 'basic-info':
                return <StepBasicInfo />;
            case 'activity':
                return <StepActivity />;
            case 'goals':
                return <StepGoals />;
            case 'diet':
                return <StepDiet />;
            case 'cooking':
                return <StepCooking />;
            case 'budget':
                return <StepBudget />;
            case 'fasting':
                return <StepFasting />;
            case 'analysis':
                return <StepAnalysis />;
            default:
                return <StepBasicInfo />;
        }
    };

    return <div className="min-h-screen">{renderStep()}</div>;
}
