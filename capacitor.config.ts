import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lym.app',
  appName: 'Lym',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Décommentez la ligne suivante et remplacez par votre IP locale pour le test sur appareil
    // url: 'http://192.168.1.XX:3000', 
  }
};

export default config;
