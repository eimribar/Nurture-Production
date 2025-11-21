import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../../shared/App';
import '../../shared/styles.css';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Configure Status Bar for mobile
async function setupStatusBar() {
  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#6366f1' });
  } catch (error) {
    console.log('Status bar not available:', error);
  }
}

// Hide splash screen when app is ready
async function hideSplashScreen() {
  try {
    await SplashScreen.hide();
  } catch (error) {
    console.log('Splash screen not available:', error);
  }
}

// Initialize Capacitor features
setupStatusBar();

// Listen for app state changes
CapacitorApp.addListener('appStateChange', ({ isActive }) => {
  console.log('App state changed. Is active:', isActive);
});

// Listen for back button on Android
CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    CapacitorApp.exitApp();
  } else {
    window.history.back();
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hide splash screen after render
hideSplashScreen();
