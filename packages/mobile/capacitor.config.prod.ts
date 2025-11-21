import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nurtureai.app',
  appName: 'NurtureAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366f1',
      showSpinner: false,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#6366f1',
    },
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false, // Production must use HTTPS only
    captureInput: true,
  },
};

export default config;
