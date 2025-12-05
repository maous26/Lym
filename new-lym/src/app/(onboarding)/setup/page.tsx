'use client';

import { AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/modules/onboarding/store';
import {
  StepIndicator,
  StepWelcome,
  StepBasicInfo,
  StepGoals,
  StepActivity,
  StepDiet,
  StepCooking,
  StepAnalysis,
} from '@/modules/onboarding/components';

const stepLabels = ['Bienvenue', 'Profil', 'Objectif', 'Activité', 'Régime', 'Résumé'];

export default function SetupPage() {
  const { currentStep, totalSteps } = useOnboardingStore();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepWelcome />;
      case 1:
        return <StepBasicInfo />;
      case 2:
        return <StepGoals />;
      case 3:
        return <StepActivity />;
      case 4:
        return <StepDiet />;
      case 5:
        return <StepAnalysis />;
      default:
        return <StepWelcome />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header with progress */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            labels={stepLabels}
          />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto py-8">
        <AnimatePresence mode="wait">
          <div key={currentStep}>{renderStep()}</div>
        </AnimatePresence>
      </main>
    </div>
  );
}
