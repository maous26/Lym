'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useMealStore } from '@/store/meal-store';
import { useUserStore } from '@/store/user-store';

/**
 * Hook to sync data from database when user is authenticated
 * Call this hook in your main layout or app component
 */
export function useDataSync() {
    const { data: session, status } = useSession();
    const hasSynced = useRef(false);

    const syncMeals = useMealStore((state) => state.syncFromDatabase);
    const syncProfile = useUserStore((state) => state.syncFromDatabase);
    const setUserId = useUserStore((state) => state.setUserId);
    const isHydrated = useUserStore((state) => state.isHydrated);

    useEffect(() => {
        // Only sync when authenticated and hydrated
        if (status === 'authenticated' && session?.user?.id && isHydrated && !hasSynced.current) {
            hasSynced.current = true;

            // Set user ID in store
            setUserId(session.user.id);

            // Sync data from database
            console.log('[DataSync] Starting sync from database...');

            Promise.all([syncProfile(), syncMeals()])
                .then(() => {
                    console.log('[DataSync] Sync completed successfully');
                })
                .catch((error) => {
                    console.error('[DataSync] Sync failed:', error);
                });
        }

        // Reset sync flag when user logs out
        if (status === 'unauthenticated') {
            hasSynced.current = false;
        }
    }, [status, session?.user?.id, isHydrated, setUserId, syncProfile, syncMeals]);

    return {
        isSyncing: status === 'loading',
        isAuthenticated: status === 'authenticated',
    };
}
