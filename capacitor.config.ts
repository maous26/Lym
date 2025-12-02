import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lym.app',
  appName: 'Lym',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Pour le dev local - l'app iOS rechargera depuis votre serveur Next.js
    // Utilisez l'IP réseau au lieu de localhost pour que le simulateur iOS puisse se connecter
    url: 'http://192.168.1.22:3002',
    allowNavigation: ['http://192.168.1.22:3002', 'http://localhost:3002', '*.google.com', '*.googleapis.com']
  }
};

export default config;
