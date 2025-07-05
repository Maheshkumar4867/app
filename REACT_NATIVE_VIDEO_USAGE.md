# React Native Video Usage Guide

This guide explains how to use `react-native-video` directly with the React Native Video Player SDK.

## Installation

### 1. Install the SDK

```bash
npm install react-native-video-player-sdk
```

### 2. Install Required Dependencies

```bash
npm install react-native-video react-native-orientation-locker react-native-keep-awake
```

### 3. iOS Setup (for react-native-video)

Add to `ios/Podfile`:
```ruby
pod 'react-native-video', :path => '../node_modules/react-native-video'
```

Then run:
```bash
cd ios && pod install
```

### 4. Android Setup (for react-native-video)

Add to `android/settings.gradle`:
```gradle
include ':react-native-video'
project(':react-native-video').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-video/android')
```

Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation project(':react-native-video')
}
```

## Usage Options

### Option 1: Direct react-native-video Usage

```tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Video from 'react-native-video';
import type { VideoRef, OnLoadData, OnProgressData } from 'react-native-video';

const MyVideoPlayer = () => {
  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const onLoad = (data: OnLoadData) => {
    console.log('Video loaded:', data);
    setDuration(data.duration);
  };

  const onProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);
  };

  const onEnd = () => {
    console.log('Video ended');
    setPaused(true);
    setCurrentTime(0);
  };

  const onError = (error: any) => {
    console.error('Video error:', error);
    Alert.alert('Error', 'Video playback failed');
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{
          uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        }}
        style={styles.video}
        paused={paused}
        volume={1.0}
        resizeMode="contain"
        onLoad={onLoad}
        onProgress={onProgress}
        onEnd={onEnd}
        onError={onError}
        progressUpdateInterval={250}
        
        // iOS specific props
        allowsExternalPlayback={true}
        playInBackground={false}
        playWhenInactive={false}
        
        // Android specific props
        bufferConfig={{
          minBufferMs: 15000,
          maxBufferMs: 50000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 5000,
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
  video: {
    flex: 1,
  },
});

export default MyVideoPlayer;
```

### Option 2: Enhanced SDK with react-native-video

```tsx
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { VideoPlayer } from 'react-native-video-player-sdk';

