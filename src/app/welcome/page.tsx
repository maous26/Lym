'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Slides marketing LYM - parcours d'accueil complet avec illustrations 370x460
const slides = [
  {
    title: "Bienvenue sur LYM",
    subtitle: "Votre coach nutritionnel personnel",
    description: "Transformez votre alimentation avec une approche bienveillante et personnalisée. Sans pression ni obsession.",
    // Image: personne souriante avec des légumes frais
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=370&h=460&fit=crop&crop=center",
    gradient: "from-emerald-50 via-white to-amber-50",
    accent: "#10B981",
  },
  {
    title: "LYM comprend vos repas",
    subtitle: "Scannez, parlez, ou importez",
    description: "Photo, voix ou recettes en ligne : LYM comprend ce que vous mangez, simplement et instantanément.",
    // Image: smartphone qui scanne un plat
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=370&h=460&fit=crop&crop=center",
    gradient: "from-amber-50 via-white to-orange-50",
    accent: "#F59E0B",
  },
  {
    title: "Plans Repas Intelligents",
    subtitle: "Adaptés à vos objectifs",
    description: "Des menus personnalisés qui évoluent avec vous. Chaque suggestion est calibrée pour votre réussite.",
    // Image: meal prep coloré et organisé
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=370&h=460&fit=crop&crop=center",
    gradient: "from-blue-50 via-white to-cyan-50",
    accent: "#3B82F6",
  },
  {
    title: "Coach IA 24/7",
    subtitle: "Votre compagnon nutritionnel",
    description: "Posez vos questions, partagez vos doutes. Votre coach est toujours là pour vous guider.",
    // Image: conversation/chat moderne
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=370&h=460&fit=crop&crop=center",
    gradient: "from-teal-50 via-white to-emerald-50",
    accent: "#14B8A6",
  },
  {
    title: "Mode Famille FamilLYM",
    subtitle: "Gérez la nutrition de toute votre famille",
    description: "Un même repas, des portions adaptées à chaque membre. La santé de toute la famille, simplifiée.",
    // Image: famille qui cuisine ensemble
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=370&h=460&fit=crop&crop=center",
    gradient: "from-purple-50 via-white to-pink-50",
    accent: "#8B5CF6",
  },
  {
    title: "Commencez Aujourd'hui",
    subtitle: "Votre santé d'abord",
    description: "Rejoignez des milliers d'utilisateurs qui ont transformé leur relation avec la nourriture.",
    // Image: succès/objectif atteint
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=370&h=460&fit=crop&crop=center",
    gradient: "from-rose-50 via-white to-amber-50",
    accent: "#F43F5E",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  // Show loading state until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-amber-50">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center animate-pulse">
          <span className="text-3xl">🌱</span>
        </div>
      </div>
    );
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  const handleSkip = () => {
    router.push('/auth/login');
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }

    setTouchStart(null);
  };

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col overflow-hidden transition-all duration-700',
        `bg-gradient-to-b ${slide.gradient}`
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          key={`bg1-${currentSlide}`}
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40"
          style={{
            background: `radial-gradient(circle, ${slide.accent}30, transparent)`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          key={`bg2-${currentSlide}`}
          className="absolute top-1/3 -left-32 w-56 h-56 rounded-full opacity-25"
          style={{
            background: `radial-gradient(circle, ${slide.accent}25, transparent)`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.25 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.div
          key={`bg3-${currentSlide}`}
          className="absolute bottom-1/4 -right-20 w-40 h-40 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${slide.accent}20, transparent)`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </div>

      {/* Header with Skip button */}
      <header className="relative z-10 flex justify-between items-center px-6 pt-safe-top py-4">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-stone-800"
        >
          LYM<span style={{ color: slide.accent }}>.</span>
        </motion.h1>

        {!isLastSlide && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleSkip}
            className="text-stone-500 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors"
          >
            Passer
          </motion.button>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col px-8 pb-8">
        {/* Illustration Area - 370x460 */}
        <div className="flex-1 flex items-center justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
              className="relative"
            >
              {/* Main Image Card - 370x460 aspect ratio */}
              <div
                className="relative w-[280px] h-[348px] sm:w-[320px] sm:h-[398px] md:w-[370px] md:h-[460px] rounded-[32px] overflow-hidden"
                style={{
                  boxShadow: `0 25px 60px -15px ${slide.accent}40, 0 10px 20px -10px rgba(0,0,0,0.15)`,
                }}
              >
                {/* Image */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 370px"
                  priority
                />

                {/* Gradient overlay for better text contrast */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom, ${slide.accent}10 0%, transparent 30%, transparent 70%, ${slide.accent}20 100%)`,
                  }}
                />

                {/* Decorative border */}
                <div
                  className="absolute inset-3 rounded-[28px] border-2 opacity-20"
                  style={{ borderColor: 'white' }}
                />

                {/* Floating decorative elements */}
                <motion.div
                  className="absolute top-6 right-6 w-3 h-3 rounded-full bg-white/50"
                  animate={{ scale: [1, 1.2, 1], y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-16 left-6 w-4 h-4 rounded-full bg-white/40"
                  animate={{ scale: [1, 1.3, 1], y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </div>

              {/* Step Badge */}
              <motion.div
                className="absolute -bottom-3 -right-3 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}dd)`,
                  boxShadow: `0 8px 20px -4px ${slide.accent}60`,
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <span className="text-white text-xl font-bold">{currentSlide + 1}</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-3 mb-8 text-center"
          >
            <p
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: slide.accent }}
            >
              {slide.subtitle}
            </p>
            <h2 className="text-[28px] leading-[1.2] font-bold text-stone-800 tracking-tight">
              {slide.title}
            </h2>
            <p className="text-[15px] leading-[1.6] text-stone-500 font-normal max-w-sm mx-auto">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Pagination */}
          <div className="flex justify-center gap-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="py-2 transition-all"
                aria-label={`Aller à l'écran ${index + 1}`}
              >
                <motion.div
                  className="h-2 rounded-full"
                  style={{
                    background: index === currentSlide ? slide.accent : '#D6D3D1',
                  }}
                  animate={{
                    width: index === currentSlide ? 32 : 8,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isLastSlide ? (
              <>
                <motion.button
                  onClick={nextSlide}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}dd)`,
                    boxShadow: `0 10px 30px -8px ${slide.accent}50`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Suivant
                  <ChevronRight size={20} />
                </motion.button>
              </>
            ) : (
              <motion.button
                onClick={handleGetStarted}
                className="flex-1 py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}dd)`,
                  boxShadow: `0 10px 30px -8px ${slide.accent}50`,
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Commencer maintenant
                <ArrowRight size={20} />
              </motion.button>
            )}
          </div>
        </div>
      </main>

      {/* Safe area padding for iOS */}
      <div className="h-safe-bottom" />
    </div>
  );
}
