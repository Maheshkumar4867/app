import React, { Component, createRef } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
// Note: These should be installed as peer dependencies
// import Video from 'react-native-video';
// import Orientation from 'react-native-orientation-locker';
// import KeepAwake from 'react-native-keep-awake';

import Controls from '../ui/Controls';
import Overlays from '../ui/Overlays';
import Subtitles from '../ui/Subtitles';
import Thumbnails from '../ui/Thumbnails';
import AdsManager from './AdsManager';
import Logger from '../utils/Logger';
import EventBus from '../utils/EventBus';
import DeviceDetector from '../utils/DeviceDetector';
import { PlayerOptions, VideoLoadData, VideoProgressData, VideoError, VideoBufferData, VideoSeekData } from '../types/PlayerOptions';

interface VideoPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isControlsVisible: boolean;
  selectedAudioTrack: number;
  selectedTextTrack: number;
  videoInfo: VideoLoadData | null;
  error: VideoError | null;
  adPlaying: boolean;
}

export default class VideoPlayer extends Component<PlayerOptions, VideoPlayerState> {
  private videoRef = createRef<any>();
  private controlsTimer?: ReturnType<typeof setTimeout>;
  private adsManager?: AdsManager;
  private eventBus = new EventBus();
  
  constructor(props: PlayerOptions) {
    super(props);
    
    this.state = {
      isPlaying: props.autoPlay || false,
      isPaused: !props.autoPlay,
      isBuffering: false,
      isFullscreen: props.fullscreen || false,
      currentTime: 0,
      duration: 0,
      volume: props.volume || 1.0,
      playbackRate: props.playbackRate || 1.0,
      isControlsVisible: true,
      selectedAudioTrack: 0,
      selectedTextTrack: 0,
      videoInfo: null,
      error: null,
      adPlaying: false,
    };
    
    // Initialize ads manager if ads config is provided
    if (props.ads) {
      this.adsManager = new AdsManager(props.ads);
    }
  }

  componentDidMount() {
    Logger.info('VideoPlayer mounted');
    
    // Set up orientation handling
    if (this.state.isFullscreen) {
      this.enterFullscreen();
    }
    
    // Set up keep awake
    KeepAwake.activate();
    
    // Hide controls after 3 seconds
    this.startControlsTimer();
    
    // Set up event listeners
    this.eventBus.on('adStart', this.handleAdStart);
    this.eventBus.on('adEnd', this.handleAdEnd);
  }

  componentWillUnmount() {
    Logger.info('VideoPlayer unmounting');
    
    // Clean up timers
    if (this.controlsTimer) {
      clearTimeout(this.controlsTimer);
    }
    
    // Clean up ads manager
    if (this.adsManager) {
      this.adsManager.destroy();
    }
    
    // Clean up event listeners
    this.eventBus.off('adStart', this.handleAdStart);
    this.eventBus.off('adEnd', this.handleAdEnd);
    
    // Reset orientation
    if (this.state.isFullscreen) {
      this.exitFullscreen();
    }
    
    // Deactivate keep awake
    KeepAwake.deactivate();
  }

  // Public API methods
  play = () => {
    this.setState({ isPlaying: true, isPaused: false });
    Logger.info('Video play');
  };

  pause = () => {
    this.setState({ isPlaying: false, isPaused: true });
    Logger.info('Video pause');
  };

  stop = () => {
    this.setState({ isPlaying: false, isPaused: true, currentTime: 0 });
    this.seek(0);
    Logger.info('Video stop');
  };

  seek = (time: number) => {
    if (this.videoRef.current) {
      this.videoRef.current.seek(time);
      this.setState({ currentTime: time });
      Logger.info(`Video seek to ${time}s`);
    }
  };

  setVolume = (volume: number) => {
    this.setState({ volume: Math.max(0, Math.min(1, volume)) });
    Logger.info(`Volume set to ${volume}`);
  };

  setPlaybackRate = (rate: number) => {
    this.setState({ playbackRate: rate });
    Logger.info(`Playback rate set to ${rate}`);
  };

  enterFullscreen = () => {
    this.setState({ isFullscreen: true });
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
    
    if (this.props.onFullscreenPlayerWillPresent) {
      this.props.onFullscreenPlayerWillPresent();
    }
    
    Logger.info('Entered fullscreen');
  };

  exitFullscreen = () => {
    this.setState({ isFullscreen: false });
    Orientation.lockToPortrait();
    StatusBar.setHidden(false);
    
    if (this.props.onFullscreenPlayerWillDismiss) {
      this.props.onFullscreenPlayerWillDismiss();
    }
    
    Logger.info('Exited fullscreen');
  };

  getCurrentTime = async (): Promise<number> => {
    return this.state.currentTime;
  };

