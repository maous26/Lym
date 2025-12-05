'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button, Card, Input, Badge } from '@/core/components/ui';
import { useOnboardingStore, type DietType } from '../store';
import { cn } from '@/core/lib/cn';

const dietOptions: { value: DietType; label: string; emoji: string }[] = [
  { value: 'OMNIVORE', label: 'Omnivore', emoji: '🍖' },
  { value: 'VEGETARIAN', label: 'Végétarien', emoji: '🥬' },
  { value: 'VEGAN', label: 'Végan', emoji: '🌱' },
  { value: 'PESCATARIAN', label: 'Pescétarien', emoji: '🐟' },
  { value: 'KETO', label: 'Keto', emoji: '🥑' },
  { value: 'PALEO', label: 'Paléo', emoji: '🍳' },
  { value: 'HALAL', label: 'Halal', emoji: '🌙' },
  { value: 'KOSHER', label: 'Casher', emoji: '✡️' },
];

const commonAllergies = [
  'Gluten',
  'Lactose',
  'Arachides',
  'Fruits à coque',
  'Œufs',
  'Soja',
  'Fruits de mer',
  'Poisson',
  'Sésame',
  'Moutarde',
];

export function StepDiet() {
  const { profile, updateProfile, nextStep, prevStep } = useOnboardingStore();
  const [allergyInput, setAllergyInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');

  const toggleAllergy = (allergy: string) => {
    const current = profile.allergies || [];
    const updated = current.includes(allergy)
      ? current.filter((a) => a !== allergy)
      : [...current, allergy];
    updateProfile({ allergies: updated });
  };

  const addCustomAllergy = () => {
    if (allergyInput.trim() && !profile.allergies.includes(allergyInput.trim())) {
      updateProfile({ allergies: [...profile.allergies, allergyInput.trim()] });
      setAllergyInput('');
    }
  };

  const addDislike = () => {
    if (dislikeInput.trim() && !profile.dislikes.includes(dislikeInput.trim())) {
      updateProfile({ dislikes: [...profile.dislikes, dislikeInput.trim()] });
      setDislikeInput('');
    }
  };

  const removeDislike = (item: string) => {
    updateProfile({ dislikes: profile.dislikes.filter((d) => d !== item) });
  };

  const canContinue = !!profile.dietType;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 px-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vos préférences alimentaires
        </h2>
        <p className="text-gray-600">
          Pour des recettes adaptées à votre régime
        </p>
      </div>

      {/* Diet Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Type de régime
        </label>
        <div className="grid grid-cols-2 gap-2">
          {dietOptions.map((option) => {
            const isSelected = profile.dietType === option.value;
            return (
              <Card
                key={option.value}
                variant={isSelected ? 'elevated' : 'outlined'}
                padding="sm"
                className={cn(
                  'cursor-pointer transition-all text-center',
                  isSelected
                    ? 'ring-2 ring-emerald-500 border-transparent'
                    : 'hover:border-gray-300'
                )}
                onClick={() => updateProfile({ dietType: option.value })}
              >
                <span className="text-xl">{option.emoji}</span>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {option.label}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Allergies */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Allergies & intolérances
        </label>
        <div className="flex flex-wrap gap-2">
          {commonAllergies.map((allergy) => {
            const isSelected = profile.allergies.includes(allergy);
            return (
              <Badge
                key={allergy}
                variant={isSelected ? 'error' : 'default'}
                className={cn(
                  'cursor-pointer transition-all',
                  !isSelected && 'hover:bg-gray-200'
                )}
                onClick={() => toggleAllergy(allergy)}
              >
                {allergy}
                {isSelected && <X className="w-3 h-3 ml-1" />}
              </Badge>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Autre allergie..."
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={addCustomAllergy}
            disabled={!allergyInput.trim()}
          >
            Ajouter
          </Button>
        </div>
      </div>

      {/* Dislikes */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Aliments non aimés (optionnel)
        </label>
        {profile.dislikes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.dislikes.map((item) => (
              <Badge
                key={item}
                variant="warning"
                className="cursor-pointer"
                onClick={() => removeDislike(item)}
              >
                {item}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Ex: champignons, olives..."
            value={dislikeInput}
            onChange={(e) => setDislikeInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addDislike()}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={addDislike}
            disabled={!dislikeInput.trim()}
          >
            Ajouter
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={prevStep} className="flex-1">
          Retour
        </Button>
        <Button onClick={nextStep} disabled={!canContinue} className="flex-1">
          Continuer
        </Button>
      </div>
    </motion.div>
  );
}
