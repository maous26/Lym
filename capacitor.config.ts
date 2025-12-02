import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lym.app',
  appName: 'Lym',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Pour iOS testing, on utilise l'IP locale
    url: 'http://192.168.1.22:3002',
    allowNavigation: ['http://192.168.1.22:3002', '*.google.com', '*.googleapis.com'],
    iosScheme: 'capacitor',
    hostname: '192.168.1.22'
  },
};

export default config;
