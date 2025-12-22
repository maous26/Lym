'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/user-store';
import { useMealStore } from '@/store/meal-store';

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const hasSynced = useRef(false);
    const { setUserId, setAuthenticated, syncFromDatabase: syncProfile, isHydrated } = useUserStore();
    const { syncFromDatabase: syncMeals } = useMealStore();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id && isHydrated && !hasSynced.current) {
            hasSynced.current = true;
            setAuthenticated(true);
            setUserId(session.user.id);

            // Sync all data from database
            console.log('[DataSync] Starting full sync from database...');

            Promise.all([syncProfile(), syncMeals()])
                .then(() => {
                    console.log('[DataSync] Full sync completed successfully');
                })
                .catch((error) => {
                    console.error('[DataSync] Sync failed:', error);
                });
        } else if (status === 'unauthenticated') {
            hasSynced.current = false;
            setAuthenticated(false);
            setUserId(null);
        }
    }, [session, status, setAuthenticated, setUserId, syncProfile, syncMeals, isHydrated]);

    return <>{children}</>;
}
