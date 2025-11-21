# App Store Submission Guide

Complete guide for submitting NurtureAI to both iOS App Store and Google Play Store.

## Table of Contents

1. [Pre-Submission Checklist](#pre-submission-checklist)
2. [iOS App Store Submission](#ios-app-store-submission)
3. [Google Play Store Submission](#google-play-store-submission)
4. [Required Assets](#required-assets)
5. [App Store Metadata](#app-store-metadata)
6. [Review Guidelines](#review-guidelines)
7. [Common Rejection Reasons](#common-rejection-reasons)

---

## Pre-Submission Checklist

Before submitting to either store, ensure:

### Technical Requirements
- [ ] App builds and runs without crashes
- [ ] All features work as expected
- [ ] Sign-in/sign-up flow works correctly
- [ ] Video recording and analysis works
- [ ] Chat assistant responds correctly
- [ ] Offline functionality handles network errors gracefully
- [ ] App performance is smooth (60 FPS)
- [ ] No memory leaks or crashes

### Legal Requirements
- [ ] Privacy Policy created and hosted (see [PRIVACY_POLICY.md](./PRIVACY_POLICY.md))
- [ ] Terms of Service created
- [ ] Medical disclaimer included in-app
- [ ] Age rating appropriate (likely 4+ with parental guidance)
- [ ] COPPA compliance (for users under 13)

### Content Requirements
- [ ] App icons created (all required sizes)
- [ ] Screenshots prepared (all required sizes)
- [ ] App description written
- [ ] Keywords selected
- [ ] Support URL created
- [ ] Marketing URL created (optional)

### Account Setup
- [ ] Apple Developer Account active ($99/year)
- [ ] Google Play Developer Account active ($25 one-time)
- [ ] Payment information configured
- [ ] Tax forms completed

---

## iOS App Store Submission

### Step 1: Prepare App in App Store Connect

1. **Create App**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click **My Apps** → **+ (plus icon)** → **New App**
   - Fill in details:
     - Platform: iOS
     - Name: NurtureAI
     - Primary Language: English
     - Bundle ID: com.nurtureai.app (must match Xcode)
     - SKU: nurtureai-001 (can be any unique identifier)

2. **Configure App Information**
   - Go to **App Information** section
   - **Category**: Medical or Health & Fitness
   - **Age Rating**: Complete questionnaire
     - Contains medical/treatment information: Yes
     - Target age: 17+
   - **Privacy Policy URL**: https://yourdomain.com/privacy (required)
   - **Support URL**: https://yourdomain.com/support (required)
   - **Marketing URL**: https://nurtureai.app (optional)

3. **Add App Description**

   **App Name**: NurtureAI - Baby Cry Analysis

   **Subtitle** (30 chars max): AI-Powered Baby Cry Translator

   **Description**:
   ```
   NurtureAI helps parents understand their baby's cries using advanced AI technology powered by Google's Gemini 2.5 Flash.

   KEY FEATURES:
   • Video cry analysis with confidence scoring
   • Identifies crying reasons: hunger, discomfort, tiredness, and more
   • Emotional state detection
   • Actionable care recommendations
   • 24/7 AI parenting assistant
   • Secure video storage with Supabase
   • Analysis history tracking

   HOW IT WORKS:
   1. Record a short video of your baby crying
   2. Our AI analyzes the cry patterns and context
   3. Get instant results with confidence scores
   4. Receive personalized care recommendations
   5. Chat with our AI assistant for follow-up questions

   MEDICAL DISCLAIMER:
   NurtureAI is a parenting support tool and should not replace professional medical advice. Always consult a pediatrician for health concerns.

   PRIVACY & SECURITY:
   • End-to-end encrypted video storage
   • No data sharing with third parties
   • COPPA compliant
   • Full privacy policy: https://yourdomain.com/privacy

   DESIGNED FOR NEW PARENTS:
   Whether you're a first-time parent or experienced caregiver, NurtureAI provides peace of mind by helping you understand your baby's needs faster.

   Download NurtureAI today and experience the future of parenting support.
   ```

   **Keywords** (100 chars max):
   ```
   baby cry, infant care, parenting, AI baby, newborn, crying analysis, baby monitor, pediatric
   ```

   **Promotional Text** (170 chars max):
   ```
   Understand your baby's cries with AI! Get instant analysis, care recommendations, and 24/7 parenting support. Download now and become a confident parent.
   ```

### Step 2: Prepare Screenshots

**Required Screenshot Sizes**:
- **6.5" Display** (iPhone 14 Pro Max, 15 Pro Max): 1290 x 2796 pixels (3-10 screenshots)
- **5.5" Display** (iPhone 8 Plus): 1242 x 2208 pixels (3-10 screenshots)
- **12.9" iPad Pro**: 2048 x 2732 pixels (optional, 3-10 screenshots)

**Recommended Screenshots** (in order):
1. **Analysis Results Screen**: Show cry analysis with confidence scores
2. **Video Recording Screen**: Show recording interface
3. **Chat Assistant Screen**: Show AI conversation
4. **History Screen**: Show saved analyses
5. **Onboarding Screen**: Show welcome/features
6. **Dashboard**: Show main navigation

**Design Tips**:
- Use device frames
- Add captions explaining each feature
- Keep text large and readable
- Show real functionality (no mockups)
- Consider using tools like Figma or Sketch

### Step 3: Upload Build from Xcode

1. **Archive Build**
   ```bash
   cd packages/mobile
   npm run ios:prod
   ```
   - In Xcode: Product → Archive
   - Wait for archiving to complete

2. **Validate Build**
   - In Organizer window, select archive
   - Click **Validate App**
   - Select distribution method: App Store Connect
   - Follow prompts, fix any issues

3. **Distribute to App Store Connect**
   - Click **Distribute App**
   - Select **App Store Connect**
   - Upload to App Store: Automatically
   - Distribution certificate: Automatic
   - Click **Upload**
   - Wait for processing (can take 30-60 minutes)

### Step 4: Configure Version for Release

1. Go to **App Store Connect** → **My Apps** → **NurtureAI**
2. Click **+ Version or Platform** → **iOS**
3. Enter version: **1.0.0**
4. Select the build you just uploaded
5. Fill in **What's New in This Version**:
   ```
   Initial release of NurtureAI!

   • AI-powered baby cry analysis
   • Video recording and analysis
   • Personalized care recommendations
   • 24/7 AI parenting assistant
   • Secure cloud storage
   • Analysis history tracking

   We're excited to help you understand your baby better!
   ```

6. **Configure App Review Information**:
   - First Name: [Your Name]
   - Last Name: [Your Last Name]
   - Phone Number: [Your Phone]
   - Email: [Your Email]
   - **Demo Account**: Create test account for reviewers
     - Username: reviewer@nurtureai.app
     - Password: [Create secure password]
     - Notes: "This is a demo account for App Review. Feel free to record test videos."

7. **Add Notes for Reviewer**:
   ```
   NurtureAI uses Google Gemini 2.5 Flash API for cry analysis.

   Testing Instructions:
   1. Sign in with provided credentials
   2. Record a short video (crying sound not required for testing)
   3. View analysis results
   4. Try the chat assistant

   The app requires camera and microphone permissions for video recording.
   Medical disclaimer is shown before analysis.

   API keys are securely stored on backend (Vercel).
   Database: Supabase PostgreSQL with encryption.
   ```

### Step 5: Submit for Review

1. Click **Add for Review**
2. Select **Manually release this version**
3. Review all sections (all should have checkmarks)
4. Click **Submit for Review**

**Review Timeline**: Typically 24-48 hours

---

## Google Play Store Submission

### Step 1: Create App in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in details:
   - App name: NurtureAI
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
4. Accept declarations
5. Click **Create app**

### Step 2: Set Up Store Listing

1. **Go to Store Listing** (left sidebar)

2. **App Details**:
   - **App name**: NurtureAI - Baby Cry Analysis
   - **Short description** (80 chars max):
     ```
     AI-powered baby cry translator. Understand your baby's needs instantly.
     ```
   - **Full description** (4000 chars max):
     ```
     NurtureAI helps parents understand their baby's cries using advanced AI technology powered by Google's Gemini 2.5 Flash.

     🍼 KEY FEATURES:
     • Video cry analysis with confidence scoring
     • Identifies crying reasons: hunger, discomfort, tiredness, and more
     • Emotional state detection
     • Actionable care recommendations
     • 24/7 AI parenting assistant
     • Secure video storage
     • Analysis history tracking

     📱 HOW IT WORKS:
     1. Record a short video of your baby crying
     2. Our AI analyzes the cry patterns and context
     3. Get instant results with confidence scores
     4. Receive personalized care recommendations
     5. Chat with our AI assistant for follow-up questions

     🔒 PRIVACY & SECURITY:
     • End-to-end encrypted video storage
     • No data sharing with third parties
     • Full GDPR compliance
     • Detailed privacy policy available

     ⚠️ MEDICAL DISCLAIMER:
     NurtureAI is a parenting support tool and should not replace professional medical advice. Always consult a pediatrician for health concerns.

     👶 DESIGNED FOR NEW PARENTS:
     Whether you're a first-time parent or experienced caregiver, NurtureAI provides peace of mind by helping you understand your baby's needs faster.

     Download NurtureAI today and experience the future of parenting support.

     For support: support@nurtureai.app
     Privacy Policy: https://yourdomain.com/privacy
     Terms of Service: https://yourdomain.com/terms
     ```

3. **App Icon**:
   - Upload 512x512 PNG (32-bit with alpha)
   - Icon must follow [Material Design guidelines](https://material.io/design/iconography)

4. **Graphics**:

   **Feature Graphic** (Required):
   - Size: 1024 x 500 pixels
   - Format: JPG or PNG (no alpha)
   - Should showcase your app's key feature

   **Phone Screenshots** (Required: 2-8 screenshots):
   - Size: 16:9 or 9:16 aspect ratio
   - Min dimension: 320px
   - Max dimension: 3840px
   - Recommended: 1080 x 1920 pixels

   **7" Tablet Screenshots** (Optional):
   - Size: 1200 x 1920 pixels

   **10" Tablet Screenshots** (Optional):
   - Size: 1800 x 2880 pixels

5. **Categorization**:
   - **Category**: Parenting or Health & Fitness
   - **Tags**: Baby care, parenting tools, AI assistant
   - **Email**: support@nurtureai.app
   - **Phone**: [Your phone number] (optional)
   - **Website**: https://nurtureai.app (optional)

6. **Store Settings**:
   - **Privacy Policy URL**: https://yourdomain.com/privacy (required)

### Step 3: Content Rating

1. Go to **Content rating** (left sidebar)
2. Click **Start questionnaire**
3. Select **ESRB** or **IARC**
4. Answer questions:
   - Contains violence: No
   - Contains sexual content: No
   - Contains language: No
   - Contains controlled substances: No
   - Contains gambling: No
   - Interactive elements: Yes (users can interact, chat)
   - Shares user location: No
   - Users can communicate: No
   - Purchases digital goods: No
5. Submit rating

Likely rating: **E for Everyone** or **E10+**

### Step 4: App Access

1. Go to **App access** (left sidebar)
2. Select **All or some functionality is restricted**
3. Provide instructions:
   ```
   This app requires user registration to save analysis history.

   Test Account:
   Email: reviewer@nurtureai.app
   Password: [create secure password]

   The app requires camera and microphone permissions for video recording.
   ```

### Step 5: Data Safety

1. Go to **Data safety** (left sidebar)
2. Answer questions about data collection:

   **Does your app collect or share user data?** Yes

   **Data collected**:
   - Email address (required, account management)
   - Name (optional, personalization)
   - Videos (user content, stored encrypted)

   **Data security**:
   - Data encrypted in transit: Yes (HTTPS)
   - Data encrypted at rest: Yes (Supabase encryption)
   - Users can request data deletion: Yes

   **Data usage**:
   - App functionality: Yes
   - Analytics: No
   - Advertising: No

3. Submit data safety form

### Step 6: Upload AAB

1. **Build Release AAB**:
   ```bash
   cd packages/mobile/android
   ./gradlew bundleRelease
   ```
   Output: `app/build/outputs/bundle/release/app-release.aab`

2. **Go to Production** → **Create new release**
3. **Upload AAB**:
   - Drag and drop `app-release.aab`
   - Wait for processing
   - Fix any warnings

4. **Release name**: 1.0.0 (1)
5. **Release notes**:
   ```
   Initial release of NurtureAI!

   ✨ Features:
   • AI-powered baby cry analysis
   • Video recording and analysis
   • Personalized care recommendations
   • 24/7 AI parenting assistant
   • Secure cloud storage
   • Analysis history tracking

   We're excited to help you understand your baby better!
   ```

### Step 7: Review and Rollout

1. **Review release summary**
2. Click **Start rollout to Production**
3. Confirm rollout

**Review Timeline**: Typically 1-7 days (can be longer for first release)

---

## Required Assets

### App Icons

**iOS**:
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPhone @2x)
- 87x87 (iPhone @3x settings)
- 80x80 (iPad @2x)
- 76x76 (iPad)
- 60x60 (Spotlight)
- 58x58 (Settings @2x)
- 40x40 (Spotlight @2x)
- 29x29 (Settings)

**Android**:
- 512x512 (Play Store)
- 192x192 (xxxhdpi)
- 144x144 (xxhdpi)
- 96x96 (xhdpi)
- 72x72 (hdpi)
- 48x48 (mdpi)

### Screenshots

Prepare screenshots for all required sizes (see iOS/Android sections above).

**Tips**:
- Use actual app screenshots (not mockups)
- Show key features
- Add captions for clarity
- Consider using screenshot generators:
  - [Previewed](https://previewed.app)
  - [AppMockUp](https://app-mockup.com)
  - [Smartmockups](https://smartmockups.com)

---

## App Store Metadata

### App Name Best Practices
- Keep it under 30 characters
- Include main value proposition
- Be descriptive but concise
- Examples:
  - "NurtureAI - Baby Cry Translator"
  - "NurtureAI: AI Baby Care Assistant"

### Description Best Practices
- Start with compelling hook
- List key features with bullets
- Explain how it works
- Include medical disclaimer
- End with call-to-action
- Use keywords naturally (no keyword stuffing)

### Keywords Strategy

**High-Value Keywords**:
- baby cry analysis
- infant care
- parenting app
- baby translator
- AI baby monitor
- newborn care
- crying baby help

**Long-Tail Keywords**:
- understand baby cries
- baby cry meaning
- infant cry analyzer
- AI parenting assistant

---

## Review Guidelines

### iOS App Review Guidelines

Must comply with:
- **4.0 Design**: Follow Human Interface Guidelines
- **5.1.1 Privacy**: Clear privacy policy, data handling disclosures
- **5.1.2 Data Use**: Minimal data collection, secure storage
- **2.5.13 Medical Apps**: Disclaimer that app doesn't replace medical advice
- **1.4.1 Kids Category**: COPPA compliance if targeting kids

### Google Play Policies

Must comply with:
- **Content Policy**: No misleading claims
- **Privacy**: Comply with data safety requirements
- **Permissions**: Only request necessary permissions
- **Health Apps**: Medical disclaimer required

---

## Common Rejection Reasons

### iOS

1. **Missing Privacy Policy**: Must have accessible privacy policy URL
2. **Misleading Metadata**: Description doesn't match functionality
3. **Medical Claims**: Making unsubstantiated medical claims
4. **Incomplete Information**: Missing demo account or test instructions
5. **Crashes/Bugs**: App crashes during review
6. **Missing Functionality**: Features mentioned don't work
7. **Wrong Age Rating**: Content doesn't match selected rating

**How to Avoid**:
- Test thoroughly before submission
- Provide clear test instructions
- Include medical disclaimer
- Ensure privacy policy is complete
- Test with demo account

### Android

1. **Privacy Policy Missing**: Required for apps collecting user data
2. **Misleading Store Listing**: Screenshots/description don't match app
3. **Permissions Issues**: Requesting unnecessary permissions
4. **Content Rating Mismatch**: App content doesn't match rating
5. **Broken Functionality**: Features don't work as described
6. **Data Safety Form Incomplete**: Missing required information

**How to Avoid**:
- Fill out data safety form completely
- Only request needed permissions
- Test on multiple devices
- Match screenshots to actual app
- Double-check all store listing information

---

## Post-Submission

### If Approved
1. App goes live automatically (or manually if selected)
2. Monitor reviews and ratings
3. Respond to user feedback
4. Plan updates and improvements

### If Rejected
1. Read rejection reason carefully
2. Fix issues mentioned
3. Test thoroughly
4. Resubmit with explanation of changes
5. Respond to reviewer notes if needed

### Monitoring
- Check analytics daily
- Monitor crash reports
- Read user reviews
- Track download numbers
- Watch for support requests

---

## Next Steps After Launch

1. **Marketing**:
   - Share on social media
   - Create press release
   - Reach out to parenting blogs
   - Consider paid ads

2. **User Feedback**:
   - Encourage reviews
   - Respond to feedback
   - Implement feature requests

3. **Updates**:
   - Fix bugs promptly
   - Add new features
   - Improve based on analytics
   - Keep content fresh

4. **Support**:
   - Monitor support email
   - Create FAQ page
   - Consider in-app help
   - Build community

---

## Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

For technical deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)
For privacy policy, see [PRIVACY_POLICY.md](./PRIVACY_POLICY.md)
