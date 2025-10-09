import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ronaq.app',
  appName: 'رونق',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;