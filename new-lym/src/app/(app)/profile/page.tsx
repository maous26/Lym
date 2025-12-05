'use client';

import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
  Scale,
  Target,
  Utensils,
} from 'lucide-react';
import { Header } from '@/core/components/layout';
import { Card, Avatar, Badge, Button } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';

interface MenuItemProps {
  icon: typeof User;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  danger?: boolean;
}

function MenuItem({ icon: Icon, label, description, href, onClick, badge, danger }: MenuItemProps) {
  const content = (
    <div className="flex items-center gap-3 py-3">
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          danger ? 'bg-red-100' : 'bg-gray-100'
        )}
      >
        <Icon className={cn('w-5 h-5', danger ? 'text-red-600' : 'text-gray-600')} />
      </div>
      <div className="flex-1">
        <p className={cn('font-medium', danger ? 'text-red-600' : 'text-gray-900')}>
          {label}
        </p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {badge && <Badge variant="premium">{badge}</Badge>}
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left hover:bg-gray-50 px-4 -mx-4">
        {content}
      </button>
    );
  }

  return (
    <a href={href} className="block hover:bg-gray-50 px-4 -mx-4">
      {content}
    </a>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const planLabels = {
    BASIC: { label: 'Basic', color: 'default' as const },
    PREMIUM: { label: 'Premium', color: 'premium' as const },
    FAMILY: { label: 'Family', color: 'info' as const },
  };

  const currentPlan = session?.user?.subscriptionPlan || 'BASIC';
  const planInfo = planLabels[currentPlan];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Profil" showNotifications={false} showSettings />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-4">
              <Avatar
                src={session?.user?.image}
                alt={session?.user?.name || 'User'}
                fallback={session?.user?.name || session?.user?.email}
                size="xl"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {session?.user?.name || 'Utilisateur'}
                </h2>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
                <Badge variant={planInfo.color} className="mt-2">
                  {planInfo.label}
                </Badge>
              </div>
            </div>

            {currentPlan === 'BASIC' && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-4"
                leftIcon={<Crown className="w-4 h-4" />}
              >
                Passer à Premium
              </Button>
            )}
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-3">
            <Card variant="flat" padding="md" className="text-center">
              <Scale className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">72 kg</p>
              <p className="text-xs text-gray-500">Poids actuel</p>
            </Card>
            <Card variant="flat" padding="md" className="text-center">
              <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">68 kg</p>
              <p className="text-xs text-gray-500">Objectif</p>
            </Card>
            <Card variant="flat" padding="md" className="text-center">
              <Utensils className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">2000</p>
              <p className="text-xs text-gray-500">kcal/jour</p>
            </Card>
          </div>
        </motion.div>

        {/* Menu Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated" padding="md">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Compte
            </h3>
            <div className="divide-y divide-gray-100">
              <MenuItem
                icon={User}
                label="Informations personnelles"
                description="Modifier votre profil"
                href="/profile/edit"
              />
              <MenuItem
                icon={Target}
                label="Objectifs nutritionnels"
                description="Calories, macros, poids cible"
                href="/profile/goals"
              />
              <MenuItem
                icon={Utensils}
                label="Préférences alimentaires"
                description="Régime, allergies, goûts"
                href="/profile/diet"
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated" padding="md">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Paramètres
            </h3>
            <div className="divide-y divide-gray-100">
              <MenuItem
                icon={Bell}
                label="Notifications"
                description="Rappels et alertes"
                href="/profile/notifications"
              />
              <MenuItem
                icon={Shield}
                label="Confidentialité"
                description="Données et sécurité"
                href="/profile/privacy"
              />
              <MenuItem
                icon={Crown}
                label="Abonnement"
                description={`Plan ${planInfo.label}`}
                href="/profile/subscription"
                badge={currentPlan !== 'BASIC' ? 'Actif' : undefined}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated" padding="md">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Aide
            </h3>
            <div className="divide-y divide-gray-100">
              <MenuItem
                icon={HelpCircle}
                label="Centre d'aide"
                description="FAQ et support"
                href="/help"
              />
              <MenuItem
                icon={LogOut}
                label="Déconnexion"
                onClick={handleSignOut}
                danger
              />
            </div>
          </Card>
        </motion.div>

        {/* App Version */}
        <p className="text-center text-sm text-gray-400 pb-4">
          LYM v2.0.0
        </p>
      </div>
    </div>
  );
}
