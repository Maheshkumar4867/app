/**
 * React Native Video Examples
 * Demonstrates direct usage of react-native-video and SDK integration
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Text,
  Slider,
  Dimensions,
} from 'react-native';

// Direct import from react-native-video
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import KeepAwake from 'react-native-keep-awake';

// SDK imports for enhanced features
import { 
  VideoPlayer as SDKVideoPlayer,
  DeviceDetector,
  CodecDetector,
  Logger 
} from 'react-native-video-player-sdk';

// Type imports
import type {
  OnLoadData,
  OnProgressData,
  OnSeekData,
  VideoRef,
} from 'react-native-video';

const ReactNativeVideoExamples = () => {
  const [showBasicExample, setShowBasicExample] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Toggle between examples */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showBasicExample && styles.activeButton]}
          onPress={() => setShowBasicExample(true)}
        >
          <Text style={styles.toggleText}>Basic react-native-video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !showBasicExample && styles.activeButton]}
          onPress={() => setShowBasicExample(false)}
        >
          <Text style={styles.toggleText}>Enhanced SDK</Text>
        </TouchableOpacity>
      </View>

      {showBasicExample ? <BasicVideoExample /> : <EnhancedSDKExample />}
    </SafeAreaView>
  );
};

// Example 1: Direct react-native-video usage
const BasicVideoExample = () => {
  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(1.0);
  const [fullscreen, setFullscreen] = useState(false);
  const [resizeMode, setResizeMode] = useState<'contain' | 'cover' | 'stretch'>('contain');

  useEffect(() => {
    // Keep screen awake during video playback
    if (!paused) {
      KeepAwake.activate();
    } else {
      KeepAwake.deactivate();
    }

    return () => KeepAwake.deactivate();
  }, [paused]);

  // react-native-video event handlers
  const onLoad = (data: OnLoadData) => {
    console.log('Video loaded:', data);
    setDuration(data.duration);
    
    Alert.alert(
      'Video Loaded',
      `Duration: ${Math.round(data.duration)} seconds\nSize: ${data.naturalSize.width}x${data.naturalSize.height}`,
      [{ text: 'OK' }]
    );
  };

  const onProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);
  };

  const onEnd = () => {
    console.log('Video ended');
    setPaused(true);
    setCurrentTime(0);
    Alert.alert('Video Ended', 'Playback completed!');
  };

  const onError = (error: any) => {
    console.error('Video error:', error);
    Alert.alert('Error', `Video error: ${error.error.localizedDescription}`);
  };

  const onSeek = (data: OnSeekData) => {
    console.log('Seeked to:', data.currentTime);
    setCurrentTime(data.currentTime);
  };

  const onBuffer = (data: { isBuffering: boolean }) => {
    console.log('Buffering:', data.isBuffering);
  };

  // Control functions
  const togglePlayPause = () => {
    setPaused(!paused);
  };

  const seekTo = (time: number) => {
    videoRef.current?.seek(time);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      setFullscreen(true);
      Orientation.lockToLandscape();
      StatusBar.setHidden(true, 'fade');
    } else {
      setFullscreen(false);
      Orientation.lockToPortrait();
      StatusBar.setHidden(false, 'fade');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.exampleContainer}>
      <Text style={styles.title}>Basic react-native-video Usage</Text>
      
      {/* Video Player */}
      <View style={[styles.videoContainer, fullscreen && styles.fullscreenVideo]}>
        <Video
          ref={videoRef}
          source={{
            uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          }}
          style={styles.video}
          paused={paused}
          volume={volume}
          rate={rate}
          resizeMode={resizeMode}
          onLoad={onLoad}
          onProgress={onProgress}
          onEnd={onEnd}
          onError={onError}
          onSeek={onSeek}
          onBuffer={onBuffer}
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

        {/* Custom Controls Overlay */}
        <View style={styles.controlsOverlay}>
          {/* Play/Pause Button */}
          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <Text style={styles.playButtonText}>{paused ? '▶️' : '⏸️'}</Text>
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Slider
              style={styles.progressSlider}
              value={currentTime}
              minimumValue={0}
              maximumValue={duration}
              minimumTrackTintColor="#FF0000"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbStyle={{ backgroundColor: '#FF0000' }}
              onValueChange={seekTo}
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Fullscreen Button */}
          <TouchableOpacity style={styles.fullscreenButton} onPress={toggleFullscreen}>
            <Text style={styles.controlButtonText}>⛶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Additional Controls */}
      {!fullscreen && (
        <View style={styles.additionalControls}>
          {/* Volume Control */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Volume:</Text>
            <Slider
              style={styles.controlSlider}
              value={volume}
              minimumValue={0}
              maximumValue={1}
              onValueChange={setVolume}
            />
            <Text style={styles.controlValue}>{Math.round(volume * 100)}%</Text>
          </View>

          {/* Playback Rate */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Speed:</Text>
            <Slider
              style={styles.controlSlider}
              value={rate}
              minimumValue={0.5}
              maximumValue={2}
              step={0.25}
              onValueChange={setRate}
            />
            <Text style={styles.controlValue}>{rate}x</Text>
          </View>

          {/* Resize Mode */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Resize:</Text>
            <TouchableOpacity
              style={styles.resizeModeButton}
              onPress={() => {
                const modes: ('contain' | 'cover' | 'stretch')[] = ['contain', 'cover', 'stretch'];
                const currentIndex = modes.indexOf(resizeMode);
                const nextIndex = (currentIndex + 1) % modes.length;
                setResizeMode(modes[nextIndex]);
              }}
            >
              <Text style={styles.resizeModeText}>{resizeMode}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Example 2: Enhanced SDK usage
const EnhancedSDKExample = () => {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    initializeDeviceInfo();
  }, []);

  const initializeDeviceInfo = async () => {
    try {
      const device = await DeviceDetector.getDeviceInfo();
      const codecs = CodecDetector.getSupportedCodecs();
      
      setDeviceInfo({
        device,
        supportedCodecs: codecs.length,
        platform: Platform.OS,
      });
    } catch (error) {
      Logger.error('Failed to get device info', error);
    }
  };

  return (
    <View style={styles.exampleContainer}>
      <Text style={styles.title}>Enhanced SDK with react-native-video</Text>
      
      {/* Device Information */}
      {deviceInfo && (
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoText}>
            Device: {deviceInfo.device?.deviceType} | 
            Platform: {deviceInfo.platform} | 
            Codecs: {deviceInfo.supportedCodecs}
          </Text>
        </View>
      )}

      {/* Enhanced Video Player with SDK */}
      <SDKVideoPlayer
        source={{
          uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          type: 'hls',
        }}
        style={styles.sdkVideo}
        autoPlay={false}
        controls={true}
        volume={0.8}
        resizeMode="contain"
        
        // SDK Enhanced Features
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
            'SDK Enhanced Video Loaded',
            `Duration: ${Math.round(data.duration)} seconds\nFeatures: Ads, Subtitles, Analytics`,
            [{ text: 'Great!' }]
          );
        }}
        
        onProgress={(data) => {
          // Enhanced progress tracking with analytics
          Logger.debug(`Progress: ${data.currentTime}/${data.playableDuration}`);
        }}
        
        onError={(error) => {
          Alert.alert('SDK Error', `Enhanced error handling: ${error.error.localizedDescription}`);
        }}
      />

      {/* SDK Features Info */}
      <View style={styles.featuresInfo}>
        <Text style={styles.featuresTitle}>SDK Enhanced Features:</Text>
        <Text style={styles.featureItem}>✅ Automatic device optimization</Text>
        <Text style={styles.featureItem}>✅ HLS/DASH adaptive streaming</Text>
        <Text style={styles.featureItem}>✅ Advertisement integration</Text>
        <Text style={styles.featureItem}>✅ Subtitle support</Text>
        <Text style={styles.featureItem}>✅ Analytics tracking</Text>
        <Text style={styles.featureItem}>✅ Thumbnail previews</Text>
        <Text style={styles.featureItem}>✅ Codec detection</Text>
        <Text style={styles.featureItem}>✅ Error handling</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#FF0000',
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  exampleContainer: {
    flex: 1,
    padding: 10,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  videoContainer: {
    height: 200,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  fullscreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: Dimensions.get('window').height,
    zIndex: 1000,
  },
  video: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  playButton: {
    padding: 10,
  },
  playButtonText: {
    fontSize: 20,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    minWidth: 35,
    textAlign: 'center',
  },
  fullscreenButton: {
    padding: 10,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
  },
  additionalControls: {
    marginTop: 20,
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 15,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  controlLabel: {
    color: 'white',
    width: 60,
    fontSize: 14,
  },
  controlSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  controlValue: {
    color: 'white',
    width: 40,
    textAlign: 'right',
    fontSize: 14,
  },
  resizeModeButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  resizeModeText: {
    color: 'white',
  },
  deviceInfo: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  deviceInfoText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  sdkVideo: {
    height: 220,
    borderRadius: 10,
  },
  featuresInfo: {
    marginTop: 20,
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 15,
  },
  featuresTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featureItem: {
    color: '#90EE90',
    fontSize: 14,
    marginBottom: 5,
  },
});

export default ReactNativeVideoExamples;