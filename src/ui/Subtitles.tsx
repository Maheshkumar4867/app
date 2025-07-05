import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SubtitleTrack, SubtitleCue } from '../types/PlayerOptions';
import VTTParser from '../utils/VTTParser';

interface SubtitlesProps {
  tracks: SubtitleTrack[];
  currentTrack?: number;
  currentTime?: number;
  style?: any;
}

interface SubtitlesState {
  currentCue: SubtitleCue | null;
  parsedTracks: Map<number, SubtitleCue[]>;
}

export default class Subtitles extends Component<SubtitlesProps, SubtitlesState> {
  constructor(props: SubtitlesProps) {
    super(props);
    
    this.state = {
      currentCue: null,
      parsedTracks: new Map(),
    };
  }

  componentDidMount() {
    this.loadSubtitleTracks();
  }

  componentDidUpdate(prevProps: SubtitlesProps) {
    if (prevProps.tracks !== this.props.tracks) {
      this.loadSubtitleTracks();
    }
    
    if (prevProps.currentTime !== this.props.currentTime || prevProps.currentTrack !== this.props.currentTrack) {
      this.updateCurrentCue();
    }
  }

  private loadSubtitleTracks = async () => {
    const { tracks } = this.props;
    const parsedTracks = new Map<number, SubtitleCue[]>();
    
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      try {
        const response = await fetch(track.uri);
        const subtitleContent = await response.text();
        
        if (track.type === 'vtt') {
          const cues = VTTParser.parse(subtitleContent);
          parsedTracks.set(i, cues);
        }
        // Add support for other subtitle formats (SRT, TTML) here
      } catch (error) {
        console.error(`Failed to load subtitle track ${i}:`, error);
      }
    }
    
    this.setState({ parsedTracks });
    this.updateCurrentCue();
  };

  private updateCurrentCue = () => {
    const { currentTrack = 0, currentTime = 0 } = this.props;
    const { parsedTracks } = this.state;
    
    const trackCues = parsedTracks.get(currentTrack);
    if (!trackCues) {
      this.setState({ currentCue: null });
      return;
    }
    
    const currentCue = trackCues.find(cue => 
      currentTime >= cue.start && currentTime <= cue.end
    );
    
    this.setState({ currentCue: currentCue || null });
  };

  private formatSubtitleText = (text: string): string => {
    // Basic formatting for WebVTT tags
    return text
      .replace(/<b>/g, '')
      .replace(/<\/b>/g, '')
      .replace(/<i>/g, '')
      .replace(/<\/i>/g, '')
      .replace(/<u>/g, '')
      .replace(/<\/u>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  render() {
    const { style } = this.props;
    const { currentCue } = this.state;
    
    if (!currentCue) {
      return null;
    }
    
    return (
      <View style={[styles.container, style]}>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>
            {this.formatSubtitleText(currentCue.text)}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: '90%',
  },
  subtitleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
});