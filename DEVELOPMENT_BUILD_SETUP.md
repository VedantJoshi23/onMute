# Development Build Setup Guide

## Project Ejection Complete ✅

Your Expo project has been successfully ejected and configured for development builds!

## What Changed

### 1. Native Directories Created
- `ios/` - iOS native project
- `android/` - Android native project

### 2. Configuration Updated
- `eas.json` - EAS Build configuration
- `package.json` - Updated with dev client dependency
- `app.json` - Remains your configuration source

### 3. Development Client Installed
- `expo-dev-client` - Enables custom development builds

## Building Development Builds

### Prerequisites
Make sure you have the following installed:

**For iOS:**
```bash
# Install Xcode from Mac App Store
# Install CocoaPods
sudo gem install cocoapods

# Install iOS dependencies
cd ios && pod install && cd ..
```

**For Android:**
```bash
# Install Android Studio
# Set up Android SDK and emulator
# Accept SDK licenses
# Set ANDROID_HOME environment variable
```

### Local Development Builds

#### iOS Development Build
```bash
# Build for iOS simulator
npx expo run:ios

# Build for physical iOS device (requires Apple Developer account)
npx expo run:ios --device
```

#### Android Development Build
```bash
# Build for Android emulator
npx expo run:android

# Build for physical Android device
npx expo run:android --device
```

### Cloud Development Builds (EAS Build)

#### iOS Development Build
```bash
# Build development APK for iOS
npx eas build --platform ios --profile development

# Install on device using Expo Go or custom dev client
```

#### Android Development Build
```bash
# Build development APK for Android
npx eas build --platform android --profile development

# Install APK on device
```

## Development Workflow

### 1. Start Metro Bundler
```bash
npx expo start --dev-client
```

### 2. Connect Your Device
- For local builds: Device will automatically connect when running the app
- For EAS builds: Scan QR code with the custom dev client app

### 3. Live Reloading
- Changes will hot reload automatically
- Shake device to open developer menu

## Testing Your App

### Audio Recording Features
Your app includes audio recording capabilities:
- Microphone permissions are configured for both platforms
- Test audio recording functionality
- Verify transcription features work properly

### Chat Persistence
- Test chat creation and persistence
- Verify file storage works on both platforms
- Test fresh installation vs existing data scenarios

## Troubleshooting

### iOS Issues
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..
rm -rf ios/build

# Reinstall CocoaPods
cd ios && pod deintegrate && pod install && cd ..
```

### Android Issues
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset Metro cache
npx expo start --clear
```

### Common Issues
1. **Metro bundler issues**: `npx expo start --clear`
2. **Native dependency issues**: Re-run `npx expo prebuild --clean`
3. **Permission issues**: Check `app.json` permissions configuration

## Next Steps

1. **Test local builds** on both platforms
2. **Set up EAS Build** for cloud builds (if needed)
3. **Configure CI/CD** for automated builds
4. **Test on physical devices** for production-like experience

## Important Notes

- **Always test on physical devices** for audio/microphone features
- **Keep `app.json` as source of truth** for configuration
- **Use `npx expo prebuild` to regenerate native code** after config changes
- **Commit native directories to git** if you plan to add custom native code

Your app is now ready for advanced development with full native capabilities!
