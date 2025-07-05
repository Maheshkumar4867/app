import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, StatusBar } from 'react-native';
import { VideoPlayer } from 'react-native-video-player-sdk';
import type { VideoLoadData, VideoProgressData, VideoError } from 'react-native-video-player-sdk';

const BasicExample = () => {
  const playerRef = useRef<VideoPlayer>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleLoad = (data: VideoLoadData) => {
    console.log('Video loaded:', data);
    setDuration(data.duration);
    
    Alert.alert(
      'Video Loaded',
      `Duration: ${Math.round(data.duration)} seconds\nResolution: ${data.naturalSize.width}x${data.naturalSize.height}`,
      [{ text: 'OK' }]
    );
  };

  const handleProgress = (data: VideoProgressData) => {
    setCurrentTime(data.currentTime);
  };

  const handleEnd = () => {
    console.log('Video ended');
    setIsPlaying(false);
    Alert.alert('Video Ended', 'The video has finished playing.', [{ text: 'OK' }]);
  };

  const handleError = (error: VideoError) => {
    console.error('Video error:', error);
    Alert.alert(
      'Playback Error',
      `An error occurred: ${error.error.localizedDescription}`,
      [{ text: 'OK' }]
    );
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (seconds: number) => {
    if (playerRef.current) {
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
      playerRef.current.seek(newTime);
    }
  };

  const handleVolumeChange = (volume: number) => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  };

  const handleFullscreen = () => {
    if (playerRef.current) {
      playerRef.current.enterFullscreen();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.playerContainer}>
        <VideoPlayer
          ref={playerRef}
          source={{
            uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            type: 'mp4'
          }}
          style={styles.player}
          autoPlay={false}
          loop={false}
          muted={false}
          volume={1.0}
          playbackRate={1.0}
          resizeMode="contain"
          controls={true}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onEnd={handleEnd}
          onError={handleError}
          onBuffer={(data) => console.log('Buffering:', data.isBuffering)}
          onSeek={(data) => console.log('Seeked to:', data.currentTime)}
          onFullscreenPlayerWillPresent={() => console.log('Entering fullscreen')}
          onFullscreenPlayerDidDismiss={() => console.log('Exiting fullscreen')}
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
    height: 200,
  },
});

export default BasicExample;