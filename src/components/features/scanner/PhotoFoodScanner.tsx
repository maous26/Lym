'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Upload,
    X,
    Check,
    AlertCircle,
    RefreshCw,
    Plus,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Image as ImageIcon,
    Flame,
    Beef,
    Wheat,
    Droplets
} from 'lucide-react';
import { analyzeFoodPhoto, type AnalyzedFood, type FoodAnalysisResult } from '@/app/actions/food-scanner';
import type { NutritionInfo } from '@/types/meal';

// Animated circular progress component
function CircularProgress({
    value,
    max,
    color,
    size = 80,
    strokeWidth = 8,
    delay = 0
}: {
    value: number;
    max: number;
    color: string;
    size?: number;
    strokeWidth?: number;
    delay?: number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min((value / max) * 100, 100);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-stone-100"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, delay, ease: "easeOut" }}
                />
            </svg>
        </div>
    );
}

// Animated number counter
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
        >
            {Math.round(value)}
        </motion.span>
    );
}

// Nutrition card with icon and progress
function NutritionCard({
    icon: Icon,
    label,
    value,
    unit,
    color,
    bgColor,
    max,
    delay
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    unit: string;
    color: string;
    bgColor: string;
    max: number;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            className="relative"
        >
            <div className={`${bgColor} rounded-2xl p-3 relative overflow-hidden`}>
                {/* Decorative background */}
                <motion.div
                    className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20"
                    style={{ backgroundColor: color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: delay + 0.2 }}
                />

                <div className="relative z-10 flex flex-col items-center">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                        style={{ backgroundColor: `${color}20` }}
                    >
                        <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <motion.p
                        className="text-xl font-bold"
                        style={{ color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay + 0.3 }}
                    >
                        <AnimatedNumber value={value} delay={delay + 0.2} />{unit}
                    </motion.p>
                    <p className="text-xs text-stone-500 font-medium">{label}</p>

                    {/* Mini progress bar */}
                    <div className="w-full h-1.5 bg-white/50 rounded-full mt-2 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                            transition={{ duration: 1, delay: delay + 0.4 }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

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

    // Callback ref to attach stream when video element mounts
    const setVideoRef = useCallback((video: HTMLVideoElement | null) => {
        if (video && cameraStream) {
            video.srcObject = cameraStream;
            video.muted = true;
            video.playsInline = true;

            video.onloadedmetadata = () => {
                video.play().catch(err => {
                    console.log('Video play error:', err);
                });
            };
        }
        // Also keep the regular ref updated
        (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = video;
    }, [cameraStream]);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            let stream: MediaStream | null = null;

            try {
                // Try environment camera (back camera) first
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false
                });
            } catch {
                // Fallback to any camera
                console.log('Environment camera not available, trying default');
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
            }

            setCameraStream(stream);
            setState('camera');

        } catch (err) {
            console.error('Camera access denied:', err);
            setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
            setState('error');
        }
    }, []);

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
                                ref={setVideoRef}
                                autoPlay
                                playsInline
                                muted
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

                {/* Results State - Enhanced Widget */}
                {state === 'results' && analysisResult?.foods && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-5"
                    >
                        {/* Success Banner with Animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-lg"
                        >
                            {/* Animated background particles */}
                            <motion.div
                                className="absolute top-2 right-8 w-20 h-20 bg-white/10 rounded-full blur-xl"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute bottom-0 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"
                                animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            />

                            <div className="relative z-10 flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
                                    className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center"
                                >
                                    <Check className="w-7 h-7" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="font-bold text-lg"
                                    >
                                        Analyse terminée !
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-white/80 text-sm"
                                    >
                                        {analysisResult.foods.length} aliment{analysisResult.foods.length > 1 ? 's' : ''} détecté{analysisResult.foods.length > 1 ? 's' : ''}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Calories Display with Circular Progress */}
                        {analysisResult.totalNutrition && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl p-5 shadow-lg border border-stone-100"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-stone-600 uppercase tracking-wide">
                                        Valeurs nutritionnelles
                                    </h4>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                        className="px-3 py-1 bg-purple-100 rounded-full"
                                    >
                                        <span className="text-xs font-medium text-purple-700">Estimation IA</span>
                                    </motion.div>
                                </div>

                                {/* Calories Hero Section */}
                                <div className="flex items-center justify-center mb-6">
                                    <div className="relative">
                                        <CircularProgress
                                            value={analysisResult.totalNutrition.calories}
                                            max={800}
                                            color="#8B5CF6"
                                            size={140}
                                            strokeWidth={12}
                                            delay={0.4}
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.6, type: "spring" }}
                                                className="text-center"
                                            >
                                                <Flame className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                                <p className="text-3xl font-bold text-stone-800">
                                                    <AnimatedNumber value={analysisResult.totalNutrition.calories} delay={0.5} />
                                                </p>
                                                <p className="text-xs text-stone-500 font-medium">kcal</p>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>

                                {/* Macros Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <NutritionCard
                                        icon={Beef}
                                        label="Protéines"
                                        value={analysisResult.totalNutrition.proteins}
                                        unit="g"
                                        color="#3B82F6"
                                        bgColor="bg-blue-50"
                                        max={50}
                                        delay={0.5}
                                    />
                                    <NutritionCard
                                        icon={Wheat}
                                        label="Glucides"
                                        value={analysisResult.totalNutrition.carbs}
                                        unit="g"
                                        color="#F59E0B"
                                        bgColor="bg-amber-50"
                                        max={100}
                                        delay={0.6}
                                    />
                                    <NutritionCard
                                        icon={Droplets}
                                        label="Lipides"
                                        value={analysisResult.totalNutrition.fats}
                                        unit="g"
                                        color="#EF4444"
                                        bgColor="bg-red-50"
                                        max={40}
                                        delay={0.7}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Detected Foods List - Compact Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-2"
                        >
                            <h4 className="text-sm font-semibold text-stone-600 uppercase tracking-wide px-1">
                                Aliments détectés
                            </h4>
                            {analysisResult.foods.map((food, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedFood(expandedFood === index ? null : index)}
                                        className="w-full p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                whileHover={{ rotate: 5, scale: 1.05 }}
                                                className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center"
                                            >
                                                <ImageIcon className="w-6 h-6 text-purple-600" />
                                            </motion.div>
                                            <div className="text-left">
                                                <p className="font-semibold text-stone-800">{food.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-sm text-purple-600 font-medium">
                                                        {Math.round(food.nutrition.calories)} kcal
                                                    </span>
                                                    <span className="text-stone-300">•</span>
                                                    <span className="text-sm text-stone-500">{food.estimatedWeight}g</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.8 + index * 0.1 }}
                                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                    food.confidence >= 0.8
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : food.confidence >= 0.6
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {Math.round(food.confidence * 100)}%
                                            </motion.span>
                                            <motion.div
                                                animate={{ rotate: expandedFood === index ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="w-5 h-5 text-stone-400" />
                                            </motion.div>
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedFood === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-t border-stone-100 bg-stone-50/50"
                                            >
                                                <div className="p-4 space-y-3">
                                                    {food.description && (
                                                        <p className="text-sm text-stone-600 italic">{food.description}</p>
                                                    )}

                                                    {food.ingredients.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-stone-500 mb-2">Ingrédients détectés</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {food.ingredients.map((ing, i) => (
                                                                    <motion.span
                                                                        key={i}
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ delay: i * 0.05 }}
                                                                        className="text-xs px-2.5 py-1 bg-white border border-stone-200 rounded-full text-stone-600"
                                                                    >
                                                                        {ing}
                                                                    </motion.span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Detailed nutrition bars */}
                                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                                        {[
                                                            { label: 'Protéines', value: food.nutrition.proteins, color: '#3B82F6', max: 30 },
                                                            { label: 'Glucides', value: food.nutrition.carbs, color: '#F59E0B', max: 50 },
                                                            { label: 'Lipides', value: food.nutrition.fats, color: '#EF4444', max: 25 },
                                                            { label: 'Fibres', value: food.nutrition.fiber || 0, color: '#10B981', max: 10 },
                                                        ].map((item, i) => (
                                                            <div key={i} className="bg-white rounded-lg p-2">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-xs text-stone-500">{item.label}</span>
                                                                    <span className="text-xs font-semibold" style={{ color: item.color }}>
                                                                        {Math.round(item.value)}g
                                                                    </span>
                                                                </div>
                                                                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                                                                        transition={{ duration: 0.8, delay: 0.1 * i }}
                                                                        className="h-full rounded-full"
                                                                        style={{ backgroundColor: item.color }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="flex gap-3 pt-2"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={reset}
                                className="flex-1 py-3.5 px-4 bg-stone-100 rounded-2xl font-semibold text-stone-600 border border-stone-200"
                            >
                                Annuler
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(139, 92, 246, 0.5)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={addToMeal}
                                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
                                Ajouter
                            </motion.button>
                        </motion.div>
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
