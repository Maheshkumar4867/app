# React Native Video Player SDK - Setup Guide

This guide helps you integrate the React Native Video Player SDK into your Android and iOS applications.

## Prerequisites

- React Native 0.70.0 or higher
- Node.js 16 or higher
- Android Studio (for Android development)
- Xcode 13+ (for iOS development)

## Installation

### 1. Install the SDK

```bash
npm install react-native-video-player-sdk
```

### 2. Install Peer Dependencies

```bash
# Core video playback
npm install react-native-video

# Device orientation handling
npm install react-native-orientation-locker

# Keep screen awake during playback
npm install react-native-keep-awake

# Device information detection
npm install react-native-device-info

# UI components
npm install react-native-linear-gradient
npm install react-native-gesture-handler
npm install react-native-reanimated
npm install react-native-svg

# File system access (for offline content)
npm install react-native-fs
```

### 3. Platform-Specific Setup

#### iOS Setup

1. **Update Podfile** (`ios/Podfile`):
```ruby
platform :ios, '11.0'

target 'YourApp' do
  # ... existing config

  # Video Player SDK dependencies
  pod 'react-native-video', :path => '../node_modules/react-native-video'
  pod 'react-native-orientation-locker', :path => '../node_modules/react-native-orientation-locker'
  pod 'react-native-keep-awake', :path => '../node_modules/react-native-keep-awake'
  pod 'react-native-device-info', :path => '../node_modules/react-native-device-info'
  
  # Required for react-native-reanimated
  pod 'RNReanimated', :path => '../node_modules/react-native-reanimated'
  
  # Required for react-native-gesture-handler
  pod 'RNGestureHandler', :path => '../node_modules/react-native-gesture-handler'
end
```

2. **Install Pods**:
```bash
cd ios && pod install && cd ..
```

3. **Update Info.plist** (`ios/YourApp/Info.plist`):
```xml
<dict>
  <!-- ... existing keys -->
  
  <!-- Allow arbitrary loads for video content -->
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
  </dict>
  
  <!-- Background audio playback -->
  <key>UIBackgroundModes</key>
  <array>
    <string>audio</string>
  </array>
  
  <!-- Device orientation support -->
  <key>UISupportedInterfaceOrientations</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
  </array>
</dict>
```

#### Android Setup

1. **Update MainApplication.java** (`android/app/src/main/java/.../MainApplication.java`):
```java
import com.brentvatne.react.ReactVideoPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;

public class MainApplication extends Application implements ReactApplication {
  // ... existing code

  @Override
  protected List<ReactPackage> getPackages() {
    @SuppressWarnings("UnnecessaryLocalVariable")
    List<ReactPackage> packages = new PackageList(this).getPackages();
    
    // Add video player packages
    packages.add(new ReactVideoPackage());
    packages.add(new OrientationPackage());
    packages.add(new KCKeepAwakePackage());
    packages.add(new RNDeviceInfo());
    packages.add(new ReanimatedPackage());
    packages.add(new RNGestureHandlerPackage());
    
    return packages;
  }
}
```

2. **Update AndroidManifest.xml** (`android/app/src/main/AndroidManifest.xml`):
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  
  <!-- Internet permission for video streaming -->
  <uses-permission android:name="android.permission.INTERNET" />
  
  <!-- Network state permission -->
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  
  <!-- Wake lock permission -->
  <uses-permission android:name="android.permission.WAKE_LOCK" />
  
  <!-- Audio focus permission -->
  <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
  
  <application
    android:name=".MainApplication"
    android:allowBackup="false"
    android:theme="@style/AppTheme">
    
    <activity
      android:name=".MainActivity"
      android:exported="true"
      android:launchMode="singleTop"
      android:theme="@style/AppTheme"
      android:windowSoftInputMode="adjustResize"
      android:screenOrientation="portrait"
      android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode">
      
      <!-- ... existing intent filters -->
    </activity>
  </application>
</manifest>
```

3. **Update build.gradle** (`android/app/build.gradle`):
```gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion

    defaultConfig {
        // ... existing config
        multiDexEnabled true
    }

    // ... existing config
}

dependencies {
    implementation "androidx.multidex:multidex:2.0.1"
    // ... existing dependencies
}
```

## Basic Usage

### Simple Video Player

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoPlayer } from 'react-native-video-player-sdk';

const SimplePlayer = () => {
  return (
    <View style={styles.container}>
      <VideoPlayer
        source={{
          uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          type: 'mp4'
        }}
        style={styles.player}
        controls={true}
        autoPlay={false}
        onLoad={(data) => console.log('Video loaded:', data)}
        onError={(error) => console.error('Video error:', error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  player: {
    width: '100%',
    height: 200,
  },
});

export default SimplePlayer;
```

