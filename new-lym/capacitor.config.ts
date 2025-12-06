import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lym.app',
  appName: 'LYM',
  webDir: 'out',
  server: {
    // Pour le développement, utiliser le serveur local
    url: 'http://192.168.1.22:3001',
    cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
};

export default config;
