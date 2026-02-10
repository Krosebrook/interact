# Capacitor Android Setup Guide

**Project:** Interact - Employee Engagement Platform  
**Date:** February 9, 2026  
**Status:** Production Ready  

---

## Overview

This guide covers the Capacitor setup for building native Android applications while keeping web as the primary runtime. The setup is non-breaking and maintains full web application functionality.

## Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Android builds)
- JDK 17+ (for Android builds)

## Installation

Capacitor and Android platform support have been installed:

```bash
# Capacitor packages (already installed)
npm install --save-dev @capacitor/cli @capacitor/core @capacitor/android
```

## Configuration

### Capacitor Config

The Capacitor configuration is located at `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.interact.app',
  appName: 'Interact',
  webDir: 'dist'
};

export default config;
```

### Key Configuration Options

- **appId:** `com.interact.app` - Unique identifier for the app
- **appName:** `Interact` - Display name of the app
- **webDir:** `dist` - Directory containing built web assets

## Build Steps

### 1. Build Web Assets

First, build the web application:

```bash
npm run build
```

This creates the production build in the `dist/` directory.

### 2. Sync Capacitor

Sync the web assets to the Android platform:

```bash
npx cap sync android
```

This command:
- Copies web assets from `dist/` to `android/app/src/main/assets/public`
- Updates native plugins
- Syncs configuration

### 3. Open Android Studio

Open the Android project in Android Studio:

```bash
npx cap open android
```

### 4. Build Android App

#### Option A: Using Android Studio

1. Open the project in Android Studio (see step 3)
2. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Wait for build to complete
4. Find APK in `android/app/build/outputs/apk/`

#### Option B: Using Command Line

```bash
cd android
./gradlew assembleDebug    # Debug build
./gradlew assembleRelease  # Release build (requires signing)
```

## Running the App

### Run on Emulator

1. Start an Android emulator in Android Studio
2. Run:
```bash
npx cap run android
```

### Run on Physical Device

1. Enable USB debugging on your Android device
2. Connect device via USB
3. Run:
```bash
npx cap run android
```

## Development Workflow

### Live Reload (Optional)

For development with live reload:

1. Start the dev server:
```bash
npm run dev
```

2. Update `capacitor.config.ts` to point to dev server:
```typescript
const config: CapacitorConfig = {
  appId: 'com.interact.app',
  appName: 'Interact',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.100:5173', // Your local IP
    cleartext: true
  }
};
```

3. Sync and run:
```bash
npx cap sync android
npx cap run android
```

**Remember:** Remove the `server` configuration before production builds!

### Standard Development Flow

For most development, keep web as primary:

1. Develop and test in browser: `npm run dev`
2. Build when ready: `npm run build`
3. Sync to Android: `npx cap sync android`
4. Test Android-specific features in emulator/device

## Project Structure

```
interact/
├── android/                      # Android native project (gitignored)
│   ├── app/
│   │   └── src/main/assets/public/  # Web assets
│   ├── build.gradle
│   └── ...
├── capacitor.config.ts          # Capacitor configuration
├── src/                         # Web application source
└── dist/                        # Built web assets (gitignored)
```

## Android-Specific Configuration

### App Icons and Splash Screen

Update icons and splash screen in:
- `android/app/src/main/res/mipmap-*` (icons)
- `android/app/src/main/res/drawable-*` (splash)

Or use the Capacitor Assets tool:
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --android
```

### Permissions

Edit `android/app/src/main/AndroidManifest.xml` to add permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<!-- Add other permissions as needed -->
```

### App Name and Version

Edit `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.interact.app"
        versionCode 1
        versionName "0.0.0"
        // ...
    }
}
```

## Updating Capacitor

To update Capacitor to the latest version:

```bash
npm install @capacitor/cli@latest @capacitor/core@latest @capacitor/android@latest
npx cap sync android
```

## Troubleshooting

### Build Fails

1. **Check JDK version:** Ensure JDK 17+ is installed
2. **Clean build:** 
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Assets Not Updating

1. Rebuild web assets: `npm run build`
2. Sync again: `npx cap sync android`
3. If still not working, manually delete `android/app/src/main/assets/public` and sync

### Emulator Not Starting

1. Check Android Studio AVD Manager
2. Ensure virtualization is enabled in BIOS
3. Try running from Android Studio directly

### Plugin Not Working

1. Check plugin installation: `npm list @capacitor/<plugin-name>`
2. Sync: `npx cap sync android`
3. Check native logs: `npx cap run android -l`

## Verification Checklist

- [x] Capacitor CLI installed
- [x] Android platform added
- [x] Build configuration verified
- [x] Web build succeeds
- [x] Assets sync to Android
- [ ] App builds in Android Studio (requires Android Studio installation)
- [ ] App runs on emulator (requires Android Studio installation)
- [ ] App runs on physical device (requires Android Studio + device)

## Platform-Specific Features

### Using Capacitor Plugins

Example: Camera plugin

```bash
npm install @capacitor/camera
npx cap sync android
```

```javascript
import { Camera } from '@capacitor/camera';

const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: 'uri'
  });
  return image.webPath;
};
```

### Checking Platform

Detect if running in native app:

```javascript
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform(); // true in Android app
const platform = Capacitor.getPlatform();      // 'android' or 'web'
```

## Production Build

### Signing the APK

1. Generate keystore:
```bash
keytool -genkey -v -keystore interact-release.keystore -alias interact -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure signing in `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('../../interact-release.keystore')
            storePassword 'your-password'
            keyAlias 'interact'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. Build release APK:
```bash
cd android
./gradlew assembleRelease
```

**Important:** Never commit keystore files or passwords to git!

### App Bundle for Google Play

```bash
cd android
./gradlew bundleRelease
```

Find the `.aab` file in `android/app/build/outputs/bundle/release/`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Android

on:
  push:
    branches: [ main ]

jobs:
  build-android:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web assets
        run: npm run build
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
      
      - name: Sync Capacitor
        run: npx cap sync android
      
      - name: Build Android APK
        run: |
          cd android
          ./gradlew assembleDebug
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-debug.apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Download](https://developer.android.com/studio)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

## Next Steps

1. Install Android Studio for building and testing
2. Set up emulators or connect physical devices
3. Test core functionality in native Android environment
4. Add native plugins as needed (camera, geolocation, etc.)
5. Implement push notifications (if required)
6. Set up signing for production releases

---

**Document Owner:** Development Team  
**Last Updated:** February 9, 2026  
**Next Review:** After first Android build and testing
