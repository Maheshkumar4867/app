import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

interface OverlaysProps {
  children: React.ReactNode;
  style?: any;
}

export default class Overlays extends Component<OverlaysProps> {
  render() {
    const { children, style } = this.props;
    
    return (
      <View style={[styles.container, style]} pointerEvents="box-none">
        {children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});