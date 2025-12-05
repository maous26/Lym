'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Ruler, Scale, Calendar } from 'lucide-react';
import { Button, Input, Card } from '@/core/components/ui';
import { useOnboardingStore, type Gender } from '../store';
import { cn } from '@/core/lib/cn';

const genderOptions: { value: Gender; label: string; icon: string }[] = [
  { value: 'MALE', label: 'Homme', icon: '👨' },
  { value: 'FEMALE', label: 'Femme', icon: '👩' },
  { value: 'OTHER', label: 'Autre', icon: '🧑' },
];

export function StepBasicInfo() {
  const { profile, updateProfile, nextStep, prevStep } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.gender) {
      newErrors.gender = 'Veuillez sélectionner votre genre';
    }
    if (!profile.birthDate) {
      newErrors.birthDate = 'Veuillez entrer votre date de naissance';
    }
    if (!profile.height || profile.height < 100 || profile.height > 250) {
      newErrors.height = 'Veuillez entrer une taille valide (100-250 cm)';
    }
    if (!profile.currentWeight || profile.currentWeight < 30 || profile.currentWeight > 300) {
      newErrors.currentWeight = 'Veuillez entrer un poids valide (30-300 kg)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 px-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Parlons de vous
        </h2>
        <p className="text-gray-600">
          Ces informations nous aident à calculer vos besoins nutritionnels
        </p>
      </div>

      {/* Gender Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Vous êtes
        </label>
        <div className="grid grid-cols-3 gap-3">
          {genderOptions.map((option) => (
            <Card
              key={option.value}
              variant={profile.gender === option.value ? 'elevated' : 'outlined'}
              padding="sm"
              className={cn(
                'cursor-pointer text-center transition-all',
                profile.gender === option.value
                  ? 'ring-2 ring-emerald-500 border-transparent'
                  : 'hover:border-gray-300'
              )}
              onClick={() => {
                updateProfile({ gender: option.value });
                setErrors((prev) => ({ ...prev, gender: '' }));
              }}
            >
              <span className="text-2xl">{option.icon}</span>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {option.label}
              </p>
            </Card>
          ))}
        </div>
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender}</p>
        )}
      </div>

      {/* Birth Date */}
      <Input
        type="date"
        label="Date de naissance"
        value={profile.birthDate || ''}
        onChange={(e) => {
          updateProfile({ birthDate: e.target.value });
          setErrors((prev) => ({ ...prev, birthDate: '' }));
        }}
        error={errors.birthDate}
        leftIcon={<Calendar className="w-5 h-5" />}
        max={new Date().toISOString().split('T')[0]}
      />

      {/* Height & Weight */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Taille (cm)"
          placeholder="170"
          value={profile.height || ''}
          onChange={(e) => {
            updateProfile({ height: parseFloat(e.target.value) || undefined });
            setErrors((prev) => ({ ...prev, height: '' }));
          }}
          error={errors.height}
          leftIcon={<Ruler className="w-5 h-5" />}
        />
        <Input
          type="number"
          label="Poids actuel (kg)"
          placeholder="70"
          value={profile.currentWeight || ''}
          onChange={(e) => {
            updateProfile({ currentWeight: parseFloat(e.target.value) || undefined });
            setErrors((prev) => ({ ...prev, currentWeight: '' }));
          }}
          error={errors.currentWeight}
          leftIcon={<Scale className="w-5 h-5" />}
        />
      </div>

      {/* Target Weight (optional) */}
      <Input
        type="number"
        label="Poids cible (kg) - optionnel"
        placeholder="65"
        value={profile.targetWeight || ''}
        onChange={(e) =>
          updateProfile({ targetWeight: parseFloat(e.target.value) || undefined })
        }
        leftIcon={<Scale className="w-5 h-5" />}
        helperText="Laissez vide si vous souhaitez maintenir votre poids"
      />

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={prevStep} className="flex-1">
          Retour
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Continuer
        </Button>
      </div>
    </motion.div>
  );
}
