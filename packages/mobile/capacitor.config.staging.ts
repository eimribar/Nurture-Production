import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nurtureai.app.staging',
  appName: 'NurtureAI Staging',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f97316', // Orange for staging to differentiate
      showSpinner: false,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#f97316',
    },
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false, // Staging should use HTTPS only
    captureInput: true,
  },
};

export default config;
