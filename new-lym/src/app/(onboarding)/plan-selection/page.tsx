'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Check, X, Crown, Users, Sparkles } from 'lucide-react';
import { Button, Card, Badge } from '@/core/components/ui';
import { PLANS, type PlanType } from '@/config/plans';
import { cn } from '@/core/lib/cn';

export default function PlanSelectionPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('BASIC');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async () => {
    setIsLoading(true);
    try {
      // Update session with selected plan
      await update({ subscriptionPlan: selectedPlan });

      // Redirect to onboarding
      router.push('/setup');
    } catch (error) {
      console.error('Error selecting plan:', error);
      setIsLoading(false);
    }
  };

  const getPlanIcon = (planId: PlanType) => {
    switch (planId) {
      case 'BASIC':
        return Sparkles;
      case 'PREMIUM':
        return Crown;
      case 'FAMILY':
        return Users;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Choisissez votre plan
        </h1>
        <p className="text-gray-600">
          Commencez gratuitement, évoluez à votre rythme
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-md mx-auto space-y-4">
        {PLANS.map((plan, index) => {
          const Icon = getPlanIcon(plan.id);
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant={isSelected ? 'elevated' : 'outlined'}
                padding="md"
                className={cn(
                  'cursor-pointer transition-all duration-200 relative overflow-hidden',
                  isSelected && 'ring-2 ring-emerald-500 border-transparent',
                  !isSelected && 'hover:border-gray-300'
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <Badge
                    variant="success"
                    className="absolute top-3 right-3"
                  >
                    Le plus populaire
                  </Badge>
                )}

                <div className="flex items-start gap-4">
                  {/* Selection indicator */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1',
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-300'
                    )}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  {/* Plan info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          plan.id === 'PREMIUM'
                            ? 'text-violet-500'
                            : plan.id === 'FAMILY'
                            ? 'text-blue-500'
                            : 'text-emerald-500'
                        )}
                      />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.name}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-500 mb-3">{plan.tagline}</p>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500">{plan.period}</span>
                      )}
                    </div>

                    {/* Features preview */}
                    <ul className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          {feature.included ? (
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          )}
                          <span
                            className={cn(
                              feature.included
                                ? 'text-gray-700'
                                : 'text-gray-400'
                            )}
                          >
                            {feature.name}
                            {feature.limit && (
                              <span className="text-gray-400 text-xs ml-1">
                                ({feature.limit})
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div className="max-w-md mx-auto mt-8 px-4">
        <Button
          onClick={handleSelectPlan}
          isLoading={isLoading}
          size="lg"
          className="w-full"
        >
          {PLANS.find((p) => p.id === selectedPlan)?.cta || 'Continuer'}
        </Button>

        {selectedPlan !== 'BASIC' && (
          <p className="text-center text-sm text-gray-500 mt-3">
            7 jours d&apos;essai gratuit, annulable à tout moment
          </p>
        )}
      </div>
    </div>
  );
}
