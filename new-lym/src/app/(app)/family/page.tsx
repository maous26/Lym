'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Copy,
  Check,
  ChevronRight,
  Calendar,
  ShoppingCart,
  Trophy,
  Bell,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/core/components/layout';
import { Card, Button, Badge, Avatar } from '@/core/components/ui';
import { FamilyMemberCard, FamilyChallengeCard } from '@/modules/family/components';
import { useFamilyStore } from '@/modules/family/store';
import { cn } from '@/core/lib/cn';

// Mock data for demonstration
const mockFamily = {
  id: 'family-1',
  name: 'Famille Martin',
  inviteCode: 'FAM-ABC123',
  createdAt: new Date().toISOString(),
  members: [
    {
      id: 'member-1',
      name: 'Sophie Martin',
      role: 'ADMIN' as const,
      ageGroup: 'ADULT' as const,
      allergies: ['Gluten'],
      dietaryNeeds: [],
      dailyCalories: 1800,
      isActive: true,
    },
    {
      id: 'member-2',
      name: 'Marc Martin',
      role: 'PARENT' as const,
      ageGroup: 'ADULT' as const,
      allergies: [],
      dietaryNeeds: [],
      dailyCalories: 2200,
      isActive: true,
    },
    {
      id: 'member-3',
      name: 'Emma',
      role: 'CHILD' as const,
      ageGroup: 'TEEN' as const,
      allergies: ['Lactose'],
      dietaryNeeds: [],
      dailyCalories: 1600,
      isActive: true,
    },
    {
      id: 'member-4',
      name: 'Lucas',
      role: 'CHILD' as const,
      ageGroup: 'CHILD' as const,
      allergies: [],
      dietaryNeeds: [],
      dailyCalories: 1400,
      isActive: true,
    },
  ],
};

const mockChallenges = [
  {
    id: 'challenge-1',
    title: '5 fruits et légumes par jour',
    description: 'Toute la famille pendant 7 jours',
    type: 'NUTRITION' as const,
    target: 35,
    current: 22,
    unit: 'portions',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'challenge-2',
    title: '10 000 pas en famille',
    description: 'Promenade du dimanche',
    type: 'ACTIVITY' as const,
    target: 10000,
    current: 7500,
    unit: 'pas',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function FamilyPage() {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);

  // For demo, use mock data. In real app, use store
  const family = mockFamily;
  const challenges = mockChallenges;

  const handleCopyInviteCode = async () => {
    await navigator.clipboard.writeText(family.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if user has family access
  if (session?.user?.subscriptionPlan !== 'FAMILY') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Famille" />
        <div className="px-4 py-8 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-violet-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mode Famille
          </h2>
          <p className="text-gray-600 mb-6">
            Gérez les repas de toute la famille avec des plans personnalisés pour chaque membre.
          </p>
          <Button size="lg" className="w-full">
            Passer au plan Family
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Famille" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Family Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{family.name}</h2>
                <p className="text-sm text-gray-500">
                  {family.members.length} membres
                </p>
              </div>
              <Link href="/family/settings">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
            </div>

            {/* Invite Code */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Code d'invitation</p>
                <p className="font-mono font-semibold text-gray-900">
                  {family.inviteCode}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyInviteCode}
                leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copié !' : 'Copier'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <Link href="/family/planning">
            <Card variant="outlined" padding="md" hover className="h-full">
              <Calendar className="w-6 h-6 text-emerald-500 mb-2" />
              <h4 className="font-semibold text-gray-900">Planning</h4>
              <p className="text-xs text-gray-500">Repas de la semaine</p>
            </Card>
          </Link>
          <Link href="/shopping">
            <Card variant="outlined" padding="md" hover className="h-full">
              <ShoppingCart className="w-6 h-6 text-blue-500 mb-2" />
              <h4 className="font-semibold text-gray-900">Courses</h4>
              <p className="text-xs text-gray-500">Liste partagée</p>
            </Card>
          </Link>
        </motion.div>

        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Membres</h3>
            <Link href="/family/members">
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Gérer
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {family.members.map((member) => (
              <FamilyMemberCard
                key={member.id}
                member={member}
                onSelect={() => {}}
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Ajouter un membre
            </Button>
          </div>
        </motion.div>

        {/* Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900">Défis en cours</h3>
            </div>
            <Link href="/family/challenges">
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Voir tout
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <FamilyChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Activité récente</h3>
            </div>
            <div className="space-y-3">
              <ActivityItem
                avatar="👩"
                text="Sophie a ajouté le déjeuner"
                time="Il y a 2h"
              />
              <ActivityItem
                avatar="👨"
                text="Marc a complété le défi 10 000 pas"
                time="Il y a 4h"
              />
              <ActivityItem
                avatar="👧"
                text="Emma a coché 3 items de la liste de courses"
                time="Hier"
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function ActivityItem({
  avatar,
  text,
  time,
}: {
  avatar: string;
  text: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{avatar}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-700">{text}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}
