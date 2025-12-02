import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lym.app',
  appName: 'Lym',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Pour le dev local - l'app iOS rechargera depuis votre serveur Next.js
    url: 'http://localhost:3002',
    allowNavigation: ['http://localhost:3002', '*.google.com', '*.googleapis.com']
  }
};

export default config;
