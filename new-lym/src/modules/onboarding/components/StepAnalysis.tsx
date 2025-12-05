'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Check, Flame, Dumbbell, Wheat, Droplets } from 'lucide-react';
import { Button, Card, Progress } from '@/core/components/ui';
import { useOnboardingStore } from '../store';
import { cn } from '@/core/lib/cn';

// Calculate BMR using Mifflin-St Jeor equation
function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'MALE' | 'FEMALE' | 'OTHER'
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'MALE') return base + 5;
  if (gender === 'FEMALE') return base - 161;
  return base - 78; // Average for OTHER
}

// Activity multipliers
const activityMultipliers = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

// Goal adjustments
const goalAdjustments = {
  LOSE_WEIGHT: -500,
  MAINTAIN: 0,
  GAIN_MUSCLE: 300,
};

export function StepAnalysis() {
  const router = useRouter();
  const { profile, resetOnboarding } = useOnboardingStore();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const analysisSteps = [
    'Analyse de vos données...',
    'Calcul de votre métabolisme...',
    'Définition de vos objectifs...',
    'Personnalisation terminée !',
  ];

  // Calculate nutritional needs
  const calculateNeeds = () => {
    if (!profile.birthDate || !profile.height || !profile.currentWeight || !profile.gender) {
      return null;
    }

    const age = Math.floor(
      (Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    const bmr = calculateBMR(
      profile.currentWeight,
      profile.height,
      age,
      profile.gender
    );

    const activityMultiplier = activityMultipliers[profile.activityLevel || 'MODERATE'];
    const tdee = bmr * activityMultiplier;

    const goalAdjustment = goalAdjustments[profile.goal || 'MAINTAIN'];
    const dailyCalories = Math.round(tdee + goalAdjustment);

    // Macro distribution based on goal
    let proteinRatio = 0.25;
    let carbsRatio = 0.50;
    let fatRatio = 0.25;

    if (profile.goal === 'GAIN_MUSCLE') {
      proteinRatio = 0.30;
      carbsRatio = 0.45;
      fatRatio = 0.25;
    } else if (profile.goal === 'LOSE_WEIGHT') {
      proteinRatio = 0.30;
      carbsRatio = 0.40;
      fatRatio = 0.30;
    }

    return {
      dailyCalories,
      protein: Math.round((dailyCalories * proteinRatio) / 4), // 4 cal/g
      carbs: Math.round((dailyCalories * carbsRatio) / 4), // 4 cal/g
      fat: Math.round((dailyCalories * fatRatio) / 9), // 9 cal/g
    };
  };

  const needs = calculateNeeds();

  // Simulate analysis steps
  useEffect(() => {
    if (analysisStep < analysisSteps.length - 1) {
      const timer = setTimeout(() => {
        setAnalysisStep((prev) => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setIsAnalyzing(false), 500);
    }
  }, [analysisStep, analysisSteps.length]);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Here we would save the profile to the database
      // For now, just navigate to dashboard
      resetOnboarding();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      setIsSubmitting(false);
    }
  };

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-6"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-8">
          <Sparkles className="w-10 h-10 text-emerald-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-8">
          {analysisSteps[analysisStep]}
        </h2>
        <Progress value={(analysisStep + 1) * 25} className="w-64" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 px-4"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Votre profil est prêt !
        </h2>
        <p className="text-gray-600">
          Voici vos recommandations nutritionnelles personnalisées
        </p>
      </div>

      {/* Calorie Goal */}
      <Card variant="elevated" padding="lg" className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="text-sm font-medium text-gray-500">
            Objectif calorique journalier
          </span>
        </div>
        <p className="text-4xl font-bold text-gray-900">
          {needs?.dailyCalories || 2000}
          <span className="text-lg font-normal text-gray-500 ml-1">kcal</span>
        </p>
      </Card>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="flat" padding="md" className="text-center">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-2">
            <Dumbbell className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{needs?.protein || 150}g</p>
          <p className="text-xs text-gray-500">Protéines</p>
        </Card>
        <Card variant="flat" padding="md" className="text-center">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-2">
            <Wheat className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{needs?.carbs || 250}g</p>
          <p className="text-xs text-gray-500">Glucides</p>
        </Card>
        <Card variant="flat" padding="md" className="text-center">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-2">
            <Droplets className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{needs?.fat || 65}g</p>
          <p className="text-xs text-gray-500">Lipides</p>
        </Card>
      </div>

      {/* Info note */}
      <p className="text-sm text-gray-500 text-center">
        Ces recommandations sont basées sur vos informations personnelles et peuvent être ajustées à tout moment dans votre profil.
      </p>

      {/* CTA */}
      <Button
        onClick={handleComplete}
        isLoading={isSubmitting}
        size="lg"
        className="w-full"
      >
        Commencer mon parcours
      </Button>
    </motion.div>
  );
}
