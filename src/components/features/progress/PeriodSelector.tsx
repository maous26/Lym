'use client';

import { motion } from 'framer-motion';

export type Period = 'day' | 'week' | 'month';

interface PeriodSelectorProps {
    selected: Period;
    onChange: (period: Period) => void;
}

const periods: { value: Period; label: string }[] = [
    { value: 'day', label: 'Jour' },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },
];

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
    return (
        <div className="flex bg-stone-100 rounded-xl p-1 gap-1">
            {periods.map((period) => (
                <button
                    key={period.value}
                    onClick={() => onChange(period.value)}
                    className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors ${
                        selected === period.value
                            ? 'text-white'
                            : 'text-stone-600 hover:text-stone-900'
                    }`}
                >
                    {selected === period.value && (
                        <motion.div
                            layoutId="period-selector-bg"
                            className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg"
                            transition={{ type: 'spring', duration: 0.3 }}
                        />
                    )}
                    <span className="relative z-10">{period.label}</span>
                </button>
            ))}
        </div>
    );
}
