# Mobile App Build Guide

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Expo account (free at expo.dev)
- Google Play Console account ($25 one-time fee)

## Setup

1. Login to Expo:
```bash
eas login
```

2. Configure project:
```bash
cd mobile
eas init
```

3. Configure app.json:
- Update `android.package` to your unique package name
- Update `ios.bundleIdentifier`
- Add your API URL to `extra.apiUrl`

## Development

```bash
# Start development server
npx expo start

# Run on Android emulator
npx expo start --android

# Run on iOS simulator (Mac only)
npx expo start --ios
```

## Building for Production

### Android APK (testing)
```bash
eas build --platform android --profile preview
```

### Android AAB (Play Store)
```bash
eas build --platform android --profile production
```

### iOS (future)
```bash
eas build --platform ios --profile production
```

## Play Store Submission

### 1. Generate Signed AAB
The EAS build produces a signed AAB automatically.

### 2. Create Play Store Listing
- Go to Google Play Console
- Create new app
- Fill in store listing details
- Upload AAB from EAS build

### 3. Required Assets
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Phone screenshots: min 2, max 8 (1242x2208 or similar)
- Tablet screenshots: optional but recommended
- Privacy policy URL

### 4. Content Rating
- Complete content rating questionnaire
- Target audience: 18+

### 5. Release
- Internal testing → Closed testing → Open testing → Production
- Or direct production release

### 6. Submit
```bash
eas submit --platform android
```

## App Configuration

### App Icon
Replace `assets/icon.png` with your 1024x1024 icon.

### Splash Screen
Replace `assets/splash.png` with your 1242x2436 splash image.

### Adaptive Icon (Android)
Replace `assets/adaptive-icon.png` with foreground icon (must have transparent background).

## Environment Variables

Create `.env` file:
```
API_URL=https://api.career-os.app
```

## Troubleshooting

### Build Failures
- Check `app.json` is valid JSON
- Ensure all dependencies are installed
- Check EAS build logs for errors

### Network Errors
- Verify API_URL is correct and reachable
- Check CORS settings on backend
- Ensure HTTPS is used in production

### App Crashes
- Check for JavaScript errors in Metro logs
- Verify all API responses match expected schemas
- Test on physical device, not just emulator

## Updates

Use Expo OTA updates for quick fixes:
```bash
expo publish
```

For native code changes, rebuild and resubmit.
