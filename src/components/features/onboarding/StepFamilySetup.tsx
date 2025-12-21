"use client";

import { useState } from 'react';
import { useFamilyOnboardingStore, FamilyMemberInput } from '@/store/family-onboarding-store';
import { OnboardingLayout } from './OnboardingLayout';
import { User, Plus, Trash2, Users, Baby, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StepFamilySetup() {
    const { data, updateData, addMember, removeMember, complete } = useFamilyOnboardingStore();
    const [familyName, setFamilyName] = useState(data.familyName || 'Ma Famille');
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<'parent' | 'child' | 'teen' | 'senior'>('parent');

    const handleAddMember = () => {
        if (newMemberName.trim()) {
            const newMember: FamilyMemberInput = {
                id: Date.now().toString(),
                firstName: newMemberName.trim(),
                role: newMemberRole,
            };
            addMember(newMember);
            setNewMemberName('');
            setNewMemberRole('parent');
        }
    };

    const handleComplete = () => {
        updateData({ familyName });
        complete();
    };

    const canContinue = familyName.trim() && data.members.length > 0;

    const roleOptions = [
        { value: 'parent', label: 'Parent', icon: Heart, color: 'purple' },
        { value: 'child', label: 'Enfant', icon: Baby, color: 'blue' },
        { value: 'teen', label: 'Ado', icon: User, color: 'green' },
        { value: 'senior', label: 'Senior', icon: Users, color: 'orange' },
    ] as const;

    return (
        <OnboardingLayout
            title="Créez votre famille"
            subtitle="Ajoutez les membres de votre famille pour des plans personnalisés"
        >
            <div className="space-y-6">
                {/* Nom de la famille */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Users size={18} className="text-purple-600" />
                        Nom de votre famille
                    </label>
                    <input
                        type="text"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        placeholder="Ex: Famille Dupont"
                        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 transition-all outline-none text-lg font-medium"
                    />
                </div>

                {/* Liste des membres */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Membres de la famille ({data.members.length}/6)
                    </label>

                    {data.members.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Ajoutez votre premier membre</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            <div className="space-y-2">
                                {data.members.map((member, index) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center",
                                                member.role === 'parent' ? "bg-purple-100 text-purple-600" :
                                                member.role === 'child' ? "bg-blue-100 text-blue-600" :
                                                member.role === 'teen' ? "bg-green-100 text-green-600" :
                                                "bg-orange-100 text-orange-600"
                                            )}>
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{member.firstName}</p>
                                                <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeMember(member.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Ajouter un membre */}
                {data.members.length < 6 && (
                    <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <Plus size={18} className="text-purple-600" />
                            Ajouter un membre
                        </h4>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="Prénom"
                                className="w-full p-3 rounded-lg border border-gray-200 focus:border-purple-500 outline-none"
                            />

                            <div className="grid grid-cols-2 gap-2">
                                {roleOptions.map((role) => {
                                    const RoleIcon = role.icon;
                                    const isSelected = newMemberRole === role.value;

                                    return (
                                        <button
                                            key={role.value}
                                            onClick={() => setNewMemberRole(role.value)}
                                            className={cn(
                                                "p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2",
                                                isSelected
                                                    ? "border-purple-500 bg-purple-100 text-purple-700"
                                                    : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                                            )}
                                        >
                                            <RoleIcon size={16} />
                                            {role.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleAddMember}
                                disabled={!newMemberName.trim()}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
                            >
                                Ajouter ce membre
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={handleComplete}
                    disabled={!canContinue}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 rounded-xl font-bold shadow-lg disabled:shadow-none transition-all hover:opacity-90"
                >
                    Terminer la configuration
                </button>

                {!canContinue && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Ajoutez un nom de famille et au moins un membre pour continuer
                    </p>
                )}
            </div>
        </OnboardingLayout>
    );
}
