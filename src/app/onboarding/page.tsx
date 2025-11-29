"use client";

import { useOnboardingStore } from '@/store/onboarding-store';
import { StepWelcome } from '@/components/features/onboarding/StepWelcome';
import { StepBasicInfo } from '@/components/features/onboarding/StepBasicInfo';
import { StepGoals } from '@/components/features/onboarding/StepGoals';
import { StepActivity } from '@/components/features/onboarding/StepActivity';
import { StepDiet } from '@/components/features/onboarding/StepDiet';
import { StepAnalysis } from '@/components/features/onboarding/StepAnalysis';
import { useEffect, useState } from 'react';

export default function OnboardingPage() {
    const { currentStep } = useOnboardingStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null; // Prevent hydration mismatch

    return (
        <div className="h-screen w-full bg-white">
            {currentStep === 0 && <div className="h-full p-6 pt-12"><StepWelcome /></div>}
            {currentStep === 1 && <StepBasicInfo />}
            {currentStep === 2 && <StepGoals />}
            {currentStep === 3 && <StepActivity />}
            {currentStep === 4 && <StepDiet />}
            {currentStep === 5 && <StepAnalysis />}
        </div>
    );
}
