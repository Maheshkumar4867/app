/**
 * React Native Video Player SDK Usage Example
 * 
 * This example shows how to properly integrate the video player SDK
 * in a React Native application for Android and iOS.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';

// Import the video player SDK
import { 
  VideoPlayer,
  DeviceDetector,
  CodecDetector,
  DolbyDetector,
  SourceSelector,
  PlayerConfig,
  Logger 
} from 'react-native-video-player-sdk';

// Type imports
import type {
  VideoLoadData,
  VideoProgressData,
  VideoError,
  VideoSource,
  SubtitleTrack,
  AdsConfig,
} from 'react-native-video-player-sdk';

const ReactNativeVideoExample = () => {
  const playerRef = useRef<VideoPlayer>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeVideoPlayer();
  }, []);

  const initializeVideoPlayer = async () => {
    try {
      // Enable debug logging in development
      if (__DEV__) {
        Logger.setLogLevel(0); // DEBUG level
        Logger.setPrefix('[VideoPlayer]');
      }

      // Detect device capabilities
      const device = await DeviceDetector.getDeviceInfo();
      const codecs = CodecDetector.getSupportedCodecs();
      const dolby = DolbyDetector.getDolbyCapabilities();

      const info = {
        device,
        supportedCodecs: codecs,
        dolbyCapabilities: dolby,
        screenSize: Dimensions.get('window'),
        platform: Platform.OS,
      };

      setDeviceInfo(info);
      Logger.info('Device capabilities detected', info);

      // Configure player based on device
      const deviceConfig = PlayerConfig.getConfigForDevice(device.deviceType);
      PlayerConfig.setDefaults(deviceConfig);

      // Select the best video source for this device
      const availableSources: VideoSource[] = [
        // HLS stream - best for adaptive streaming
        {
          uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          type: 'hls',
        },
        // DASH stream - alternative adaptive streaming
        {
          uri: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
          type: 'dash',
        },
        // MP4 fallback - works everywhere
        {
          uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          type: 'mp4',
        },
      ];

      // Filter to only supported sources
      const supportedSources = SourceSelector.filterSupportedSources(availableSources);
      const bestSource = SourceSelector.selectBestSource(supportedSources);

      setSelectedSource(bestSource);
      setIsReady(true);

      Logger.info('Selected video source', bestSource);

    } catch (error) {
      Logger.error('Failed to initialize video player', error);
      Alert.alert('Initialization Error', 'Failed to initialize video player');
    }
  };

  // Subtitle configuration
  const subtitleTracks: SubtitleTrack[] = [
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
  ];

  // Advertisement configuration
  const adsConfig: AdsConfig = {
    preroll: ['https://example.com/ads/preroll.mp4'],
    midroll: [
      { time: 120, ads: ['https://example.com/ads/midroll1.mp4'] },
      { time: 300, ads: ['https://example.com/ads/midroll2.mp4'] },
    ],
    postroll: ['https://example.com/ads/postroll.mp4'],
  };

  // Event handlers
  const handleVideoLoad = (data: VideoLoadData) => {
    Logger.info('Video loaded successfully', data);
    
    Alert.alert(
      'Video Ready',
      `Title: Big Buck Bunny
Duration: ${Math.round(data.duration / 60)} minutes
Resolution: ${data.naturalSize.width}x${data.naturalSize.height}
Device: ${deviceInfo?.device.deviceType}
Platform: ${Platform.OS}`,
      [{ text: 'Start Watching' }]
    );
  };

  const handleVideoProgress = (data: VideoProgressData) => {
    // Update progress UI or send analytics
    const progressPercent = (data.currentTime / data.playableDuration) * 100;
    Logger.debug(`Video progress: ${progressPercent.toFixed(1)}%`);
  };

  const handleVideoEnd = () => {
    Logger.info('Video playback completed');
    Alert.alert('Thanks for Watching!', 'Video playback completed.', [
      { text: 'Watch Again', onPress: () => playerRef.current?.seek(0) },
      { text: 'Close', style: 'cancel' },
    ]);
  };

  const handleVideoError = (error: VideoError) => {
    Logger.error('Video playback error', error);
    
    Alert.alert(
      'Playback Error',
      `An error occurred while playing the video:\n${error.error.localizedDescription}`,
      [
        { text: 'Retry', onPress: () => {/* Implement retry logic */} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleBuffering = (data: { isBuffering: boolean }) => {
    Logger.debug(`Video buffering: ${data.isBuffering}`);
    // Show/hide loading spinner
  };

  // Get player style based on device
  const getPlayerStyle = () => {
    const baseStyle = styles.player;
    
    if (deviceInfo?.device.isTV) {
      return [baseStyle, styles.playerTV];
    }
    
    if (deviceInfo?.device.isTablet) {
      return [baseStyle, styles.playerTablet];
    }
    
    return [baseStyle, styles.playerPhone];
  };

  if (!isReady || !selectedSource) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          {/* Add your loading component here */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#000" 
        hidden={deviceInfo?.device.isTV}
      />
      
      <View style={styles.playerContainer}>
        <VideoPlayer
          ref={playerRef}
          source={selectedSource}
          style={getPlayerStyle()}
          
          // Playback settings
          autoPlay={false}
          loop={false}
          muted={false}
          volume={deviceInfo?.device.isTV ? 1.0 : 0.8}
          playbackRate={1.0}
          resizeMode="contain"
          
          // UI settings
          fullscreen={deviceInfo?.device.isTV}
          controls={true}
          
          // Content settings
          subtitles={subtitleTracks}
          ads={adsConfig}
          
          // Thumbnail preview during scrubbing
          thumbnails={{
            uri: 'https://example.com/thumbnails/bbb_{index}.jpg',
            width: 160,
            height: 90,
            interval: 10, // Every 10 seconds
          }}
          
          // Analytics configuration
          analytics={{
            enabled: !__DEV__, // Disable in development
            provider: 'custom',
            config: {
              enableQualityTracking: true,
              enableBufferTracking: true,
              enableErrorTracking: true,
              enableAdTracking: true,
              sessionId: `session_${Date.now()}`,
              userId: 'user123',
              contentId: 'big_buck_bunny',
              deviceInfo: deviceInfo?.device,
            },
          }}
          
          // Event handlers
          onLoad={handleVideoLoad}
          onProgress={handleVideoProgress}
          onEnd={handleVideoEnd}
          onError={handleVideoError}
          onBuffer={handleBuffering}
          onSeek={(data) => {
            Logger.info(`User seeked to ${data.currentTime}s`);
          }}
          onFullscreenPlayerWillPresent={() => {
            Logger.info('Entering fullscreen mode');
          }}
          onFullscreenPlayerDidDismiss={() => {
            Logger.info('Exited fullscreen mode');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  player: {
    width: '100%',
    backgroundColor: '#000',
  },
  playerPhone: {
    height: 220,
  },
  playerTablet: {
    height: 300,
  },
  playerTV: {
    height: '100%',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReactNativeVideoExample;