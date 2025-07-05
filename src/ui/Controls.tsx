import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Slider, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TimeFormatter from '../utils/TimeFormatter';

interface ControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onFullscreen: () => void;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  isFullscreen: boolean;
  style?: any;
}

interface ControlsState {
  seeking: boolean;
  seekPosition: number;
}

export default class Controls extends Component<ControlsProps, ControlsState> {
  constructor(props: ControlsProps) {
    super(props);
    
    this.state = {
      seeking: false,
      seekPosition: 0,
    };
  }

  private handleSeekStart = () => {
    this.setState({ seeking: true });
  };

  private handleSeekChange = (value: number) => {
    this.setState({ seekPosition: value });
  };

  private handleSeekEnd = (value: number) => {
    this.setState({ seeking: false });
    this.props.onSeek(value);
  };

  private handlePlayPause = () => {
    if (this.props.isPlaying) {
      this.props.onPause();
    } else {
      this.props.onPlay();
    }
  };

  private getCurrentPosition = () => {
    return this.state.seeking ? this.state.seekPosition : this.props.currentTime;
  };

  render() {
    const { duration, isPlaying, isFullscreen, onFullscreen, style } = this.props;
    const currentPosition = this.getCurrentPosition();
    
    return (
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={[styles.container, style]}
      >
        <View style={styles.controlsRow}>
          {/* Play/Pause Button */}
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={this.handlePlayPause}
          >
            <Text style={styles.buttonText}>
              {isPlaying ? '⏸' : '▶️'}
            </Text>
          </TouchableOpacity>

          {/* Time Display */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {TimeFormatter.formatTime(currentPosition)}
            </Text>
            <Text style={styles.timeText}>/</Text>
            <Text style={styles.timeText}>
              {TimeFormatter.formatTime(duration)}
            </Text>
          </View>

          {/* Fullscreen Button */}
          <TouchableOpacity
            style={styles.fullscreenButton}
            onPress={onFullscreen}
          >
            <Text style={styles.buttonText}>
              {isFullscreen ? '⛶' : '⛶'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={duration}
            value={currentPosition}
            onValueChange={this.handleSeekChange}
            onSlidingStart={this.handleSeekStart}
            onSlidingComplete={this.handleSeekEnd}
            minimumTrackTintColor="#FF0000"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbStyle={styles.sliderThumb}
            trackStyle={styles.sliderTrack}
          />
        </View>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  playPauseButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 5,
    fontFamily: 'monospace',
  },
  fullscreenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 30,
    justifyContent: 'center',
  },
  progressSlider: {
    height: 30,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#FF0000',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
});