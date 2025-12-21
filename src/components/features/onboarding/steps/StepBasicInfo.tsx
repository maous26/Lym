'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight } from 'lucide-react';
import type { Gender } from '@/types/user';

interface StepBasicInfoProps {
  data: {
    firstName: string;
    birthDate?: string;
    gender?: Gender;
    height?: number;
    weight?: number;
    targetWeight?: number;
  };
  onUpdate: (data: Partial<StepBasicInfoProps['data']>) => void;
  onNext: () => void;
}

const genderOptions: { value: Gender; label: string; icon: string }[] = [
  { value: 'male', label: 'Homme', icon: '👨' },
  { value: 'female', label: 'Femme', icon: '👩' },
  { value: 'other', label: 'Autre', icon: '🧑' },
];

export function StepBasicInfo({ data, onUpdate, onNext }: StepBasicInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.firstName?.trim()) {
      newErrors.firstName = 'Ton prénom est requis';
    }
    if (!data.birthDate) {
      newErrors.birthDate = 'Ta date de naissance est requise';
    }
    if (!data.gender) {
      newErrors.gender = 'Sélectionne ton genre';
    }
    if (!data.height || data.height < 100 || data.height > 250) {
      newErrors.height = 'Entre une taille valide (100-250 cm)';
    }
    if (!data.weight || data.weight < 30 || data.weight > 300) {
      newErrors.weight = 'Entre un poids valide (30-300 kg)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="space-y-6">
        {/* First Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Input
            label="Ton prénom"
            placeholder="Comment t'appelles-tu ?"
            value={data.firstName}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
            error={errors.firstName}
          />
        </motion.div>

        {/* Birth Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Input
            type="date"
            label="Date de naissance"
            value={data.birthDate || ''}
            onChange={(e) => onUpdate({ birthDate: e.target.value })}
            error={errors.birthDate}
          />
        </motion.div>

        {/* Gender */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Genre
          </label>
          <div className="grid grid-cols-3 gap-3">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onUpdate({ gender: option.value })}
                className={`p-4 rounded-2xl text-center transition-all duration-200 ${
                  data.gender === option.value
                    ? 'bg-primary-500 text-white shadow-btn-emerald'
                    : 'bg-white/70 text-stone-600 hover:bg-white'
                }`}
              >
                <span className="text-2xl block mb-1">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          {errors.gender && (
            <p className="text-sm text-red-500 mt-2">{errors.gender}</p>
          )}
        </motion.div>

        {/* Height & Weight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          <Input
            type="number"
            label="Taille (cm)"
            placeholder="175"
            value={data.height || ''}
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) || undefined })}
            error={errors.height}
          />
          <Input
            type="number"
            label="Poids actuel (kg)"
            placeholder="70"
            value={data.weight || ''}
            onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || undefined })}
            error={errors.weight}
          />
        </motion.div>

        {/* Target Weight (optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Input
            type="number"
            label="Poids objectif (kg) — optionnel"
            placeholder="65"
            helperText="Laisse vide si tu ne vises pas un poids spécifique"
            value={data.targetWeight || ''}
            onChange={(e) => onUpdate({ targetWeight: parseFloat(e.target.value) || undefined })}
          />
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-auto pt-8"
      >
        <Button
          onClick={handleNext}
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Continuer
        </Button>
      </motion.div>
    </div>
  );
}

export default StepBasicInfo;
