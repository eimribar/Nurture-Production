import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nurtureai.app.dev',
  appName: 'NurtureAI Dev',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allow localhost API access
    // Uncomment below to use local dev server on device
    // url: 'http://localhost:3000',
    // androidScheme: 'http',
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
    allowMixedContent: true, // Required for localhost API calls
    captureInput: true,
  },
};

export default config;
