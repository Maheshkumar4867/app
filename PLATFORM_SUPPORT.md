# Platform Support - React Native Video Player SDK

## ✅ Supported Platforms

### Mobile Platforms
- **📱 iOS** (iOS 11.0+)
  - iPhone (all models)
  - iPad (all models)
  - iPod Touch
  - Native video playback with AVPlayer
  - AirPlay support
  - Picture-in-Picture (iOS 14+)
  - Background audio playback
  - CarPlay integration

- **🤖 Android** (API Level 21+)
  - Android phones and tablets
  - Android TV
  - Native video playback with ExoPlayer/MediaPlayer
  - Picture-in-Picture (Android 8.0+)
  - Background audio playback
  - Android Auto integration
  - MediaSession controls

### TV Platforms
- **📺 Apple TV** (tvOS 11.0+)
  - Remote control navigation
  - TV-optimized UI
  - Native tvOS video player

- **📺 Android TV** (API Level 21+)
  - D-pad navigation
  - TV-optimized UI
  - Leanback support

## ❌ Not Supported Platforms

### Web Browsers
- **Chrome, Firefox, Safari, Edge**: This SDK is **NOT** for web browsers
- **React.js / Next.js**: This SDK does **NOT** work with web React applications
- **Progressive Web Apps (PWA)**: Not compatible

### Desktop Applications
- **Electron**: While technically possible, not designed or tested for Electron
- **React Native Windows**: Not tested or supported
- **React Native macOS**: Not tested or supported

### Other Platforms
- **React Native Web**: Not compatible
- **Expo Web**: Not compatible (web target)

## 🔧 How to Choose the Right Solution

### If you're building for:

#### ✅ React Native Mobile App (iOS/Android)
**Use this SDK** - Perfect fit! This is exactly what it's designed for.

#### ❌ Web Application (React.js)
**Use these alternatives instead:**
- [Video.js](https://videojs.com/) - Popular HTML5 video player
- [Plyr](https://plyr.io/) - Simple, accessible HTML5 video player
- [JW Player](https://www.jwplayer.com/) - Professional video platform
- [Shaka Player](https://github.com/shaka-project/shaka-player) - Google's adaptive streaming player

#### ❌ React Native Web
**Use web video players** listed above, as React Native Web targets web browsers.

#### ✅ Expo (React Native)
**Use this SDK with caveats:**
- Must eject to ExpoKit or use Expo Development Builds
- Cannot use with Expo Go (requires native modules)
- May need additional configuration for some features

## 🚀 Getting Started

### For Supported Platforms (iOS/Android):

1. **Check Requirements**:
   - React Native 0.70.0+
   - iOS 11.0+ / Android API 21+
   - Xcode 13+ (for iOS)
   - Android Studio (for Android)

2. **Install the SDK**:
   ```bash
   npm install react-native-video-player-sdk
   ```

3. **Follow Setup Guide**:
   See [REACT_NATIVE_SETUP.md](./REACT_NATIVE_SETUP.md) for complete installation instructions.

### For Unsupported Platforms:

If you're building for web or other platforms, we recommend:
- Use platform-appropriate video solutions
- Consider building separate implementations for different platforms
- Look into cross-platform solutions that explicitly support your target platforms

## 🔍 Detection & Fallbacks

The SDK includes built-in platform detection:

```tsx
import { DeviceDetector } from 'react-native-video-player-sdk';

// Detect platform
const deviceInfo = await DeviceDetector.getDeviceInfo();
console.log(deviceInfo.platform); // 'ios' or 'android'
console.log(deviceInfo.deviceType); // 'phone', 'tablet', or 'tv'

// Platform-specific configuration
if (deviceInfo.platform === 'ios') {
  // iOS-specific setup
} else if (deviceInfo.platform === 'android') {
  // Android-specific setup
}
```

## 📱 Platform-Specific Features

### iOS Exclusive Features
- AirPlay streaming
- CarPlay integration
- Native iOS video controls
- iOS-specific DRM (FairPlay)

### Android Exclusive Features
- Android Auto integration
- Android TV optimizations
- Android-specific DRM (Widevine)
- MediaSession rich controls

### Shared Features
- HLS/DASH adaptive streaming
- MP4 playback
- Subtitle support (WebVTT, SRT)
- Advertisement integration
- Analytics tracking
- Device orientation handling
- Background audio playback

## ⚠️ Important Notes

1. **No Web Support**: This SDK will not work in web browsers or React web applications
2. **Native Dependencies**: Requires native modules that only work in React Native
3. **Platform-Specific Setup**: Requires iOS and Android specific configuration
4. **Real Device Testing**: Some features only work on real devices, not simulators

## 🆘 Need Help?

- **Platform Support Questions**: Check this document first
- **Setup Issues**: See [REACT_NATIVE_SETUP.md](./REACT_NATIVE_SETUP.md)
- **API Questions**: See main [README.md](./README.md)
- **Web Alternatives**: Consider the web video players mentioned above