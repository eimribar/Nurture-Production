# NurtureAI - Baby Cry Analyzer

AI-powered baby cry analysis mobile and desktop application built with React, Capacitor, and Google Gemini AI.

## 🎯 Project Status

This project has been restructured as a **monorepo** to support multiple platforms:
- **Mobile** (iOS & Android) via Capacitor
- **Desktop** (macOS & Windows) via Capacitor Electron
- **Web** (Progressive Web App)
- **Backend API** for secure API key management

## 📁 Project Structure

```
nurture/
├── packages/
│   ├── shared/          # Shared React components & services
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   ├── config/      # Environment configuration
│   │   └── styles.css   # Global Tailwind CSS
│   │
│   ├── mobile/          # Capacitor mobile app (iOS/Android)
│   │   ├── src/         # Mobile-specific code
│   │   ├── capacitor.config.ts
│   │   └── ios/         # (generated after cap sync)
│   │   └── android/     # (generated after cap sync)
│   │
│   ├── desktop/         # Capacitor Electron desktop app
│   │   ├── src/         # Desktop-specific code
│   │   └── electron/    # (generated after cap sync)
│   │
│   └── backend/         # Express.js API server
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── controllers/ # Request handlers
│       │   ├── middleware/  # Express middleware
│       │   └── index.ts     # Server entry point
│       └── .env.example
│
├── .env.example         # Root environment variables
├── package.json         # Workspace configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

**For iOS development:**
- macOS with Xcode 14+
- Apple Developer account ($99/year for App Store)
- CocoaPods: `sudo gem install cocoapods`

**For Android development:**
- Android Studio
- Java Development Kit (JDK) 17+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/eimribar/nurture.git
   cd nurture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   **Backend API:**
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   ```
   Edit `packages/backend/.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **Frontend (optional for development):**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

## 🏃 Running the App

### Development Mode

**Option 1: Run everything (recommended)**
```bash
# Terminal 1: Backend API
npm run dev:backend

# Terminal 2: Mobile web dev server
npm run dev:mobile

# Terminal 3: Shared package (if making changes)
npm run dev:shared
```

**Option 2: Backend + Mobile only**
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:mobile
```

Then open http://localhost:3000

### Mobile App Development

#### iOS (requires macOS)

1. **Build the web app**
   ```bash
   npm run build:mobile
   ```

2. **Sync with iOS project**
   ```bash
   cd packages/mobile
   npx cap sync ios
   ```

3. **Open in Xcode**
   ```bash
   npx cap open ios
   ```

4. **Run from Xcode**
   - Select your target device/simulator
   - Click the ▶️ Play button

#### Android

1. **Build the web app**
   ```bash
   npm run build:mobile
   ```

2. **Sync with Android project**
   ```bash
   cd packages/mobile
   npx cap sync android
   ```

3. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

4. **Run from Android Studio**
   - Select your target device/emulator
   - Click the ▶️ Play button

### Desktop App Development

**Coming soon** - Capacitor Electron integration

## 📦 Building for Production

### Backend API
```bash
npm run build:backend
cd packages/backend
npm start
```

### Mobile Apps

#### iOS App Store Build
```bash
npm run build:mobile
cd packages/mobile
npx cap sync ios
npx cap open ios
# In Xcode: Product → Archive
```

#### Android Play Store Build
```bash
npm run build:mobile
cd packages/mobile
npx cap sync android
cd android
./gradlew bundleRelease
# Find AAB in: android/app/build/outputs/bundle/release/
```

## 🔧 Available Scripts

### Root Level
- `npm run dev:shared` - Run shared package dev server
- `npm run dev:mobile` - Run mobile package dev server
- `npm run dev:desktop` - Run desktop package dev server
- `npm run dev:backend` - Run backend API server
- `npm run build:all` - Build all packages
- `npm run clean` - Remove all node_modules and build artifacts

### Mobile Package
- `npm run cap:sync` - Sync web assets to native projects
- `npm run cap:sync:ios` - Sync to iOS only
- `npm run cap:sync:android` - Sync to Android only
- `npm run cap:open:ios` - Open iOS project in Xcode
- `npm run cap:open:android` - Open Android project in Android Studio
- `npm run cap:run:ios` - Build and run on iOS device/simulator
- `npm run cap:run:android` - Build and run on Android device/emulator

## 🎨 Features

- ✅ **Video Cry Analysis** - AI-powered analysis of baby's crying patterns
- ✅ **Chat Assistant** - Text-based parenting Q&A with Google Search grounding
- ✅ **Voice Assistant** - Real-time voice conversation with AI (Live API)
- ✅ **Quick Tips** - Instant soothing suggestions
- ✅ **Data Visualization** - Pie charts showing cry analysis breakdown
- ✅ **Text-to-Speech** - Audio playback of soothing advice
- 🚧 **User Authentication** - Coming in Phase 2
- 🚧 **Analysis History** - Coming in Phase 2
- 🚧 **Offline Mode** - Coming in Phase 2
- 🚧 **Push Notifications** - Coming in Phase 2

## 🛠 Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Mobile/Desktop
- **Capacitor 6** - Native app wrapper
- **Capacitor Plugins**:
  - Camera
  - Filesystem
  - Network
  - Status Bar
  - Splash Screen
  - Haptics
  - Share
  - App

### Backend
- **Node.js + Express** - REST API
- **Google Gemini AI** - AI models
  - `gemini-2.5-flash` - Video analysis & chat
  - Google Search grounding for chat
- **JWT** - Authentication (planned)
- **PostgreSQL + Prisma** - Database (planned)

## 🔐 Security

- API keys are **server-side only** in the backend package
- CORS configured for specific origins
- Rate limiting on API endpoints
- Request validation with Zod schemas
- Helmet.js for security headers

## 📱 App Store Requirements

### iOS App Store
- [ ] Apple Developer account ($99/year)
- [ ] Bundle ID configured: `com.nurtureai.app`
- [ ] App icons (1024x1024 and all sizes)
- [ ] Screenshots for required device sizes
- [ ] Privacy policy URL
- [ ] App Store description and keywords
- [ ] App review information

### Google Play Store
- [ ] Google Play Console account ($25 one-time)
- [ ] Application ID: `com.nurtureai.app`
- [ ] App icons and feature graphic
- [ ] Screenshots for phone and tablet
- [ ] Privacy policy URL
- [ ] Store listing description
- [ ] Content rating questionnaire
- [ ] Signed AAB bundle

## 🐛 Troubleshooting

### "Module not found: @nurtureai/shared"
```bash
npm install
```

### iOS build fails
```bash
cd packages/mobile/ios
pod install
```

### Android Gradle sync fails
```bash
cd packages/mobile/android
./gradlew clean
./gradlew build
```

### Backend API connection refused
Make sure backend is running on port 3001:
```bash
npm run dev:backend
```

## 📄 License

Private - Not for distribution

## 👤 Author

**Your Name**
- GitHub: [@eimribar](https://github.com/eimribar)

## 🗺 Roadmap

### Current Phase: ✅ Phase 1 - Foundation Complete

- [x] Monorepo structure
- [x] Backend API server
- [x] Capacitor mobile setup
- [x] Shared component library
- [x] Environment configuration

### Next Phase: Phase 2 - Backend Development

- [ ] User authentication
- [ ] Database setup
- [ ] File storage
- [ ] Analysis history
- [ ] API rate limiting per user

---

**Original AI Studio App**: https://ai.studio/apps/drive/14kQdYONHkuB3Rd57xFYVbT5gbJb0L0FX

**Built with ❤️ for parents everywhere**
