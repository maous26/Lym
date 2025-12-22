'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Upload,
    X,
    Loader2,
    Check,
    AlertCircle,
    RefreshCw,
    Plus,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Image as ImageIcon
} from 'lucide-react';
import { analyzeFoodPhoto, type AnalyzedFood, type FoodAnalysisResult } from '@/app/actions/food-scanner';
import type { NutritionInfo } from '@/types/meal';

interface PhotoFoodScannerProps {
    onFoodDetected: (foods: AnalyzedFood[], totalNutrition: NutritionInfo) => void;
    mealType?: 'breakfast' | 'lunch' | 'snack' | 'dinner';
}

type ScannerState = 'idle' | 'camera' | 'preview' | 'analyzing' | 'results' | 'error';

export function PhotoFoodScanner({ onFoodDetected, mealType }: PhotoFoodScannerProps) {
    const [state, setState] = useState<ScannerState>('idle');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedFood, setExpandedFood] = useState<number | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            // Try with environment camera first (back camera on mobile)
            let stream: MediaStream | null = null;

            // Simpler constraints for better iOS compatibility
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 }
                },
                audio: false
            };

            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch {
                // Fallback: try with minimal constraints
                console.log('Environment camera not available, trying default camera');
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
            }

            // Store stream and change state FIRST so video element renders
            setCameraStream(stream);
            setState('camera');

        } catch (err) {
            console.error('Camera access denied:', err);
            setError("Impossible d'accéder à la caméra. Vérifiez les permissions dans Réglages > Safari > Caméra.");
            setState('error');
        }
    }, []);

    // Attach stream to video element when both are available
    useEffect(() => {
        if (cameraStream && videoRef.current && state === 'camera') {
            const video = videoRef.current;

            // Set attributes for iOS
            video.setAttribute('autoplay', 'true');
            video.setAttribute('playsinline', 'true');
            video.setAttribute('webkit-playsinline', 'true');
            video.muted = true;

            video.srcObject = cameraStream;

            // Play video
            video.play().catch(err => {
                console.log('Video play error:', err);
            });
        }
    }, [cameraStream, state]);

    // Stop camera
    const stopCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    }, [cameraStream]);

    // Capture photo from camera
    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        setState('preview');
    }, [stopCamera]);

    // Handle file upload
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setCapturedImage(result);
            setState('preview');
        };
        reader.readAsDataURL(file);
    }, []);

    // Analyze the captured image
    const analyzeImage = useCallback(async () => {
        if (!capturedImage) return;

        setState('analyzing');
        setError(null);

        try {
            const result = await analyzeFoodPhoto(capturedImage);

            if (result.success && result.foods && result.totalNutrition) {
                setAnalysisResult(result);
                setState('results');
            } else {
                setError(result.error || "Impossible d'analyser cette image");
                setState('error');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError("Erreur lors de l'analyse");
            setState('error');
        }
    }, [capturedImage]);

    // Add detected foods to meal
    const addToMeal = useCallback(() => {
        if (analysisResult?.foods && analysisResult?.totalNutrition) {
            onFoodDetected(analysisResult.foods, analysisResult.totalNutrition);
            reset();
        }
    }, [analysisResult, onFoodDetected]);

    // Reset scanner
    const reset = useCallback(() => {
        stopCamera();
        setCapturedImage(null);
        setAnalysisResult(null);
        setError(null);
        setExpandedFood(null);
        setState('idle');
    }, [stopCamera]);

    // Retry analysis
    const retry = useCallback(() => {
        setError(null);
        setState('preview');
    }, []);

    return (
        <div className="relative">
            <AnimatePresence mode="wait">
                {/* Idle State - Selection buttons */}
                {state === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-stone-800">Scanner un plat</h3>
                            <p className="text-sm text-stone-500 mt-1">
                                Prenez une photo ou importez une image pour analyser les valeurs nutritionnelles
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={startCamera}
                                className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white shadow-lg"
                            >
                                <Camera className="w-8 h-8" />
                                <span className="font-medium">Prendre une photo</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-stone-200 rounded-2xl text-stone-700 hover:border-purple-300"
                            >
                                <Upload className="w-8 h-8" />
                                <span className="font-medium">Importer</span>
                            </motion.button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        <p className="text-xs text-stone-400 text-center mt-4">
                            L'IA analysera votre plat et estimera les calories, protéines, glucides et lipides
                        </p>
                    </motion.div>
                )}

                {/* Camera State */}
                {state === 'camera' && (
                    <motion.div
                        key="camera"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                controls={false}
                                style={{ objectFit: 'cover' }}
                                className="w-full h-full object-cover"
                            />

                            {/* Camera overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-8 border-2 border-white/30 rounded-xl" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                                    <div className="absolute inset-0 border-t-2 border-l-2 border-white/60 rounded-tl" />
                                    <div className="absolute inset-0 border-t-2 border-r-2 border-white/60 rounded-tr translate-x-2" />
                                    <div className="absolute inset-0 border-b-2 border-l-2 border-white/60 rounded-bl translate-y-2" />
                                    <div className="absolute inset-0 border-b-2 border-r-2 border-white/60 rounded-br translate-x-2 translate-y-2" />
                                </div>
                            </div>
                        </div>

                        <canvas ref={canvasRef} className="hidden" />

                        <div className="flex items-center justify-center gap-4 mt-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={reset}
                                className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center"
                            >
                                <X className="w-5 h-5 text-stone-600" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={capturePhoto}
                                className="w-16 h-16 rounded-full bg-white border-4 border-purple-500 flex items-center justify-center shadow-lg"
                            >
                                <div className="w-12 h-12 rounded-full bg-purple-500" />
                            </motion.button>

                            <div className="w-12" /> {/* Spacer for centering */}
                        </div>
                    </motion.div>
                )}

                {/* Preview State */}
                {state === 'preview' && capturedImage && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                            <img
                                src={capturedImage}
                                alt="Captured food"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={reset}
                                className="flex-1 py-3 px-4 bg-stone-100 rounded-xl font-medium text-stone-700 flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reprendre
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={analyzeImage}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Sparkles className="w-4 h-4" />
                                Analyser
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Analyzing State */}
                {state === 'analyzing' && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-12 text-center"
                    >
                        <div className="relative w-20 h-20 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
                            <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-purple-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-stone-800">Analyse en cours...</h3>
                        <p className="text-sm text-stone-500 mt-1">
                            L'IA identifie les aliments et calcule les valeurs nutritionnelles
                        </p>
                    </motion.div>
                )}

                {/* Results State */}
                {state === 'results' && analysisResult?.foods && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {/* Success header */}
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">
                                    {analysisResult.foods.length} aliment{analysisResult.foods.length > 1 ? 's' : ''} détecté{analysisResult.foods.length > 1 ? 's' : ''}
                                </p>
                                {analysisResult.notes && (
                                    <p className="text-xs text-green-600">{analysisResult.notes}</p>
                                )}
                            </div>
                        </div>

                        {/* Total nutrition summary */}
                        {analysisResult.totalNutrition && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-stone-600 mb-3">Total estimé</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-purple-600">
                                            {Math.round(analysisResult.totalNutrition.calories)}
                                        </p>
                                        <p className="text-xs text-stone-500">kcal</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-blue-600">
                                            {Math.round(analysisResult.totalNutrition.proteins)}g
                                        </p>
                                        <p className="text-xs text-stone-500">Prot.</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-amber-600">
                                            {Math.round(analysisResult.totalNutrition.carbs)}g
                                        </p>
                                        <p className="text-xs text-stone-500">Gluc.</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-rose-600">
                                            {Math.round(analysisResult.totalNutrition.fats)}g
                                        </p>
                                        <p className="text-xs text-stone-500">Lip.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detected foods list */}
                        <div className="space-y-2">
                            {analysisResult.foods.map((food, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl border border-stone-200 overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedFood(expandedFood === index ? null : index)}
                                        className="w-full p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-stone-800">{food.name}</p>
                                                <p className="text-sm text-stone-500">
                                                    {Math.round(food.nutrition.calories)} kcal • {food.estimatedWeight}g
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                food.confidence >= 0.8
                                                    ? 'bg-green-100 text-green-700'
                                                    : food.confidence >= 0.6
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {Math.round(food.confidence * 100)}%
                                            </span>
                                            {expandedFood === index ? (
                                                <ChevronUp className="w-4 h-4 text-stone-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-stone-400" />
                                            )}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedFood === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-stone-100"
                                            >
                                                <div className="p-4 space-y-3">
                                                    {food.description && (
                                                        <p className="text-sm text-stone-600">{food.description}</p>
                                                    )}

                                                    {food.ingredients.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-stone-500 mb-1">Ingrédients détectés:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {food.ingredients.map((ing, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="text-xs px-2 py-0.5 bg-stone-100 rounded-full text-stone-600"
                                                                    >
                                                                        {ing}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-4 gap-2 pt-2">
                                                        <div className="text-center p-2 bg-stone-50 rounded-lg">
                                                            <p className="text-sm font-semibold text-stone-700">
                                                                {Math.round(food.nutrition.proteins)}g
                                                            </p>
                                                            <p className="text-xs text-stone-500">Protéines</p>
                                                        </div>
                                                        <div className="text-center p-2 bg-stone-50 rounded-lg">
                                                            <p className="text-sm font-semibold text-stone-700">
                                                                {Math.round(food.nutrition.carbs)}g
                                                            </p>
                                                            <p className="text-xs text-stone-500">Glucides</p>
                                                        </div>
                                                        <div className="text-center p-2 bg-stone-50 rounded-lg">
                                                            <p className="text-sm font-semibold text-stone-700">
                                                                {Math.round(food.nutrition.fats)}g
                                                            </p>
                                                            <p className="text-xs text-stone-500">Lipides</p>
                                                        </div>
                                                        <div className="text-center p-2 bg-stone-50 rounded-lg">
                                                            <p className="text-sm font-semibold text-stone-700">
                                                                {Math.round(food.nutrition.fiber || 0)}g
                                                            </p>
                                                            <p className="text-xs text-stone-500">Fibres</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={reset}
                                className="flex-1 py-3 px-4 bg-stone-100 rounded-xl font-medium text-stone-700"
                            >
                                Annuler
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={addToMeal}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter au repas
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Error State */}
                {state === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="py-8 text-center"
                    >
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-stone-800">Erreur d'analyse</h3>
                        <p className="text-sm text-stone-500 mt-1 mb-6">
                            {error || "Une erreur s'est produite"}
                        </p>

                        <div className="flex gap-3 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={reset}
                                className="py-2 px-4 bg-stone-100 rounded-lg font-medium text-stone-700"
                            >
                                Annuler
                            </motion.button>

                            {capturedImage && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={retry}
                                    className="py-2 px-4 bg-purple-500 rounded-lg font-medium text-white flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Réessayer
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
