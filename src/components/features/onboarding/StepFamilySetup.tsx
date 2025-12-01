"use client";

import { useState } from 'react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useFamilyStore } from '@/store/family-store';
import { OnboardingLayout } from './OnboardingLayout';
import { User, Plus, Trash2, Baby, Users, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FamilyMemberForm {
    id: string;
    firstName: string;
    birthYear: string;
    gender: 'male' | 'female' | 'other' | '';
    role: 'parent' | 'child' | 'teen' | 'senior' | '';
}

export function StepFamilySetup() {
    const { profile } = useOnboardingStore();
    const [familyName, setFamilyName] = useState(`Famille ${profile.name || ''}`);
    const [members, setMembers] = useState<FamilyMemberForm[]>([
        {
            id: '1',
            firstName: profile.name || '',
            birthYear: profile.age ? (new Date().getFullYear() - profile.age).toString() : '',
            gender: profile.gender || '',
            role: 'parent',
        },
    ]);

    const addMember = () => {
        setMembers([
            ...members,
            {
                id: Date.now().toString(),
                firstName: '',
                birthYear: '',
                gender: '',
                role: '',
            },
        ]);
    };

    const removeMember = (id: string) => {
        if (members.length > 1) {
            setMembers(members.filter((m) => m.id !== id));
        }
    };

    const updateMember = (id: string, field: string, value: string) => {
        setMembers(
            members.map((m) => (m.id === id ? { ...m, [field]: value } : m))
        );
    };

    const canContinue = () => {
        return (
            familyName.trim() !== '' &&
            members.length >= 2 &&
            members.every((m) => m.firstName && m.birthYear && m.gender && m.role)
        );
    };

    const handleContinue = async () => {
        try {
            // Créer une famille temporaire dans le store (sans DB pour l'instant)
            const tempFamily = {
                id: `temp-family-${Date.now()}`,
                name: familyName,
                adminId: 'temp-admin',
                inviteCode: 'TEMP1234',
                subscriptionTier: 'starter' as const,
                maxMembers: 6,
                weeklyBudget: null,
                sharedGoals: [],
                isActive: true,
                invitesUsed: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Créer les membres temporaires
            const tempMembers = members.map((m, index) => ({
                id: `temp-member-${Date.now()}-${index}`,
                familyId: tempFamily.id,
                userId: index === 0 ? 'temp-admin' : `temp-user-${index}`,
                firstName: m.firstName,
                birthDate: new Date(parseInt(m.birthYear), 0, 1),
                gender: m.gender as 'male' | 'female' | 'other',
                role: m.role as 'parent' | 'child' | 'teen' | 'senior',
                nickname: null,
                avatarUrl: null,
                height: null,
                weight: null,
                targetWeight: null,
                activityLevel: 'moderate' as const,
                primaryGoal: null,
                dietType: 'omnivore',
                allergies: [],
                intolerances: [],
                medicalConditions: [],
                likedFoods: [],
                dislikedFoods: [],
                targetCalories: 2000,
                targetProteins: 150,
                targetCarbs: 200,
                targetFats: 65,
                isActive: true,
                joinedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

            // Sauvegarder dans le store
            const { setFamily, setMembers } = useFamilyStore.getState();
            setFamily(tempFamily as any);
            setMembers(tempMembers as any);

            console.log('✅ Famille créée:', { family: tempFamily, members: tempMembers });

            // En mode famille, on saute directement à l'analyse (step 8)
            // Car les infos individuelles ne sont pas nécessaires
            const { setStep } = useOnboardingStore.getState();
            setStep(8);
        } catch (error) {
            console.error('❌ Erreur lors de la création:', error);
            alert('Erreur lors de la création de la famille');
        }
    };

    const roleOptions = [
        { value: 'parent', label: 'Parent', icon: Heart, color: 'purple' },
        { value: 'child', label: 'Enfant (3-10 ans)', icon: Baby, color: 'blue' },
        { value: 'teen', label: 'Ado (11-17 ans)', icon: User, color: 'green' },
        { value: 'senior', label: 'Senior (65+)', icon: Users, color: 'orange' },
    ];

    return (
        <OnboardingLayout
            title="Composez votre famille"
            subtitle="Ajoutez les membres pour des plans personnalisés"
        >
            {/* Nom de famille */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de votre famille
                </label>
                <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="Famille Dupont"
                    className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white focus:border-purple-500 focus:ring-0 transition-all outline-none font-medium"
                />
            </div>

            {/* Liste des membres */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Membres ({members.length}/6)</h3>
                    {members.length < 6 && (
                        <button
                            onClick={addMember}
                            className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Ajouter un membre
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {members.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-purple-200 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {member.firstName?.[0] || <User size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Membre {index + 1}</p>
                                        <p className="font-medium text-gray-900">
                                            {member.firstName || 'Sans nom'}
                                        </p>
                                    </div>
                                </div>

                                {members.length > 1 && (
                                    <button
                                        onClick={() => removeMember(member.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {/* Prénom */}
                                <input
                                    type="text"
                                    value={member.firstName}
                                    onChange={(e) => updateMember(member.id, 'firstName', e.target.value)}
                                    placeholder="Prénom"
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-purple-500 focus:bg-white focus:ring-0 transition-all outline-none text-sm"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Année de naissance */}
                                    <input
                                        type="number"
                                        value={member.birthYear}
                                        onChange={(e) => updateMember(member.id, 'birthYear', e.target.value)}
                                        placeholder="Année (ex: 1985)"
                                        min="1920"
                                        max={new Date().getFullYear()}
                                        className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-purple-500 focus:bg-white focus:ring-0 transition-all outline-none text-sm"
                                    />

                                    {/* Genre */}
                                    <select
                                        value={member.gender}
                                        onChange={(e) => updateMember(member.id, 'gender', e.target.value)}
                                        className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-purple-500 focus:bg-white focus:ring-0 transition-all outline-none text-sm appearance-none"
                                    >
                                        <option value="">Genre</option>
                                        <option value="male">Homme</option>
                                        <option value="female">Femme</option>
                                        <option value="other">Autre</option>
                                    </select>
                                </div>

                                {/* Rôle */}
                                <div className="grid grid-cols-2 gap-2">
                                    {roleOptions.map((role) => {
                                        const RoleIcon = role.icon;
                                        const isSelected = member.role === role.value;

                                        return (
                                            <button
                                                key={role.value}
                                                onClick={() => updateMember(member.id, 'role', role.value)}
                                                className={cn(
                                                    "p-2 rounded-xl border-2 text-xs font-medium transition-all flex items-center justify-center gap-1",
                                                    isSelected
                                                        ? `border-${role.color}-500 bg-${role.color}-50 text-${role.color}-700`
                                                        : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                                                )}
                                            >
                                                <RoleIcon size={14} />
                                                {role.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-700">
                    <strong>💡 Astuce :</strong> Plus les profils sont précis, plus les recommandations nutritionnelles seront adaptées.
                </p>
            </div>

            {/* Bouton continuer */}
            <div className="mt-6">
                <button
                    onClick={handleContinue}
                    disabled={!canContinue()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 rounded-xl font-bold shadow-lg disabled:shadow-none transition-all"
                >
                    Continuer
                </button>

                {!canContinue() && members.length < 2 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Ajoutez au moins un autre membre pour le mode famille
                    </p>
                )}
            </div>
        </OnboardingLayout>
    );
}



