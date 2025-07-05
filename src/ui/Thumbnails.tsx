import React, { Component } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ThumbnailConfig } from '../types/PlayerOptions';

interface ThumbnailsProps {
  config: ThumbnailConfig;
  currentTime: number;
  style?: any;
}

interface ThumbnailsState {
  thumbnailIndex: number;
}

export default class Thumbnails extends Component<ThumbnailsProps, ThumbnailsState> {
  constructor(props: ThumbnailsProps) {
    super(props);
    
    this.state = {
      thumbnailIndex: 0,
    };
  }

  componentDidUpdate(prevProps: ThumbnailsProps) {
    if (prevProps.currentTime !== this.props.currentTime) {
      this.updateThumbnailIndex();
    }
  }

  private updateThumbnailIndex = () => {
    const { config, currentTime } = this.props;
    const index = Math.floor(currentTime / config.interval);
    
    this.setState({ thumbnailIndex: index });
  };

  private getThumbnailSource = () => {
    const { config } = this.props;
    const { thumbnailIndex } = this.state;
    
    // Create thumbnail URL based on index
    // This assumes the thumbnail URI includes a placeholder for the index
    const thumbnailUri = config.uri.replace('{index}', thumbnailIndex.toString());
    
    return { uri: thumbnailUri };
  };

  render() {
    const { config, style } = this.props;
    
    return (
      <View style={[styles.container, style]}>
        <Image
          source={this.getThumbnailSource()}
          style={[
            styles.thumbnail,
            {
              width: config.width,
              height: config.height,
            },
          ]}
          resizeMode="cover"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
});