'use client';

import { useState } from 'react';
import { markNotificationRead } from '@/app/actions/family-coach';
import { Bell, AlertTriangle, Lightbulb, Trophy, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FamilyNotification } from '@/types/family';

interface FamilyNotificationsProps {
    notifications: FamilyNotification[];
    onNotificationRead?: () => void;
}

export function FamilyNotifications({ notifications, onNotificationRead }: FamilyNotificationsProps) {
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    const handleDismiss = async (notificationId: string) => {
        setDismissed(new Set([...dismissed, notificationId]));
        
        await markNotificationRead(notificationId);
        onNotificationRead?.();
    };

    const activeNotifications = notifications.filter(n => !dismissed.has(n.id));

    if (activeNotifications.length === 0) {
        return null;
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'alert': return AlertTriangle;
            case 'tip': return Lightbulb;
            case 'achievement': return Trophy;
            case 'reminder': return Clock;
            default: return Bell;
        }
    };

    const getNotificationStyle = (priority: string, type: string) => {
        if (priority === 'urgent' || priority === 'high') {
            return {
                bg: 'bg-red-50',
                border: 'border-red-200',
                icon: 'text-red-500',
                text: 'text-red-900',
            };
        }
        if (type === 'achievement') {
            return {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                icon: 'text-yellow-500',
                text: 'text-yellow-900',
            };
        }
        if (type === 'tip') {
            return {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                icon: 'text-blue-500',
                text: 'text-blue-900',
            };
        }
        return {
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            icon: 'text-gray-500',
            text: 'text-gray-900',
        };
    };

    return (
        <div className="space-y-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Bell size={18} className="text-purple-500" />
                Notifications Coach
            </h3>

            <AnimatePresence mode="popLayout">
                {activeNotifications.map((notification, index) => {
                    const Icon = getNotificationIcon(notification.type);
                    const style = getNotificationStyle(notification.priority, notification.type);

                    return (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "rounded-2xl p-4 border-2 relative",
                                style.bg,
                                style.border
                            )}
                        >
                            {/* Bouton fermer */}
                            <button
                                onClick={() => handleDismiss(notification.id)}
                                className="absolute top-3 right-3 p-1 hover:bg-white/50 rounded-full transition-all"
                            >
                                <X size={16} className="text-gray-400" />
                            </button>

                            <div className="flex items-start gap-3 pr-6">
                                {/* Icon */}
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                    style.bg === 'bg-red-50' ? 'bg-red-100' :
                                    style.bg === 'bg-yellow-50' ? 'bg-yellow-100' :
                                    style.bg === 'bg-blue-50' ? 'bg-blue-100' : 'bg-gray-100'
                                )}>
                                    {notification.icon ? (
                                        <span className="text-xl">{notification.icon}</span>
                                    ) : (
                                        <Icon size={20} className={style.icon} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className={cn("font-bold text-sm mb-1", style.text)}>
                                        {notification.title}
                                    </h4>
                                    <p className={cn("text-sm", style.text, "opacity-80")}>
                                        {notification.message}
                                    </p>

                                    {/* Action si disponible */}
                                    {notification.actionUrl && notification.actionLabel && (
                                        <button
                                            onClick={() => window.location.href = notification.actionUrl!}
                                            className={cn(
                                                "mt-3 text-xs font-medium inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all",
                                                style.bg === 'bg-red-50' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                                style.bg === 'bg-yellow-50' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                                                'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                            )}
                                        >
                                            {notification.actionLabel}
                                            <span>→</span>
                                        </button>
                                    )}

                                    {/* Timestamp */}
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

