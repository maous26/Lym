'use client';

import { useRouter } from 'next/navigation';
import { useUserStore, useIsFamilyMode, useFamily, useFamilyMembers } from '@/store/user-store';
import { Users, ArrowRight, Plus, Crown, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export function FamilyModeWidget() {
    const router = useRouter();
    const isFamilyMode = useIsFamilyMode();
    const family = useFamily();
    const members = useFamilyMembers();
    const { hasFamilyProfile } = useUserStore();

    // Si utilisateur a déjà un profil famille, cacher le CTA
    if (hasFamilyProfile() && !isFamilyMode) {
        return null;
    }

    // Si mode famille est actif
    if (isFamilyMode && family) {
        const memberCount = members.length;
        const firstMembers = members.slice(0, 3);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-xl"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Crown size={20} className="text-yellow-300" />
                            <span className="text-xs font-semibold text-purple-100 uppercase tracking-wide">
                                Mode Famille Actif
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold">{family.name}</h2>
                        <p className="text-purple-100 text-sm">{memberCount} membre{memberCount > 1 ? 's' : ''}</p>
                    </div>
                    <Users size={32} className="text-white/30" />
                </div>

                {/* Avatars membres */}
                <div className="flex items-center gap-2 mb-4">
                    {firstMembers.map((member, index) => (
                        <div
                            key={member.id}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-sm shadow-md"
                            style={{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 10 - index }}
                        >
                            {member.firstName[0]}
                        </div>
                    ))}
                    {memberCount > 3 && (
                        <div
                            className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md"
                            style={{ marginLeft: '-8px' }}
                        >
                            +{memberCount - 3}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => router.push('/family')}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-xl p-3 flex items-center justify-center gap-2 font-semibold text-sm"
                    >
                        <Users size={16} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => router.push('/family/plan')}
                        className="bg-white hover:bg-gray-50 transition-all rounded-xl p-3 flex items-center justify-center gap-2 font-semibold text-sm text-purple-600"
                    >
                        <Star size={16} />
                        Nouveau Plan
                    </button>
                </div>
            </motion.div>
        );
    }

    // Si mode famille n'est pas actif - CTA pour l'activer
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all cursor-pointer group"
            onClick={() => router.push('/onboarding/family')}
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Users size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">FamilLYM</h3>
                    <p className="text-sm text-gray-600">
                        Gérez la nutrition de toute votre famille en un seul endroit
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-4">
                {[
                    '3-6 membres avec profils personnalisés',
                    'Plans repas adaptés par âge',
                    'Liste courses partagée intelligente',
                    'Coach IA pour chaque membre',
                ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {feature}
                    </div>
                ))}
            </div>

            {/* Badge Prix */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md mb-3">
                <Heart size={14} />
                À partir de 12€/mois
            </div>

            {/* CTA */}
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                Activer FamilLYM
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    );
}



