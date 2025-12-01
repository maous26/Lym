'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extractRecipeFromUrl } from '@/app/actions/recipe-extractor';
import { Link2, Loader2, Sparkles, Instagram, Music2, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function ShareRecipePage() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedRecipe, setExtractedRecipe] = useState<any>(null);
    const [error, setError] = useState('');

    const detectPlatform = (url: string) => {
        if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
        if (url.includes('tiktok.com')) return 'tiktok';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
        return null;
    };

    const handleExtract = async () => {
        if (!url.trim()) return;

        const platform = detectPlatform(url);
        if (!platform) {
            setError('Lien non supporté. Utilisez Instagram, TikTok ou YouTube.');
            return;
        }

        setIsExtracting(true);
        setError('');

        try {
            const result = await extractRecipeFromUrl(url);

            if (result.success && result.recipe) {
                setExtractedRecipe(result.recipe);
            } else {
                setError(result.error || 'Impossible d\'extraire la recette');
            }
        } catch (err) {
            console.error(err);
            setError('Une erreur est survenue');
        } finally {
            setIsExtracting(false);
        }
    };

    const handlePublish = async () => {
        if (!extractedRecipe) return;

        setIsExtracting(true);

        try {
            const { saveExtractedRecipe } = await import('@/app/actions/recipe-extractor');
            
            // TODO: Get real userId and userName from auth
            const result = await saveExtractedRecipe(
                extractedRecipe,
                'default', // userId - to be replaced with real auth
                'Chef Anonyme' // userName - to be replaced with real user name
            );

            if (result.success) {
                router.push('/community?published=true');
            } else {
                setError('Impossible de publier la recette');
            }
        } catch (err) {
            console.error(err);
            setError('Une erreur est survenue lors de la publication');
        } finally {
            setIsExtracting(false);
        }
    };

    const getPlatformIcon = (url: string) => {
        if (url.includes('instagram')) return <Instagram size={20} className="text-pink-500" />;
        if (url.includes('tiktok')) return <Music2 size={20} className="text-black" />;
        return <Link2 size={20} className="text-gray-500" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Partager une Recette</h1>
                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Annuler
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {!extractedRecipe ? (
                    <>
                        {/* Instructions */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                            <div className="flex items-start gap-3 mb-4">
                                <Sparkles className="h-6 w-6 text-purple-600 shrink-0 mt-1" />
                                <div>
                                    <h2 className="font-bold text-gray-900 mb-2">Comment ça marche ?</h2>
                                    <ol className="text-sm text-gray-600 space-y-2">
                                        <li>1. Copiez le lien d'une recette Instagram, TikTok ou YouTube</li>
                                        <li>2. L'IA extrait automatiquement les ingrédients et étapes</li>
                                        <li>3. Une nouvelle photo est générée pour votre recette</li>
                                        <li>4. Les macros sont calculés automatiquement</li>
                                        <li>5. Partagez dans la communauté !</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* URL Input */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Lien de la recette
                            </label>

                            <div className="flex gap-2 mb-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        inputMode="url"
                                        value={url}
                                        onChange={(e) => {
                                            setUrl(e.target.value);
                                            setError('');
                                        }}
                                        onPaste={(e) => {
                                            const pastedText = e.clipboardData.getData('text');
                                            setUrl(pastedText);
                                            setError('');
                                        }}
                                        placeholder="Collez ici le lien Instagram, TikTok ou YouTube"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                        className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-all outline-none text-gray-900 bg-white"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        {url ? getPlatformIcon(url) : <Link2 size={20} className="text-gray-400" />}
                                    </div>
                                </div>
                                <button
                                    onClick={handleExtract}
                                    disabled={!url.trim() || isExtracting}
                                    className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isExtracting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Extraction...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            Extraire
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Supported Platforms */}
                            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-500">Plateformes supportées :</span>
                                <div className="flex gap-3">
                                    <Instagram size={24} className="text-pink-500" />
                                    <Music2 size={24} className="text-black" />
                                    <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Recipe Preview */
                    <div className="space-y-6">
                        {/* Success Message */}
                        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                            <div>
                                <h3 className="font-bold text-green-900">Recette extraite avec succès !</h3>
                                <p className="text-sm text-green-700">Vérifiez les informations avant de publier</p>
                            </div>
                        </div>

                        {/* Recipe Card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Image */}
                            {extractedRecipe.imageUrl && (
                                <div className="relative h-64 w-full">
                                    <Image
                                        src={extractedRecipe.imageUrl}
                                        alt={extractedRecipe.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <Sparkles size={14} />
                                        Généré par IA
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{extractedRecipe.title}</h2>
                                    {extractedRecipe.description && (
                                        <p className="text-gray-600">{extractedRecipe.description}</p>
                                    )}
                                </div>

                                {/* Macros */}
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="bg-orange-50 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-orange-600">{extractedRecipe.calories}</div>
                                        <div className="text-xs text-gray-600">kcal</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{extractedRecipe.proteins}g</div>
                                        <div className="text-xs text-gray-600">Protéines</div>
                                    </div>
                                    <div className="bg-yellow-50 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-yellow-600">{extractedRecipe.carbs}g</div>
                                        <div className="text-xs text-gray-600">Glucides</div>
                                    </div>
                                    <div className="bg-green-50 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-green-600">{extractedRecipe.fats}g</div>
                                        <div className="text-xs text-gray-600">Lipides</div>
                                    </div>
                                </div>

                                {/* Ingredients */}
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3">Ingrédients</h3>
                                    <ul className="space-y-2">
                                        {extractedRecipe.ingredients.map((ingredient: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-700">
                                                <span className="text-purple-500 mt-1">•</span>
                                                <span>{ingredient}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Instructions */}
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3">Préparation</h3>
                                    <ol className="space-y-3">
                                        {extractedRecipe.instructions.map((step: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-gray-700">
                                                <span className="font-bold text-purple-600 shrink-0">{i + 1}.</span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setExtractedRecipe(null);
                                    setUrl('');
                                }}
                                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                                Recommencer
                            </button>
                            <button
                                onClick={handlePublish}
                                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20} />
                                Publier dans la communauté
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
