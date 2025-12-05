'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Utensils, Brain, Users, ShoppingCart, TrendingUp, Heart } from 'lucide-react';
import { cn } from '@/core/lib/cn';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Utensils;
  gradient: string;
  image?: string;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: 'Love your meal,',
    subtitle: 'love yourself.',
    description: 'Retrouve une relation saine, simple et inspirante avec ton alimentation.',
    icon: Heart,
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 2,
    title: 'Plans personnalisés',
    subtitle: 'pour toi.',
    description: 'Des repas adaptés à tes goûts, tes objectifs et ton mode de vie.',
    icon: Utensils,
    gradient: 'from-orange-400 to-amber-500',
  },
  {
    id: 3,
    title: 'Coach IA',
    subtitle: 'à tes côtés.',
    description: 'Un soutien bienveillant qui s\'adapte à ton rythme et tes progrès.',
    icon: Brain,
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    id: 4,
    title: 'Mode Famille',
    subtitle: 'tous ensemble.',
    description: 'Planifiez les repas pour toute la famille avec des besoins personnalisés.',
    icon: Users,
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    id: 5,
    title: 'Courses intelligentes',
    subtitle: 'simplifiées.',
    description: 'Liste de courses auto-générée avec estimation du budget.',
    icon: ShoppingCart,
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    id: 6,
    title: 'Suivez vos progrès',
    subtitle: 'jour après jour.',
    description: 'Visualisez votre évolution et célébrez chaque victoire.',
    icon: TrendingUp,
    gradient: 'from-emerald-400 to-green-500',
  },
];

interface MarketingCarouselProps {
  autoPlay?: boolean;
  interval?: number;
}

export function MarketingCarousel({ autoPlay = true, interval = 4000 }: MarketingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide]);

  const currentSlide = slides[currentIndex];
  const Icon = currentSlide.icon;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
          >
            {/* Icon with gradient background */}
            <div
              className={cn(
                'w-24 h-24 rounded-3xl flex items-center justify-center mb-8',
                'bg-gradient-to-br shadow-lg',
                currentSlide.gradient
              )}
            >
              <Icon className="w-12 h-12 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentSlide.title}
            </h2>
            <h3 className={cn(
              'text-3xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent',
              currentSlide.gradient
            )}>
              {currentSlide.subtitle}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-lg max-w-sm leading-relaxed">
              {currentSlide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white shadow-md transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white shadow-md transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 py-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === currentIndex
                ? 'w-8 bg-emerald-500'
                : 'bg-gray-300 hover:bg-gray-400'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
