'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { DataSyncProvider } from './DataSyncProvider';
import { ToastProvider } from '@/components/ui/Toast';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <DataSyncProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </DataSyncProvider>
    </AuthProvider>
  );
}

export default Providers;
