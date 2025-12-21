'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'minimal';
  className?: string;
}

export function EmptyState({
  icon,
  emoji,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  variant = 'default',
  className,
}: EmptyStateProps) {
  const sizes = {
    sm: {
      icon: 'w-12 h-12 text-3xl',
      title: 'text-base',
      description: 'text-sm',
      padding: 'p-4',
    },
    md: {
      icon: 'w-16 h-16 text-4xl',
      title: 'text-lg',
      description: 'text-sm',
      padding: 'p-6',
    },
    lg: {
      icon: 'w-24 h-24 text-6xl',
      title: 'text-xl',
      description: 'text-base',
      padding: 'p-8',
    },
  };

  const variants = {
    default: '',
    card: 'bg-white rounded-3xl shadow-card',
    minimal: '',
  };

  const s = sizes[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variants[variant],
        s.padding,
        className
      )}
    >
      {/* Icon or Emoji */}
      {(icon || emoji) && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className={cn(
            'flex items-center justify-center rounded-3xl bg-stone-100 mb-4',
            s.icon
          )}
        >
          {emoji ? (
            <span className="select-none">{emoji}</span>
          ) : (
            <div className="text-stone-400">{icon}</div>
          )}
        </motion.div>
      )}

      {/* Title */}
      <h3 className={cn('font-semibold text-stone-800 mb-2', s.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn('text-stone-500 max-w-xs mb-6', s.description)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Predefined empty states for common scenarios
export function EmptyMeals({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      emoji="🍽️"
      title="Aucun repas aujourd'hui"
      description="Commence à tracker tes repas pour suivre ta nutrition"
      action={{ label: 'Ajouter un repas', onClick: onAdd }}
    />
  );
}

export function EmptyRecipes({ onExplore }: { onExplore: () => void }) {
  return (
    <EmptyState
      emoji="📖"
      title="Pas encore de recettes"
      description="Explore notre bibliothèque de recettes ou crée les tiennes"
      action={{ label: 'Explorer les recettes', onClick: onExplore }}
    />
  );
}

export function EmptySearch({ query }: { query: string }) {
  return (
    <EmptyState
      emoji="🔍"
      title="Aucun résultat"
      description={`Nous n'avons rien trouvé pour "${query}". Essaie avec d'autres termes.`}
    />
  );
}

export function EmptyFamily({ onInvite }: { onInvite: () => void }) {
  return (
    <EmptyState
      emoji="👨‍👩‍👧‍👦"
      title="Ta famille t'attend"
      description="Invite les membres de ta famille pour partager vos repas"
      action={{ label: 'Inviter un membre', onClick: onInvite }}
    />
  );
}

export function EmptyWeight({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      emoji="⚖️"
      title="Commence ton suivi"
      description="Ajoute ta première pesée pour suivre ta progression"
      action={{ label: 'Ajouter mon poids', onClick: onAdd }}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      emoji="🔔"
      title="Tout est à jour"
      description="Tu n'as pas de nouvelles notifications"
      size="sm"
    />
  );
}

export function ErrorState({
  onRetry,
  message = "Une erreur s'est produite",
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      emoji="😕"
      title="Oups !"
      description={message}
      action={onRetry ? { label: 'Réessayer', onClick: onRetry } : undefined}
    />
  );
}

export function OfflineState() {
  return (
    <EmptyState
      emoji="📡"
      title="Hors connexion"
      description="Vérifie ta connexion internet et réessaie"
      variant="card"
    />
  );
}

export default EmptyState;
