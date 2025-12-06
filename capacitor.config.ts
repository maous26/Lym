import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lym.app',
  appName: 'Lym',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Production Railway URL
    url: 'https://lym-production.up.railway.app',
    allowNavigation: ['https://lym-production.up.railway.app', '*.google.com', '*.googleapis.com', '*.gstatic.com', 'accounts.google.com'],
    iosScheme: 'https',
  },
  plugins: {
    Browser: {
      windowName: '_blank',
      toolbarColor: '#ffffff',
      presentationStyle: 'fullscreen',
    },
  },
};

export default config;