  getDuration = async (): Promise<number> => {
    return this.state.duration;
  };

  getVideoInfo = async (): Promise<VideoLoadData | null> => {
    return this.state.videoInfo;
  };

  // Event handlers
  private handleLoad = (data: VideoLoadData) => {
    this.setState({
      duration: data.duration,
      videoInfo: data,
      error: null,
    });
    
    Logger.info('Video loaded', data);
    
    if (this.props.onLoad) {
      this.props.onLoad(data);
    }
  };

  private handleProgress = (data: VideoProgressData) => {
    this.setState({
      currentTime: data.currentTime,
    });
    
    if (this.props.onProgress) {
      this.props.onProgress(data);
    }
  };

  private handleEnd = () => {
    this.setState({ isPlaying: false, isPaused: true });
    
    Logger.info('Video ended');
    
    if (this.props.onEnd) {
      this.props.onEnd();
    }
  };

  private handleError = (error: VideoError) => {
    this.setState({ error });
    
    Logger.error('Video error', error);
    
    if (this.props.onError) {
      this.props.onError(error);
    }
  };

  private handleBuffer = (data: VideoBufferData) => {
    this.setState({ isBuffering: data.isBuffering });
    
    if (this.props.onBuffer) {
      this.props.onBuffer(data);
    }
  };

  private handleSeek = (data: VideoSeekData) => {
    this.setState({ currentTime: data.currentTime });
    
    if (this.props.onSeek) {
      this.props.onSeek(data);
    }
  };

  private handleAdStart = () => {
    this.setState({ adPlaying: true });
    Logger.info('Ad started');
  };

  private handleAdEnd = () => {
    this.setState({ adPlaying: false });
    Logger.info('Ad ended');
  };

  // UI interaction handlers
  private togglePlayPause = () => {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  };

  private toggleFullscreen = () => {
    if (this.state.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  };

  private showControls = () => {
    this.setState({ isControlsVisible: true });
    this.startControlsTimer();
  };

  private hideControls = () => {
    this.setState({ isControlsVisible: false });
  };

  private startControlsTimer = () => {
    if (this.controlsTimer) {
      clearTimeout(this.controlsTimer);
    }
    
    this.controlsTimer = setTimeout(() => {
      if (this.state.isPlaying) {
        this.hideControls();
      }
    }, 3000);
  };

  private handleVideoPress = () => {
    if (this.state.isControlsVisible) {
      this.hideControls();
    } else {
      this.showControls();
    }
  };

  render() {
    const {
      source,
      resizeMode = 'contain',
      controls = true,
      subtitles,
      thumbnails,
      style,
      muted,
      loop,
    } = this.props;

    const {
      isPlaying,
      isPaused,
      isBuffering,
      isFullscreen,
      currentTime,
      duration,
      volume,
      playbackRate,
      isControlsVisible,
      selectedTextTrack,
      adPlaying,
    } = this.state;

    const playerStyle = [
      styles.container,
      isFullscreen && styles.fullscreen,
      style,
    ];

    return (
      <View style={playerStyle}>
        <Video
          ref={this.videoRef}
          source={source}
          style={styles.video}
          resizeMode={resizeMode}
          paused={isPaused}
          volume={volume}
          rate={playbackRate}
          muted={muted}
          repeat={loop}
          onLoad={this.handleLoad}
          onProgress={this.handleProgress}
          onEnd={this.handleEnd}
          onError={this.handleError}
          onBuffer={this.handleBuffer}
          onSeek={this.handleSeek}
          onPress={this.handleVideoPress}
          progressUpdateInterval={250}
        />
        
        {/* Overlays */}
        <Overlays style={styles.overlays}>
          {/* Subtitles */}
          {subtitles && subtitles.length > 0 && (
            <Subtitles
              tracks={subtitles}
              currentTrack={selectedTextTrack}
              style={styles.subtitles}
            />
          )}
          
          {/* Thumbnails */}
          {thumbnails && (
            <Thumbnails
              config={thumbnails}
              currentTime={currentTime}
              style={styles.thumbnails}
            />
          )}
          
          {/* Controls */}
          {controls && isControlsVisible && !adPlaying && (
            <Controls
              onPlay={this.play}
              onPause={this.pause}
              onSeek={this.seek}
              onFullscreen={this.toggleFullscreen}
              duration={duration}
              currentTime={currentTime}
              isPlaying={isPlaying}
              isFullscreen={isFullscreen}
              style={styles.controls}
            />
          )}
        </Overlays>
        
        {/* Loading indicator */}
        {isBuffering && (
          <View style={styles.loadingOverlay}>
            {/* Add your loading spinner here */}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  video: {
    flex: 1,
  },
  overlays: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  subtitles: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },
  thumbnails: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});