const MyEnhancedVideoPlayer = () => {
  return (
    <View style={styles.container}>
      <VideoPlayer
        source={{
          uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          type: 'hls',
        }}
        style={styles.video}
        autoPlay={false}
        controls={true}
        volume={0.8}
        resizeMode="contain"
        
        // Enhanced SDK Features
        subtitles={[
          {
            title: 'English',
            language: 'en',
            type: 'vtt',
            uri: 'https://example.com/subtitles/english.vtt',
          },
        ]}
        
        ads={{
          preroll: ['https://example.com/ads/preroll.mp4'],
          midroll: [
            { time: 120, ads: ['https://example.com/ads/midroll.mp4'] },
          ],
        }}
        
        analytics={{
          enabled: true,
          provider: 'custom',
          config: {
            enableQualityTracking: true,
            enableBufferTracking: true,
            enableErrorTracking: true,
          },
        }}
        
        thumbnails={{
          uri: 'https://example.com/thumbnails/frame_{index}.jpg',
          width: 160,
          height: 90,
          interval: 10,
        }}
        
        onLoad={(data) => {
          Alert.alert(
            'Video Loaded',
            `Duration: ${Math.round(data.duration)} seconds`,
            [{ text: 'OK' }]
          );
        }}
        
        onProgress={(data) => {
          console.log(`Progress: ${data.currentTime}/${data.playableDuration}`);
        }}
        
        onError={(error) => {
          Alert.alert('Error', `Video error: ${error.error.localizedDescription}`);
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
  video: {
    flex: 1,
  },
});

export default MyEnhancedVideoPlayer;
```

## react-native-video Props & Methods

### Essential Props

```tsx
// Basic video source
source={{
  uri: 'https://example.com/video.mp4',
  // Optional: specify type for better performance
  type: 'mp4' // or 'hls', 'dash', etc.
}}

// Playback control
paused={true}              // Start paused
volume={1.0}               // Volume (0.0 to 1.0)
rate={1.0}                 // Playback rate (0.5 to 2.0)
resizeMode="contain"       // contain, cover, stretch

// Event handlers
onLoad={(data) => console.log('Loaded:', data)}
onProgress={(data) => console.log('Progress:', data)}
onEnd={() => console.log('Video ended')}
onError={(error) => console.error('Error:', error)}
```

### Platform-Specific Props

#### iOS Props
```tsx
allowsExternalPlayback={true}    // Allow AirPlay
playInBackground={false}         // Continue in background
playWhenInactive={false}         // Play when app inactive
pictureInPicture={false}         // Picture-in-picture mode
```

#### Android Props
```tsx
bufferConfig={{
  minBufferMs: 15000,
  maxBufferMs: 50000,
  bufferForPlaybackMs: 2500,
  bufferForPlaybackAfterRebufferMs: 5000,
}}
```

### Video Ref Methods

```tsx
const videoRef = useRef<VideoRef>(null);

// Control playback
videoRef.current?.seek(30);           // Seek to 30 seconds
videoRef.current?.presentFullscreenPlayer();  // Enter fullscreen
videoRef.current?.dismissFullscreenPlayer();  // Exit fullscreen

// Get current state
const currentTime = await videoRef.current?.getCurrentPosition();
```

## Advanced Features

### 1. Adaptive Streaming (HLS/DASH)

```tsx
<Video
  source={{
    uri: 'https://example.com/playlist.m3u8',
    type: 'hls',
  }}
  // ... other props
/>
```

### 2. Subtitles/Captions

```tsx
<Video
  source={{
    uri: 'https://example.com/video.mp4',
    textTracks: [
      {
        title: 'English',
        language: 'en',
        type: 'vtt',
        uri: 'https://example.com/subtitles/english.vtt',
      },
      {
        title: 'Spanish',
        language: 'es',
        type: 'vtt',
        uri: 'https://example.com/subtitles/spanish.vtt',
      },
    ],
  }}
  selectedTextTrack={{
    type: 'title',
    value: 'English',
  }}
  // ... other props
/>
```

### 3. Multiple Audio Tracks

```tsx
<Video
  source={{
    uri: 'https://example.com/video.mp4',
    audioTracks: [
      {
        title: 'English',
        language: 'en',
        type: 'audio/mp4',
        uri: 'https://example.com/audio/english.mp4',
      },
      {
        title: 'Spanish',
        language: 'es',
        type: 'audio/mp4',
        uri: 'https://example.com/audio/spanish.mp4',
      },
    ],
  }}
  selectedAudioTrack={{
    type: 'title',
    value: 'English',
  }}
  // ... other props
/>
```

### 4. DRM Protected Content

```tsx
<Video
  source={{
    uri: 'https://example.com/drm-protected-video.mp4',
    drm: {
      type: 'widevine',  // or 'playready', 'fairplay'
      licenseServer: 'https://example.com/drm-license-server',
      headers: {
        'Authorization': 'Bearer your-token',
      },
    },
  }}
  // ... other props
/>
```

## Error Handling

```tsx
const onError = (error: any) => {
  console.error('Video error:', error);
  
  // Common error types:
  switch (error.error.code) {
    case 'MEDIA_ERR_ABORTED':
      Alert.alert('Error', 'Video playback was aborted');
      break;
    case 'MEDIA_ERR_NETWORK':
      Alert.alert('Error', 'Network error during video playback');
      break;
    case 'MEDIA_ERR_DECODE':
      Alert.alert('Error', 'Video decoding error');
      break;
    case 'MEDIA_ERR_SRC_NOT_SUPPORTED':
      Alert.alert('Error', 'Video format not supported');
      break;
    default:
      Alert.alert('Error', 'Unknown video error');
  }
};
```

## Performance Optimization

### 1. Preloading

```tsx
<Video
  source={{ uri: 'https://example.com/video.mp4' }}
  paused={true}
  // Preload video metadata
  onLoad={(data) => {
    console.log('Video preloaded:', data);
  }}
  // ... other props
/>
```

### 2. Buffer Configuration

```tsx
// Android buffer optimization
bufferConfig={{
  minBufferMs: 15000,        // Minimum buffer before playback starts
  maxBufferMs: 50000,        // Maximum buffer size
  bufferForPlaybackMs: 2500,  // Buffer required to start playback
  bufferForPlaybackAfterRebufferMs: 5000,  // Buffer required after rebuffering
}}
```

### 3. Memory Management

```tsx
// Disable video when not visible
const [isVisible, setIsVisible] = useState(true);

<Video
  source={{ uri: 'https://example.com/video.mp4' }}
  paused={!isVisible}
  // ... other props
/>
```

## Testing

Run the example:
```bash
# For iOS
npx react-native run-ios

# For Android
npx react-native run-android
```

## Common Issues & Solutions

1. **Video not playing on Android**: Check network permissions and URL accessibility
2. **iOS playback issues**: Ensure proper Info.plist configuration for network requests
3. **Performance issues**: Optimize buffer settings and disable unnecessary features
4. **Fullscreen not working**: Check orientation and navigation setup

## Further Reading

- [react-native-video Documentation](https://github.com/react-native-video/react-native-video)
- [SDK API Reference](./README.md)
- [Platform-Specific Setup](./PLATFORM_SUPPORT.md)