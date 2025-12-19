# CanaryTalk Mobile

React Native mobile application for CanaryTalk - E2E encrypted chat for Android and iOS.

## Features
- 📱 Native mobile experience for Android & iOS
- 🔒 End-to-end encryption
- 💬 Real-time messaging
- 🔔 Push notifications
- 📁 Secure local storage
- ⚡ Fast and responsive

## Prerequisites

### For Both Platforms
- Node.js 18 or higher
- React Native CLI
- Running CanaryTalk server

### For Android
- Android Studio
- Android SDK (API 28 or higher)
- Java Development Kit (JDK 11)

### For iOS (macOS only)
- Xcode 14 or higher
- CocoaPods
- iOS Simulator or device

## Installation

```bash
npm install
```

### iOS Setup
```bash
cd ios
pod install
cd ..
```

## Configuration

Edit `src/services/api.js` and `src/services/socket.js` to set your server URL:

```javascript
const API_URL = 'http://your-server-ip:3000/api';
```

**Note**: For Android emulator, use `http://10.0.2.2:3000` for localhost.

## Running the App

### Android
```bash
npm run android
```

Or in Android Studio:
1. Open the `android` folder
2. Click Run

### iOS
```bash
npm run ios
```

Or in Xcode:
1. Open `ios/CanaryTalkMobile.xcworkspace`
2. Click Run

## Building for Production

### Android

1. Generate a signing key:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore canarytalk-release-key.keystore -alias canarytalk -keyalg RSA -keysize 2048 -validity 10000
```

2. Place the keystore file in `android/app/`

3. Create `android/gradle.properties`:
```properties
CANARYTALK_UPLOAD_STORE_FILE=canarytalk-release-key.keystore
CANARYTALK_UPLOAD_KEY_ALIAS=canarytalk
CANARYTALK_UPLOAD_STORE_PASSWORD=your-password
CANARYTALK_UPLOAD_KEY_PASSWORD=your-password
```

4. Build the APK:
```bash
cd android
./gradlew assembleRelease
```

The APK will be in `android/app/build/outputs/apk/release/app-release.apk`

### iOS

1. Open `ios/CanaryTalkMobile.xcworkspace` in Xcode

2. Select your signing team under Signing & Capabilities

3. Archive the app: Product → Archive

4. Distribute to App Store or export IPA

## Installation on Devices

### Android
1. Enable "Unknown Sources" in device settings
2. Transfer the APK to your device
3. Open and install the APK

Or install via ADB:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### iOS
- Distribute via TestFlight for beta testing
- Publish to App Store for public release
- Or use development provisioning for direct installation

## Troubleshooting

### Android

**Build fails**:
```bash
cd android
./gradlew clean
cd ..
```

**Metro bundler issues**:
```bash
npm start -- --reset-cache
```

### iOS

**Pod install fails**:
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Build fails in Xcode**:
- Clean build folder: Product → Clean Build Folder
- Clear derived data

### General

**Can't connect to server**:
- Check server is running
- Verify server URL in configuration
- Check firewall settings
- For Android emulator, use `10.0.2.2` instead of `localhost`

## Push Notifications Setup

### Firebase Cloud Messaging (FCM) for Android

1. Create a project in Firebase Console
2. Add Android app to Firebase project
3. Download `google-services.json` to `android/app/`
4. Add FCM dependencies to `android/app/build.gradle`

### Apple Push Notification Service (APNS) for iOS

1. Create App ID in Apple Developer Portal
2. Enable Push Notifications capability
3. Generate certificates
4. Configure in Xcode under Signing & Capabilities

## Development

### Project Structure
```
mobile/
├── App.js                  # Main app component
├── src/
│   ├── screens/           # Screen components
│   ├── components/        # Reusable components
│   └── services/          # API, encryption, socket services
├── android/               # Android native code
└── ios/                   # iOS native code
```

### Adding Dependencies
```bash
npm install <package-name>
```

For native dependencies:
```bash
npm install <package-name>
cd ios && pod install && cd ..
```

## Testing

```bash
npm test
```

## License

MIT
