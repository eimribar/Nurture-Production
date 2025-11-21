# NurtureAI Deployment Guide

Complete guide for deploying NurtureAI to production, including backend (Vercel), database (Supabase), and mobile apps (iOS & Android).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Supabase)](#database-setup-supabase)
3. [Backend Deployment (Vercel)](#backend-deployment-vercel)
4. [Mobile App Build & Deployment](#mobile-app-build--deployment)
5. [Environment Management](#environment-management)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **Xcode**: Latest version (for iOS builds)
- **Android Studio**: Latest version (for Android builds)
- **Vercel CLI**: `npm install -g vercel`
- **Java JDK**: For Android keystore generation

### Required Accounts

- [Vercel Account](https://vercel.com) (free tier works)
- [Supabase Account](https://supabase.com) (already set up: uytqxlbymowzaagmvznl)
- [Apple Developer Account](https://developer.apple.com) ($99/year for App Store)
- [Google Play Developer Account](https://play.google.com/console) ($25 one-time fee)

### API Keys

- **Gemini API Key**: Already configured in backend `.env.development`
- **Supabase Keys**: Already configured

---

## Database Setup (Supabase)

### Initial Setup (Already Completed)

Your Supabase project is already configured:
- **Project ID**: `uytqxlbymowzaagmvznl`
- **URL**: `https://uytqxlbymowzaagmvznl.supabase.co`
- **Credentials**: Stored in `packages/backend/.env.development`

### Run Database Migration

1. Navigate to Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/uytqxlbymowzaagmvznl/sql
   ```

2. Run the migration script:
   ```bash
   # Copy contents from:
   cat packages/backend/src/db/migrations/001_initial_schema.sql
   ```

3. Paste into SQL Editor and click "Run"

4. Verify tables were created:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

   Should return: `users`, `analyses`, `chat_history`

### Enable Row Level Security (RLS)

For production, enable RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own chat history" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Note**: Backend currently uses `SUPABASE_SERVICE_KEY` which bypasses RLS. For production, consider using anon key with JWT-based auth.

---

## Backend Deployment (Vercel)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Build Backend

```bash
cd packages/backend
npm run build
```

Verify `dist/index.js` was created.

### Step 3: Configure Environment Variables

Create production environment file:

```bash
cp .env.development .env.production
```

Edit `packages/backend/.env.production`:

```env
NODE_ENV=production
PORT=3001

# Gemini API Key
GEMINI_API_KEY=AIzaSyCEW7GJIQrmc_IVw48p5aRFuKLQr6hRYZE

# JWT Configuration
JWT_SECRET=RTh7KPcFJwKx0sFnCwEfLtjadry20nWU+1/YfKYzk+w=
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Supabase Configuration
SUPABASE_URL=https://uytqxlbymowzaagmvznl.supabase.co
SUPABASE_SERVICE_KEY=[your-supabase-service-key]

# CORS Configuration (add your production domain)
ALLOWED_ORIGINS=https://nurtureai.app,capacitor://localhost,ionic://localhost

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_VIDEO_SIZE_MB=50
```

### Step 4: Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (first time)
cd packages/backend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Select your account]
# - Link to existing project? No
# - Project name? nurtureai-backend
# - Directory? ./
# - Override settings? No
```

### Step 5: Add Environment Variables to Vercel

```bash
# Add all environment variables
vercel env add GEMINI_API_KEY
vercel env add JWT_SECRET
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add ALLOWED_ORIGINS
```

Or add via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable from `.env.production`

### Step 6: Deploy Production

```bash
vercel --prod
```

You'll get a production URL like: `https://nurtureai-backend.vercel.app`

### Step 7: Set Up Custom Domain (Optional)

1. Go to Vercel Dashboard → Domains
2. Add your custom domain (e.g., `api.nurtureai.app`)
3. Update DNS settings as instructed
4. Update `ALLOWED_ORIGINS` to include your production domain

---

## Mobile App Build & Deployment

### Step 1: Update Mobile Environment

Edit `packages/mobile/.env.production`:

```env
# Production Environment Configuration
VITE_API_URL=https://nurtureai-backend.vercel.app/api
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true

# ⚠️ SECURITY: DO NOT ADD API KEYS HERE
```

### Step 2: Build for Production

```bash
cd packages/mobile

# Build production bundle
npm run build:prod

# Sync with Capacitor (production config)
npm run cap:sync:prod
```

---

## iOS Deployment

### Step 1: Open Xcode

```bash
npm run cap:open:ios
```

### Step 2: Configure Signing

1. In Xcode, select the project in Navigator
2. Select target "App"
3. Go to "Signing & Capabilities"
4. Select your Team
5. Ensure Bundle Identifier is `com.nurtureai.app`
6. Enable "Automatically manage signing"

### Step 3: Update Version & Build Number

1. In Xcode, select the project
2. Under "General" tab:
   - **Version**: `1.0.0` (user-facing)
   - **Build**: `1` (increment for each submission)

### Step 4: Create Archive

1. In Xcode menu: **Product** → **Archive**
2. Wait for archive to complete
3. Organizer window will open

### Step 5: Validate & Distribute

1. Select the archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Follow prompts to upload

For detailed submission steps, see [APP_STORE_SUBMISSION.md](./APP_STORE_SUBMISSION.md)

---

## Android Deployment

### Step 1: Generate Keystore

Follow [KEYSTORE_SETUP.md](./packages/mobile/android/KEYSTORE_SETUP.md) to create your release keystore.

### Step 2: Configure Keystore Properties

Create `packages/mobile/android/keystore.properties`:

```properties
storeFile=/path/to/your/nurtureai-release.keystore
storePassword=your-keystore-password
keyAlias=nurtureai
keyPassword=your-key-password
```

**⚠️ Never commit this file! Already in .gitignore**

### Step 3: Build Release APK/AAB

```bash
cd packages/mobile/android

# Build release AAB (for Play Store)
./gradlew bundleRelease

# Output: app/build/outputs/bundle/release/app-release.aab
```

### Step 4: Test Release Build

```bash
# Build release APK (for testing)
./gradlew assembleRelease

# Output: app/build/outputs/apk/release/app-release.apk

# Install on device
adb install app/build/outputs/apk/release/app-release.apk
```

### Step 5: Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (or create new app)
3. Go to **Production** → **Create new release**
4. Upload `app-release.aab`
5. Fill in release notes
6. Submit for review

For detailed submission steps, see [APP_STORE_SUBMISSION.md](./APP_STORE_SUBMISSION.md)

---

## Environment Management

### Development

```bash
# Backend
cd packages/backend
npm run dev  # Uses .env.development

# Mobile
cd packages/mobile
npm run dev  # Uses .env.development
npm run ios:dev  # Opens iOS with dev config
npm run android:dev  # Opens Android with dev config
```

### Staging

```bash
# Backend (deploy to Vercel staging)
cd packages/backend
vercel  # Deploy to staging URL

# Mobile
cd packages/mobile
npm run build:staging
npm run ios:staging  # Opens iOS with staging config
npm run android:staging  # Opens Android with staging config
```

### Production

```bash
# Backend
cd packages/backend
vercel --prod

# Mobile
cd packages/mobile
npm run build:prod
npm run ios:prod  # Opens iOS with production config
npm run android:prod  # Opens Android with production config
```

---

## Testing

### Local Testing

```bash
# Start backend locally
cd packages/backend
npm run dev

# Start mobile app
cd packages/mobile
npm run dev

# Open in browser: http://localhost:5173
```

### Test with Production Backend

```bash
# Update mobile .env temporarily
VITE_API_URL=https://nurtureai-backend.vercel.app/api

# Start mobile app
npm run dev
```

### Test Release Builds

```bash
# iOS: Use TestFlight
# 1. Upload build to App Store Connect
# 2. Add to TestFlight
# 3. Invite testers

# Android: Use Internal Testing
# 1. Upload AAB to Play Console
# 2. Create Internal Testing release
# 3. Add testers via email
```

---

## Troubleshooting

### Backend Issues

**Error: "Supabase connection failed"**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in Vercel environment variables
- Check Supabase project is active

**Error: "CORS error"**
- Add your domain to `ALLOWED_ORIGINS`
- Redeploy with `vercel --prod`

**Error: "JWT verification failed"**
- Ensure `JWT_SECRET` matches between environments
- Check token expiration settings

### Mobile Build Issues

**iOS: "Provisioning profile error"**
- Ensure you're signed in to Xcode with your Apple ID
- Enable "Automatically manage signing"
- Verify Bundle Identifier matches

**Android: "Keystore not found"**
- Check `keystore.properties` file exists
- Verify paths are absolute
- Ensure keystore file is in the correct location

**iOS: "App Icon missing"**
- Add app icons to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Use sizes: 1024x1024, 180x180, 120x120, 87x87, 80x80, 76x76, 60x60, 58x58, 40x40, 29x29

**Android: "App Icon missing"**
- Add icons to `android/app/src/main/res/mipmap-*/`
- Use Android Asset Studio: https://romannurik.github.io/AndroidAssetStudio/

### Database Issues

**Error: "Row Level Security blocking access"**
- Backend uses service key which bypasses RLS
- If using anon key, implement JWT auth with Supabase

**Error: "Table does not exist"**
- Run migration script from `packages/backend/src/db/migrations/001_initial_schema.sql`
- Check you're connected to correct Supabase project

---

## Security Checklist

Before deploying to production:

- [ ] All API keys stored in environment variables (not in code)
- [ ] `JWT_SECRET` is strong and unique per environment
- [ ] CORS configured with specific domains (not `*`)
- [ ] HTTPS enabled for all production endpoints
- [ ] Rate limiting configured
- [ ] Supabase RLS policies enabled (if using anon key)
- [ ] Keystore file secured and backed up (Android)
- [ ] `.env` files added to `.gitignore`
- [ ] Privacy policy created and linked in apps
- [ ] App uses HTTPS-only in production (no mixed content)

---

## Maintenance

### Update Backend

```bash
cd packages/backend
# Make changes
npm run build
vercel --prod
```

### Update Mobile App

```bash
cd packages/mobile
# Make changes

# iOS: Increment build number in Xcode
# Android: Increment versionCode in build.gradle

npm run build:prod
npm run cap:sync:prod

# Then follow archive/build steps above
```

### Database Migrations

For schema changes:

1. Create new migration file: `002_add_feature.sql`
2. Test locally first
3. Run on production Supabase via SQL Editor
4. Update `supabaseClient.ts` types if needed
5. Deploy backend with `vercel --prod`

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Apple Developer**: https://developer.apple.com
- **Google Play Console**: https://play.google.com/console

For app store submission guidelines, see [APP_STORE_SUBMISSION.md](./APP_STORE_SUBMISSION.md)
