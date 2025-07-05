# React Native Video Player SDK

A comprehensive React Native video player SDK for **Android and iOS** with advanced features including HLS/DASH streaming, ads management, subtitles, thumbnails, and TV navigation support.

> ⚠️ **Platform Support**: This SDK is specifically designed for React Native mobile applications (Android & iOS). It is **not** for web browsers. For web video players, please use a different solution.

## Built on react-native-video

This SDK is built on top of the popular [`react-native-video`](https://github.com/react-native-video/react-native-video) library, which provides the core video playback functionality. The SDK enhances react-native-video with:

- **Additional Features**: Ads, subtitles, thumbnails, analytics, and TV navigation
- **Enhanced API**: Simplified and consistent API across platforms
- **Device Optimization**: Automatic device detection and optimization
- **Advanced Streaming**: Better HLS/DASH support with automatic quality selection
- **Easy Integration**: Plug-and-play components with sensible defaults

**You can use this SDK in two ways:**
1. **Direct react-native-video usage**: For basic video playback with full control
2. **Enhanced SDK components**: For advanced features with minimal setup

📖 **[Complete react-native-video Usage Guide](./REACT_NATIVE_VIDEO_USAGE.md)** - Learn how to use react-native-video directly or with SDK enhancements

## Features

### Core Video Playback
- **Multi-format Support**: MP4, WebM, HLS, DASH streaming
- **Adaptive Streaming**: Automatic quality adjustment based on network conditions
- **Playback Controls**: Play, pause, seek, volume, playback rate control
- **Fullscreen Support**: Native fullscreen with orientation handling

### Advanced Features
- **Advertisements**: Pre-roll, mid-roll, post-roll ad support
- **Subtitles**: WebVTT, SRT, TTML subtitle support with styling
- **Thumbnails**: Video thumbnail preview during scrubbing
- **TV Navigation**: Apple TV and Android TV remote control support
- **Device Detection**: Automatic device type and capability detection
- **DRM Support**: Widevine, PlayReady, and FairPlay integration
- **Analytics**: Built-in analytics and event tracking

### Audio Features
- **Dolby Support**: Dolby Digital, Dolby Atmos detection and support
- **Codec Detection**: Automatic audio/video codec capability detection
- **Multi-channel Audio**: Support for stereo, 5.1, 7.1 surround sound

## Installation

```bash
npm install react-native-video-player-sdk
```

### Complete Setup Guide

For detailed installation instructions including platform-specific setup, peer dependencies, and configuration:

**📱 [React Native Setup Guide](./REACT_NATIVE_SETUP.md)** - Complete guide for Android & iOS

### Quick Peer Dependencies

```bash
npm install react-native-video react-native-orientation-locker react-native-keep-awake react-native-device-info react-native-linear-gradient react-native-gesture-handler react-native-reanimated react-native-svg
```

> **Important**: After installing dependencies, you'll need to run platform-specific setup for iOS (pod install) and Android (gradle sync). See the setup guide for details.

## Quick Start

### Basic Usage

```jsx
import React from 'react';
import { VideoPlayer } from 'react-native-video-player-sdk';

const MyVideoPlayer = () => {
  return (
    <VideoPlayer
      source={{
        uri: 'https://example.com/video.mp4',
        type: 'mp4'
      }}
      autoPlay={false}
      controls={true}
      style={{ flex: 1 }}
      onLoad={(data) => console.log('Video loaded:', data)}
      onProgress={(data) => console.log('Progress:', data)}
      onEnd={() => console.log('Video ended')}
    />
  );
};

export default MyVideoPlayer;
```

### HLS Streaming

```jsx
import { VideoPlayer, HLSPlayer } from 'react-native-video-player-sdk';

const HLSVideoPlayer = () => {
  return (
    <VideoPlayer
      source={{
        uri: 'https://example.com/playlist.m3u8',
        type: 'hls'
      }}
      autoPlay={true}
      controls={true}
      onLoad={(data) => {
        console.log('HLS stream loaded:', data);
      }}
    />
  );
};
```

### With Advertisements

```jsx
import { VideoPlayer } from 'react-native-video-player-sdk';

const VideoWithAds = () => {
  return (
    <VideoPlayer
      source={{
        uri: 'https://example.com/video.mp4',
        type: 'mp4'
      }}
      ads={{
        preroll: ['https://example.com/preroll-ad.mp4'],
        midroll: [
          { time: 300, ads: ['https://example.com/midroll-ad.mp4'] }
        ],
        postroll: ['https://example.com/postroll-ad.mp4']
      }}
      controls={true}
    />
  );
};
```

### With Subtitles

```jsx
import { VideoPlayer } from 'react-native-video-player-sdk';

const VideoWithSubtitles = () => {
  return (
    <VideoPlayer
      source={{
        uri: 'https://example.com/video.mp4',
        type: 'mp4'
      }}
      subtitles={[
        {
          title: 'English',
          language: 'en',
          type: 'vtt',
          uri: 'https://example.com/subtitles-en.vtt'
        },
        {
          title: 'Spanish',
          language: 'es',
          type: 'vtt',
          uri: 'https://example.com/subtitles-es.vtt'
        }
      ]}
      controls={true}
    />
  );
};
```

### TV Navigation

```jsx
import { VideoPlayer, TVNavigation } from 'react-native-video-player-sdk';

const TVVideoPlayer = () => {
  return (
    <>
      <VideoPlayer
        source={{
          uri: 'https://example.com/video.mp4',
          type: 'mp4'
        }}
        controls={true}
        fullscreen={true}
      />
      <TVNavigation
        onNavigate={(direction) => console.log('Navigate:', direction)}
        onSelect={() => console.log('Select pressed')}
        onPlayPause={() => console.log('Play/Pause pressed')}
      />
    </>
  );
};
```

## API Reference

### VideoPlayer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `VideoSource` | Required | Video source configuration |
| `autoPlay` | `boolean` | `false` | Start playback automatically |
| `loop` | `boolean` | `false` | Loop video playback |
| `muted` | `boolean` | `false` | Start video muted |
| `volume` | `number` | `1.0` | Initial volume (0-1) |
| `playbackRate` | `number` | `1.0` | Initial playback rate (0.5-2.0) |
| `resizeMode` | `string` | `'contain'` | Video resize mode |
| `fullscreen` | `boolean` | `false` | Start in fullscreen |
| `controls` | `boolean` | `true` | Show player controls |
| `subtitles` | `SubtitleTrack[]` | `[]` | Subtitle tracks |
| `thumbnails` | `ThumbnailConfig` | `undefined` | Thumbnail configuration |
| `ads` | `AdsConfig` | `undefined` | Advertisement configuration |
| `analytics` | `AnalyticsConfig` | `undefined` | Analytics configuration |
| `drm` | `DRMConfig` | `undefined` | DRM configuration |

### VideoPlayer Methods

```jsx
const playerRef = useRef();

// Playback control
playerRef.current.play();
playerRef.current.pause();
playerRef.current.stop();
playerRef.current.seek(time);

// Volume control
playerRef.current.setVolume(0.5);
playerRef.current.setPlaybackRate(1.5);

// Fullscreen control
playerRef.current.enterFullscreen();
playerRef.current.exitFullscreen();

// Get video information
const currentTime = await playerRef.current.getCurrentTime();
const duration = await playerRef.current.getDuration();
const videoInfo = await playerRef.current.getVideoInfo();
```

### Events

```jsx
<VideoPlayer
  onLoad={(data) => {
    // Video metadata loaded
    console.log('Duration:', data.duration);
    console.log('Natural size:', data.naturalSize);
    console.log('Audio tracks:', data.audioTracks);
    console.log('Text tracks:', data.textTracks);
  }}
  onProgress={(data) => {
    // Playback progress update
    console.log('Current time:', data.currentTime);
    console.log('Playable duration:', data.playableDuration);
  }}
  onBuffer={(data) => {
    // Buffering state change
    console.log('Is buffering:', data.isBuffering);
  }}
  onSeek={(data) => {
    // Seek completed
    console.log('Seeked to:', data.currentTime);
  }}
  onEnd={() => {
    // Video playback ended
    console.log('Video ended');
  }}
  onError={(error) => {
    // Playback error
    console.error('Video error:', error);
  }}
  onFullscreenPlayerWillPresent={() => {
    console.log('Entering fullscreen');
  }}
  onFullscreenPlayerDidDismiss={() => {
    console.log('Exited fullscreen');
  }}
/>
```

## Utility Classes

### Device Detection

```jsx
import { DeviceDetector } from 'react-native-video-player-sdk';

const deviceType = DeviceDetector.getDeviceType(); // 'phone' | 'tablet' | 'tv'
const isTV = DeviceDetector.isTV();
const orientation = DeviceDetector.getOrientation(); // 'portrait' | 'landscape'
```

### Codec Detection

```jsx
import { CodecDetector } from 'react-native-video-player-sdk';

const supportedCodecs = CodecDetector.getSupportedCodecs();
const isH264Supported = CodecDetector.isSupported('avc1');
const bestVideoCodec = CodecDetector.getBestVideoCodec();
```

### Dolby Support

```jsx
import { DolbyDetector } from 'react-native-video-player-sdk';

const isDolbySupported = DolbyDetector.isDolbySupported();
const dolbyCapabilities = DolbyDetector.getDolbyCapabilities();
const bestDolbyFormat = DolbyDetector.getBestDolbyFormat();
```

### Source Selection

```jsx
import { SourceSelector } from 'react-native-video-player-sdk';

const sources = [
  { uri: 'video.m3u8', type: 'hls' },
  { uri: 'video.mpd', type: 'dash' },
  { uri: 'video.mp4', type: 'mp4' }
];

const bestSource = SourceSelector.selectBestSource(sources);
const supportedSources = SourceSelector.filterSupportedSources(sources);
```

## Configuration

### Default Settings

```jsx
import { PlayerConfig } from 'react-native-video-player-sdk';

// Set global defaults
PlayerConfig.setDefaults({
  volume: 0.8,
  autoPlay: false,
  controls: true,
  analytics: {
    enabled: true,
    provider: 'custom'
  }
});

// Get device-specific configuration
const tvConfig = PlayerConfig.getConfigForDevice('tv');
const phoneConfig = PlayerConfig.getConfigForDevice('phone');
```

### Environment Configuration

```jsx
import { PlayerConfig } from 'react-native-video-player-sdk';

// Development environment
const devConfig = PlayerConfig.getEnvironmentConfig('development');

// Production environment
const prodConfig = PlayerConfig.getEnvironmentConfig('production');
```

## Advanced Usage

### Custom Player Engine

```jsx
import { HLSPlayer, DASHPlayer, NativePlayer } from 'react-native-video-player-sdk';

// Use specific player engines
const hlsPlayer = new HLSPlayer(options);
const dashPlayer = new DASHPlayer(options);
const nativePlayer = new NativePlayer(options);

// Load and play
await hlsPlayer.load(source);
hlsPlayer.play();
```

### Custom Controls

```jsx
import { VideoPlayer, Controls } from 'react-native-video-player-sdk';

const CustomVideoPlayer = () => {
  return (
    <VideoPlayer
      source={{ uri: 'video.mp4', type: 'mp4' }}
      controls={false} // Disable default controls
    >
      <Controls
        onPlay={() => console.log('Play')}
        onPause={() => console.log('Pause')}
        onSeek={(time) => console.log('Seek to:', time)}
        onFullscreen={() => console.log('Fullscreen')}
        duration={duration}
        currentTime={currentTime}
        isPlaying={isPlaying}
        isFullscreen={isFullscreen}
        style={{ position: 'absolute', bottom: 0 }}
      />
    </VideoPlayer>
  );
};
```

### Analytics Integration

```jsx
<VideoPlayer
  source={{ uri: 'video.mp4', type: 'mp4' }}
  analytics={{
    enabled: true,
    provider: 'google',
    config: {
      trackingId: 'GA_TRACKING_ID',
      enableQualityTracking: true,
      enableBufferTracking: true,
      enableErrorTracking: true
    }
  }}
/>
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```tsx
import { VideoPlayer, PlayerOptions, VideoSource } from 'react-native-video-player-sdk';

interface MyPlayerProps {
  source: VideoSource;
  onVideoEnd: () => void;
}

const MyPlayer: React.FC<MyPlayerProps> = ({ source, onVideoEnd }) => {
  const playerOptions: PlayerOptions = {
    source,
    autoPlay: false,
    controls: true,
    onEnd: onVideoEnd
  };

  return <VideoPlayer {...playerOptions} />;
};
```

## Troubleshooting

### Common Issues

1. **Video not playing on Android**
   - Ensure `react-native-video` is properly linked
   - Check network security config for HTTP sources

2. **Fullscreen not working**
   - Verify `react-native-orientation-locker` is installed
   - Check platform-specific fullscreen permissions

3. **Subtitles not displaying**
   - Ensure subtitle URLs are accessible
   - Check subtitle format (WebVTT recommended)

4. **TV navigation not responding**
   - Verify `TVEventHandler` is available on the platform
   - Check TV remote control configuration

### Debug Logging

```jsx
import { Logger } from 'react-native-video-player-sdk';

// Enable debug logging
Logger.setLogLevel(0); // DEBUG level

// Set custom prefix
Logger.setPrefix('[MyApp]');
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Documentation: [Full Documentation](https://docs.example.com)
- 💬 Discord: [Join our Discord](https://discord.gg/example)