### Advanced Configuration

```tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { 
  VideoPlayer,
  DeviceDetector,
  SourceSelector,
  PlayerConfig
} from 'react-native-video-player-sdk';

const AdvancedPlayer = () => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [deviceConfig, setDeviceConfig] = useState(null);

  useEffect(() => {
    initializePlayer();
  }, []);

  const initializePlayer = async () => {
    // Detect device capabilities
    const deviceInfo = await DeviceDetector.getDeviceInfo();
    
    // Configure player for device type
    const config = PlayerConfig.getConfigForDevice(deviceInfo.deviceType);
    setDeviceConfig(config);
    
    // Select best source
    const sources = [
      { uri: 'https://example.com/video.m3u8', type: 'hls' },
      { uri: 'https://example.com/video.mp4', type: 'mp4' }
    ];
    
    const bestSource = SourceSelector.selectBestSource(sources);
    setSelectedSource(bestSource);
  };

  if (!selectedSource) return null;

  return (
    <View style={styles.container}>
      <VideoPlayer
        source={selectedSource}
        style={styles.player}
        {...deviceConfig}
        
        // Subtitles
        subtitles={[
          {
            title: 'English',
            language: 'en',
            type: 'vtt',
            uri: 'https://example.com/subtitles.vtt'
          }
        ]}
        
        // Advertisements
        ads={{
          preroll: ['https://example.com/preroll.mp4'],
          midroll: [
            { time: 300, ads: ['https://example.com/midroll.mp4'] }
          ]
        }}
        
        // Analytics
        analytics={{
          enabled: true,
          provider: 'custom',
          config: {
            enableQualityTracking: true,
            enableErrorTracking: true
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  player: {
    width: '100%',
    height: Platform.OS === 'ios' ? 220 : 200,
  },
});

export default AdvancedPlayer;
```

## Platform-Specific Features

### iOS Features

- **AirPlay Support**: Automatic AirPlay integration
- **Picture-in-Picture**: Native PiP support on iOS 14+
- **CarPlay**: Integration with CarPlay for audio content
- **Background Playback**: Continues audio in background

### Android Features

- **Picture-in-Picture**: Native PiP support on Android 8.0+
- **Android Auto**: Integration for automotive platforms
- **Background Playback**: Service-based background audio
- **MediaSession**: Rich notifications and lock screen controls

### TV Platforms

- **Apple TV**: tvOS support with remote navigation
- **Android TV**: Android TV support with D-pad navigation
- **TV-Optimized UI**: Larger touch targets and navigation

## Common Issues & Solutions

### Issue: Video not playing on Android

**Solution**: Check network security configuration:

```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">your-video-domain.com</domain>
    </domain-config>
</network-security-config>
```

Update AndroidManifest.xml:
```xml
<application
  android:networkSecurityConfig="@xml/network_security_config">
```

### Issue: Fullscreen not working

**Solution**: Ensure orientation locker is properly configured:

```tsx
import Orientation from 'react-native-orientation-locker';

// Enable orientation changes
Orientation.unlockAllOrientations();

// Lock to landscape for fullscreen
Orientation.lockToLandscape();
```

### Issue: Audio continues in background unintentionally

**Solution**: Control background audio explicitly:

```tsx
import { AppState } from 'react-native';

useEffect(() => {
  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
      playerRef.current?.pause();
    }
  };

  AppState.addEventListener('change', handleAppStateChange);
  return () => AppState.removeEventListener('change', handleAppStateChange);
}, []);
```

## Testing

### Testing on Real Devices

```bash
# iOS
npx react-native run-ios --device

# Android
npx react-native run-android --device
```

### Performance Testing

Use the built-in analytics to monitor:
- Video load times
- Buffer health
- Frame drops
- Network quality

```tsx
<VideoPlayer
  analytics={{
    enabled: true,
    config: {
      enablePerformanceTracking: true,
      enableQualityTracking: true,
      enableBufferTracking: true
    }
  }}
  onProgress={(data) => {
    // Monitor performance metrics
    console.log('Buffer health:', data.playableDuration - data.currentTime);
  }}
/>
```

## Next Steps

1. **Read the API Documentation**: Check the main README for complete API reference
2. **Explore Examples**: Look at the examples folder for more use cases
3. **Customize UI**: Create custom controls and overlays
4. **Add Analytics**: Integrate with your analytics platform
5. **Test on Target Devices**: Ensure compatibility across your supported devices

## Support

- 📱 **iOS Issues**: Check iOS-specific setup and permissions
- 🤖 **Android Issues**: Verify Android manifest and permissions  
- 📺 **TV Issues**: Ensure TV-specific dependencies are installed
- 🎥 **Video Issues**: Test with different video formats and sources