'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Apple, Target, Users, Zap, TrendingUp, Heart, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const carouselScreens = [
    {
        id: 1,
        title: 'Bienvenue sur LYM',
        subtitle: 'Votre coach nutritionnel personnel',
        description: 'Transformez votre alimentation avec des plans repas personnalisés et un coach IA disponible 24/7',
        icon: Target,
        gradient: 'from-blue-600 to-cyan-500',
    },
    {
        id: 2,
        title: 'Plans Repas Intelligents',
        subtitle: 'Adaptés à vos objectifs',
        description: 'Découvrez chaque semaine des repas variés adaptés à vos préférences, restrictions et objectifs nutritionnels',
        icon: Apple,
        gradient: 'from-green-600 to-emerald-500',
    },
    {
        id: 3,
        title: 'Coach IA 24/7',
        subtitle: 'Votre compagnon nutritionnel',
        description: 'Posez vos questions, recevez des conseils personnalisés et suivez vos progrès avec notre intelligence artificielle',
        icon: Zap,
        gradient: 'from-purple-600 to-pink-500',
    },
    {
        id: 4,
        title: 'Suivi Précis',
        subtitle: 'Vos calories et macronutriments',
        description: 'Suivez facilement vos apports en calories, protéines, glucides et lipides pour atteindre vos objectifs',
        icon: TrendingUp,
        gradient: 'from-orange-600 to-red-500',
    },
    {
        id: 5,
        title: 'Mode Famille FamilLYM',
        subtitle: 'Gérez la nutrition de toute votre famille',
        description: 'Créez des plans repas pour 3 à 6 membres, avec des profils adaptés par âge et besoins spécifiques',
        icon: Users,
        gradient: 'from-indigo-600 to-purple-500',
    },
    {
        id: 6,
        title: 'Commencez Aujourd\'hui',
        subtitle: 'Votre santé d\'abord',
        description: 'Rejoignez des milliers d\'utilisateurs qui ont transformé leur relation avec la nourriture',
        icon: Heart,
        gradient: 'from-rose-600 to-pink-500',
    },
];

export default function LandingPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? carouselScreens.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === carouselScreens.length - 1 ? 0 : prev + 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const handleGetStarted = () => {
        router.push('/auth/login');
    };

    const currentScreen = carouselScreens[currentIndex];
    const Icon = currentScreen.icon;
    const isLastSlide = currentIndex === carouselScreens.length - 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                {/* Main Carousel */}
                <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
                    <div className="aspect-video relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                className={`absolute inset-0 bg-gradient-to-br ${currentScreen.gradient} flex flex-col items-center justify-center text-white p-8`}
                            >
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="mb-6"
                                >
                                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <Icon size={48} className="text-white" />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="text-center"
                                >
                                    <h2 className="text-4xl font-bold mb-2">{currentScreen.title}</h2>
                                    <p className="text-xl font-semibold text-white/80 mb-4">{currentScreen.subtitle}</p>
                                    <p className="text-lg text-white/70 leading-relaxed max-w-md">{currentScreen.description}</p>
                                </motion.div>

                                {/* Progress indicator */}
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                                    <div className="bg-white/30 backdrop-blur-sm rounded-full px-4 py-2">
                                        <p className="text-sm font-semibold">
                                            {currentIndex + 1} / {carouselScreens.length}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/50 transition-all"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="text-white" size={24} />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/50 transition-all"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="text-white" size={24} />
                    </button>
                </div>

                {/* Dot Navigation */}
                <div className="flex justify-center gap-2 mt-6">
                    {carouselScreens.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all ${
                                index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Get Started Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex justify-center"
                >
                    <button
                        onClick={isLastSlide ? handleGetStarted : goToNext}
                        className={`group px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 transition-all transform hover:scale-105 ${
                            isLastSlide
                                ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg hover:shadow-pink-500/50'
                                : 'bg-white text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        {isLastSlide ? 'Commencer Maintenant' : 'Suivant'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>

                {/* Skip Button */}
                {!isLastSlide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 text-center"
                    >
                        <button
                            onClick={handleGetStarted}
                            className="text-white/70 hover:text-white transition-colors text-sm"
                        >
                            Passer l'introduction
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
