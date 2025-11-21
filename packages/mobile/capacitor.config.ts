import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nurtureai.app',
  appName: 'NurtureAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For development, uncomment to allow localhost API access
    // cleartext: true,
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
    allowMixedContent: true,
    captureInput: true,
  },
};

export default config;
