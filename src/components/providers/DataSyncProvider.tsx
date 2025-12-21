'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useUserStore } from '@/store/user-store';
import { getUserProfile } from '@/app/actions/user';

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const { setUserId, setAuthenticated, setSoloProfile, activeMode } = useUserStore();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email) {
            setAuthenticated(true);
            // setUserId calls are handled in zustand but we can sync here

            // Fetch fresh profile from DB
            const fetchProfile = async () => {
                if (!session.user?.id) return;

                // Set ID first
                setUserId(session.user.id);

                const result = await getUserProfile(session.user.id);
                if (result.success && result.profile) {
                    setSoloProfile(result.profile);
                }
            };

            fetchProfile();
        } else if (status === 'unauthenticated') {
            setAuthenticated(false);
            setUserId(null);
        }
    }, [session, status, setAuthenticated, setUserId, setSoloProfile]);

    return <>{children}</>;
}
