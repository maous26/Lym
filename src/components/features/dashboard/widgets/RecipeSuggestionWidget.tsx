'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, Users, ChefHat, Heart, Sparkles, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';

interface Recipe {
  id: string;
  name: string;
  imageUrl: string;
  prepTime: number;
  servings: number;
  calories: number;
  tags: string[];
  matchScore: number; // 0-100
  isFavorite?: boolean;
  averageRating?: number;
  ratingsCount?: number;
}

interface RecipeSuggestionWidgetProps {
  recipes: Recipe[];
  onRecipeClick: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string) => void;
  onSeeAll: () => void;
  className?: string;
}

export function RecipeSuggestionWidget({
  recipes,
  onRecipeClick,
  onToggleFavorite,
  onSeeAll,
  className,
}: RecipeSuggestionWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-3xl p-5 shadow-card', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">Suggestions du jour</h3>
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Sparkles className="w-3 h-3" />
              <span>Adapté à ton profil</span>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSeeAll}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Tout voir
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Recipes Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {recipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-[200px] snap-start"
          >
            <motion.div
              onClick={() => onRecipeClick(recipe.id)}
              className="w-full text-left group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRecipeClick(recipe.id);
                }
              }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3">
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Match Score Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg">
                  <span className="text-xs font-semibold text-primary-600">
                    {recipe.matchScore}% match
                  </span>
                </div>

                {/* Favorite Button */}
                <motion.div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(recipe.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite(recipe.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={recipe.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    className={cn(
                      'w-4 h-4 transition-colors',
                      recipe.isFavorite
                        ? 'fill-red-500 text-red-500'
                        : 'text-stone-400'
                    )}
                  />
                </motion.div>

                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Calories */}
                <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                  {recipe.calories} kcal
                </div>
              </div>

              {/* Content */}
              <h4 className="font-semibold text-stone-800 text-sm line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
                {recipe.name}
              </h4>

              {/* Rating */}
              {recipe.averageRating !== undefined && recipe.averageRating > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium text-stone-700">
                    {recipe.averageRating.toFixed(1)}
                  </span>
                  {recipe.ratingsCount !== undefined && recipe.ratingsCount > 0 && (
                    <span className="text-xs text-stone-400">
                      ({recipe.ratingsCount})
                    </span>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{recipe.prepTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{recipe.servings} pers.</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {recipe.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default RecipeSuggestionWidget;
