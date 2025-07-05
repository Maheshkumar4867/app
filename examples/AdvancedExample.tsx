import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, StatusBar } from 'react-native';
import { 
  VideoPlayer, 
  DeviceDetector, 
  PlayerConfig,
  SourceSelector,
  CodecDetector,
  DolbyDetector 
} from 'react-native-video-player-sdk';
import type { 
  VideoLoadData, 
  VideoProgressData, 
  VideoError, 
  VideoSource,
  SubtitleTrack,
  AdsConfig 
} from 'react-native-video-player-sdk';

const AdvancedExample = () => {
  const playerRef = useRef<VideoPlayer>(null);
  const [deviceCapabilities, setDeviceCapabilities] = useState<any>(null);
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);

  useEffect(() => {
    initializePlayer();
  }, []);

  const initializePlayer = async () => {
    // Detect device capabilities
    const deviceInfo = await DeviceDetector.getDeviceInfo();
    const supportedCodecs = CodecDetector.getSupportedCodecs();
    const dolbyCapabilities = DolbyDetector.getDolbyCapabilities();
    
    const capabilities = {
      device: deviceInfo,
      codecs: supportedCodecs,
      dolby: dolbyCapabilities,
    };
    
    setDeviceCapabilities(capabilities);
    console.log('Device capabilities:', capabilities);

    // Configure player based on device
    const deviceConfig = PlayerConfig.getConfigForDevice(deviceInfo.deviceType);
    PlayerConfig.setDefaults(deviceConfig);

    // Select best source based on device capabilities
    const availableSources: VideoSource[] = [
      {
        uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        type: 'hls'
      },
      {
        uri: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
        type: 'dash'
      },
      {
        uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'mp4'
      }
    ];

    const bestSource = SourceSelector.selectBestSource(availableSources);
    setSelectedSource(bestSource);
    console.log('Selected source:', bestSource);
  };

  const subtitleTracks: SubtitleTrack[] = [
    {
      title: 'English',
      language: 'en',
      type: 'vtt',
      uri: 'https://example.com/subtitles/english.vtt'
    },
    {
      title: 'Spanish',
      language: 'es',
      type: 'vtt',
      uri: 'https://example.com/subtitles/spanish.vtt'
    }
  ];

  const adsConfig: AdsConfig = {
    preroll: ['https://example.com/ads/preroll.mp4'],
    midroll: [
      {
        time: 60, // 1 minute
        ads: ['https://example.com/ads/midroll1.mp4']
      },
      {
        time: 180, // 3 minutes
        ads: ['https://example.com/ads/midroll2.mp4']
      }
    ],
    postroll: ['https://example.com/ads/postroll.mp4']
  };

  const handleLoad = (data: VideoLoadData) => {
    console.log('Video loaded:', data);
    
    // Show device and video information
    Alert.alert(
      'Video Information',
      `Duration: ${Math.round(data.duration)} seconds
Resolution: ${data.naturalSize.width}x${data.naturalSize.height}
Orientation: ${data.naturalSize.orientation}
Audio Tracks: ${data.audioTracks.length}
Text Tracks: ${data.textTracks.length}
Device: ${deviceCapabilities?.device.deviceType}`,
      [{ text: 'OK' }]
    );
  };

  const handleProgress = (data: VideoProgressData) => {
    // Update analytics or UI based on progress
    console.log(`Progress: ${data.currentTime}/${data.playableDuration}`);
  };

  const handleEnd = () => {
    console.log('Video ended');
    Alert.alert('Playback Complete', 'Thank you for watching!', [{ text: 'OK' }]);
  };

  const handleError = (error: VideoError) => {
    console.error('Video error:', error);
    
    // Try fallback source if available
    if (selectedSource?.type !== 'mp4') {
      console.log('Attempting fallback to MP4...');
      setSelectedSource({
        uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'mp4'
      });
    } else {
      Alert.alert(
        'Playback Error',
        `Unable to play video: ${error.error.localizedDescription}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleBuffer = (data: { isBuffering: boolean }) => {
    console.log(`Buffering: ${data.isBuffering}`);
    // Show/hide loading indicator
  };

  const handleAnalyticsEvent = (event: string, data: any) => {
    console.log(`Analytics event: ${event}`, data);
    
    // Send to analytics service
    // Example: Analytics.track(event, data);
  };

  if (!selectedSource) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          {/* Loading indicator */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.playerContainer}>
        <VideoPlayer
          ref={playerRef}
          source={selectedSource}
          style={styles.player}
          autoPlay={false}
          loop={false}
          muted={false}
          volume={1.0}
          playbackRate={1.0}
          resizeMode="contain"
          fullscreen={deviceCapabilities?.device.deviceType === 'tv'}
          controls={true}
          subtitles={subtitleTracks}
          ads={adsConfig}
          thumbnails={{
            uri: 'https://example.com/thumbnails/video_{index}.jpg',
            width: 160,
            height: 90,
            interval: 10
          }}
          analytics={{
            enabled: true,
            provider: 'custom',
            config: {
              enableQualityTracking: true,
              enableBufferTracking: true,
              enableErrorTracking: true,
              enableAdTracking: true,
              customData: {
                contentId: 'advanced_example_video',
                userId: 'user123',
                deviceType: deviceCapabilities?.device.deviceType
              }
            }
          }}
          drm={selectedSource.drm}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onEnd={handleEnd}
          onError={handleError}
          onBuffer={handleBuffer}
          onSeek={(data) => {
            console.log('Seeked to:', data.currentTime);
            handleAnalyticsEvent('seek', { position: data.currentTime });
          }}
          onFullscreenPlayerWillPresent={() => {
            console.log('Entering fullscreen');
            handleAnalyticsEvent('fullscreen_enter', {});
          }}
          onFullscreenPlayerDidDismiss={() => {
            console.log('Exiting fullscreen');
            handleAnalyticsEvent('fullscreen_exit', {});
          }}
        />
      </View>

      {/* Device capabilities info could be displayed here */}
      {deviceCapabilities && (
        <View style={styles.info}>
          {/* Display device info, supported codecs, etc. */}
        </View>
      )}
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
    height: '60%',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default AdvancedExample;