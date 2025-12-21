'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyOnboardingStore } from '@/store/family-onboarding-store';
import { useUserStore } from '@/store/user-store';
import { StepFamilySetup } from '@/components/features/onboarding/StepFamilySetup';

export default function FamilyOnboardingPage() {
    const router = useRouter();
    const { currentStep, setStep, isComplete } = useFamilyOnboardingStore();
    const { setActiveMode, completeFamilyOnboarding } = useUserStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setActiveMode('family');
    }, [setActiveMode]);

    // Commencer directement a l'etape family-name si on est a intro
    useEffect(() => {
        if (currentStep === 'intro') {
            setStep('family-name');
        }
    }, [currentStep, setStep]);

    // Redirection quand l'onboarding est termine
    useEffect(() => {
        if (isComplete) {
            completeFamilyOnboarding();
            router.push('/dashboard');
        }
    }, [isComplete, router, completeFamilyOnboarding]);

    if (!isClient) return null;

    const renderStep = () => {
        switch (currentStep) {
            case 'intro':
            case 'family-name':
            case 'admin-profile':
            case 'add-members':
            case 'member-details':
            case 'preferences':
                return <StepFamilySetup />;
            case 'complete':
                return (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                        <div className="text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-gray-600">Redirection vers le tableau de bord...</p>
                        </div>
                    </div>
                );
            default:
                return <StepFamilySetup />;
        }
    };

    return <div className="min-h-screen">{renderStep()}</div>;
}
