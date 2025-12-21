'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Slides marketing LYM - inspirés de l'onboarding
const slides = [
  {
    title: "Mieux manger devient une seconde nature.",
    subtitle: "LYM t'accompagne dans ton quotidien, sans pression ni obsession.",
    icon: "🌱",
    gradient: "from-emerald-50 via-white to-amber-50",
    accent: "#10B981",
    accentName: "emerald",
  },
  {
    title: "LYM comprend tes repas.",
    subtitle: "Photo, voix ou recettes en ligne : LYM comprend ce que tu manges, simplement.",
    icon: "📸",
    gradient: "from-amber-50 via-white to-orange-50",
    accent: "#F59E0B",
    accentName: "amber",
  },
  {
    title: "Un soutien bienveillant, jour après jour.",
    subtitle: "Ton coach IA t'accompagne dans la durée, selon ton rythme et tes envies.",
    icon: "💚",
    gradient: "from-teal-50 via-white to-emerald-50",
    accent: "#14B8A6",
    accentName: "teal",
  },
  {
    title: "Ta vie devient plus légère.",
    subtitle: "Listes de courses intelligentes, planification familiale, portions adaptées — tout converge vers ton équilibre.",
    icon: "✨",
    gradient: "from-lime-50 via-white to-green-50",
    accent: "#84CC16",
    accentName: "lime",
  },
  {
    title: "Et ceux que tu aimes en profitent aussi.",
    subtitle: "Un même repas, des portions adaptées à chaque membre de la famille.",
    icon: "👨‍👩‍👧‍👦",
    gradient: "from-rose-50 via-white to-amber-50",
    accent: "#F43F5E",
    accentName: "rose",
  },
];

interface MarketingCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showPagination?: boolean;
  showSkip?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function MarketingCarousel({
  autoPlay = true,
  autoPlayInterval = 5000,
  showPagination = true,
  showSkip = false,
  onComplete,
  className,
}: MarketingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const slide = slides[currentSlide];

  // Animation trigger on slide change
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isPaused]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete?.();
    }
  }, [currentSlide, onComplete]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsPaused(true);
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
    setIsPaused(false);
  };

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden',
        `bg-gradient-to-b ${slide.gradient}`,
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
      }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40"
          style={{
            background: `radial-gradient(circle, ${slide.accent}30, transparent)`,
          }}
          animate={{
            scale: isAnimating ? 0.8 : 1,
          }}
          transition={{ duration: 1 }}
        />
        <motion.div
          className="absolute top-1/3 -left-32 w-56 h-56 rounded-full opacity-25"
          style={{
            background: `radial-gradient(circle, ${slide.accent}25, transparent)`,
          }}
          animate={{
            scale: isAnimating ? 0.8 : 1,
          }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-40 h-40 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${slide.accent}20, transparent)`,
          }}
          animate={{
            scale: isAnimating ? 0.8 : 1,
          }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col px-8 pt-16 pb-8">
        {/* Illustration Area */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Main Card */}
              <div
                className="w-56 h-56 rounded-[40px] flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, white 0%, ${slide.accent}08 100%)`,
                  boxShadow: `0 25px 60px -15px ${slide.accent}35, 0 10px 20px -10px rgba(0,0,0,0.1)`,
                }}
              >
                {/* Inner decorative border */}
                <div
                  className="absolute inset-4 rounded-[32px] border-2 opacity-15"
                  style={{ borderColor: slide.accent }}
                />

                {/* Floating particles */}
                <motion.div
                  className="absolute top-8 right-10 w-3 h-3 rounded-full"
                  style={{ background: slide.accent, opacity: 0.5 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-12 left-8 w-4 h-4 rounded-full"
                  style={{ background: slide.accent, opacity: 0.35 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div
                  className="absolute top-1/2 right-6 w-2 h-2 rounded-full"
                  style={{ background: slide.accent, opacity: 0.4 }}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />

                {/* Icon */}
                <span className="text-8xl filter drop-shadow-lg select-none">
                  {slide.icon}
                </span>
              </div>

              {/* Step Badge */}
              <motion.div
                className="absolute -bottom-3 -right-3 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}dd)`,
                  boxShadow: `0 8px 20px -4px ${slide.accent}60`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
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
            className="space-y-4 mb-8"
          >
            <h1 className="text-[28px] leading-[1.2] font-bold text-stone-800 tracking-tight">
              {slide.title}
            </h1>
            <p className="text-[16px] leading-[1.6] text-stone-500 font-normal">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Section */}
        <div className="space-y-5">
          {/* Pagination */}
          {showPagination && (
            <div className="flex justify-center gap-2.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="transition-all duration-300 py-2"
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
          )}

          {/* Skip Link */}
          {showSkip && currentSlide < slides.length - 1 && (
            <button
              onClick={() => onComplete?.()}
              className="w-full py-2 text-[15px] text-stone-400 active:text-stone-600 transition-colors"
            >
              Passer l'introduction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Version compacte pour la page de login (côté gauche)
export function MarketingCarouselCompact({ className }: { className?: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = slides[currentSlide];

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden',
        `bg-gradient-to-br ${slide.gradient}`,
        className
      )}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${slide.accent}40, transparent)`,
          }}
        />
        <div
          className="absolute bottom-1/4 -left-24 w-64 h-64 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${slide.accent}30, transparent)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-12">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <h2 className="text-2xl font-bold text-stone-800">
            LYM<span className="text-primary-500">.</span>
          </h2>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md"
          >
            {/* Icon */}
            <motion.div
              className="w-32 h-32 mx-auto mb-8 rounded-[32px] flex items-center justify-center"
              style={{
                background: `linear-gradient(145deg, white 0%, ${slide.accent}10 100%)`,
                boxShadow: `0 20px 50px -10px ${slide.accent}30`,
              }}
            >
              <span className="text-6xl">{slide.icon}</span>
            </motion.div>

            {/* Text */}
            <h1 className="text-2xl font-bold text-stone-800 mb-4 leading-tight">
              {slide.title}
            </h1>
            <p className="text-stone-500 leading-relaxed">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="p-1"
            >
              <motion.div
                className="h-1.5 rounded-full"
                style={{
                  background: index === currentSlide ? slide.accent : '#D6D3D1',
                }}
                animate={{
                  width: index === currentSlide ? 24 : 6,
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MarketingCarousel;
