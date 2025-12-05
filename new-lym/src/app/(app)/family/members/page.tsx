'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, UserPlus, Mail } from 'lucide-react';
import { Header } from '@/core/components/layout';
import { Card, Button, Input, Modal } from '@/core/components/ui';
import { FamilyMemberCard } from '@/modules/family/components';
import { useFamilyStore, type FamilyRole, type AgeGroup } from '@/modules/family/store';
import { cn } from '@/core/lib/cn';

// Mock data
const mockMembers = [
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
];

const roleOptions: { value: FamilyRole; label: string }[] = [
  { value: 'PARENT', label: 'Parent' },
  { value: 'MEMBER', label: 'Membre' },
  { value: 'CHILD', label: 'Enfant' },
];

const ageGroupOptions: { value: AgeGroup; label: string }[] = [
  { value: 'INFANT', label: 'Bébé (0-2 ans)' },
  { value: 'CHILD', label: 'Enfant (3-12 ans)' },
  { value: 'TEEN', label: 'Adolescent (13-17 ans)' },
  { value: 'ADULT', label: 'Adulte (18-64 ans)' },
  { value: 'SENIOR', label: 'Senior (65+ ans)' },
];

export default function FamilyMembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'MEMBER' as FamilyRole,
    ageGroup: 'ADULT' as AgeGroup,
  });

  // Use mock data for demo
  const members = mockMembers;

  const handleAddMember = () => {
    // In real app, this would call the store/API
    console.log('Adding member:', newMember);
    setIsModalOpen(false);
    setNewMember({ name: '', role: 'MEMBER', ageGroup: 'ADULT' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Membres" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Members List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {members.length} membres
              </h2>
              <p className="text-sm text-gray-500">Maximum 6 membres</p>
            </div>
          </div>

          <div className="space-y-3">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FamilyMemberCard
                  member={member}
                  onEdit={() => console.log('Edit', member.id)}
                  onDelete={member.role !== 'ADMIN' ? () => console.log('Delete', member.id) : undefined}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Add Member Buttons */}
        {members.length < 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full"
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Ajouter un membre
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsInviteModalOpen(true)}
              className="w-full"
              leftIcon={<UserPlus className="w-5 h-5" />}
            >
              Inviter par email
            </Button>
          </motion.div>
        )}

        {/* Info Card */}
        <Card variant="flat" padding="md" className="bg-blue-50 border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-2">
            Profils adaptés pour chaque membre
          </h4>
          <p className="text-sm text-blue-700">
            Chaque membre dispose de son propre profil nutritionnel avec des objectifs personnalisés selon son âge, son poids et ses besoins spécifiques.
          </p>
        </Card>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau membre"
      >
        <div className="space-y-4">
          <Input
            label="Prénom"
            placeholder="Ex: Marie"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setNewMember({ ...newMember, role: option.value })}
                  className={cn(
                    'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                    newMember.role === option.value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tranche d'âge
            </label>
            <div className="space-y-2">
              {ageGroupOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setNewMember({ ...newMember, ageGroup: option.value })}
                  className={cn(
                    'w-full py-2 px-3 rounded-lg text-sm text-left transition-all',
                    newMember.ageGroup === option.value
                      ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                      : 'bg-gray-50 border-2 border-transparent text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleAddMember} disabled={!newMember.name} className="flex-1">
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Inviter un membre"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Envoyez une invitation par email. La personne recevra un lien pour rejoindre votre famille.
          </p>
          <Input
            type="email"
            label="Adresse email"
            placeholder="marie@exemple.com"
            leftIcon={<Mail className="w-5 h-5" />}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsInviteModalOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button className="flex-1">
              Envoyer l'invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
