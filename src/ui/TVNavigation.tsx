import React, { Component } from 'react';
import { View, StyleSheet, TVEventHandler } from 'react-native';
import DeviceDetector from '../utils/DeviceDetector';
import Logger from '../utils/Logger';

interface TVNavigationProps {
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect: () => void;
  onPlayPause?: () => void;
  onMenu?: () => void;
  enabled?: boolean;
}

interface TVNavigationState {
  isTV: boolean;
  focusedElement: string | null;
}

export default class TVNavigation extends Component<TVNavigationProps, TVNavigationState> {
  private tvEventHandler: TVEventHandler | null = null;
  private logger = Logger.createScopedLogger('TVNavigation');

  constructor(props: TVNavigationProps) {
    super(props);
    
    this.state = {
      isTV: DeviceDetector.isTV(),
      focusedElement: null,
    };
  }

  componentDidMount() {
    if (this.state.isTV && this.props.enabled !== false) {
      this.setupTVEventHandler();
    }
  }

  componentWillUnmount() {
    if (this.tvEventHandler) {
      this.tvEventHandler.destroy();
    }
  }

  private setupTVEventHandler = () => {
    this.tvEventHandler = new TVEventHandler();
    
    this.tvEventHandler.enable(this, (cmp, evt) => {
      this.handleTVEvent(evt);
    });
    
    this.logger.info('TV event handler enabled');
  };

  private handleTVEvent = (evt: any) => {
    const { eventType, eventKeyAction } = evt;
    
    // Only handle key down events to avoid double triggers
    if (eventKeyAction !== 'down') {
      return;
    }
    
    this.logger.debug(`TV event: ${eventType}`);
    
    switch (eventType) {
      case 'up':
        this.props.onNavigate('up');
        break;
      case 'down':
        this.props.onNavigate('down');
        break;
      case 'left':
        this.props.onNavigate('left');
        break;
      case 'right':
        this.props.onNavigate('right');
        break;
      case 'select':
        this.props.onSelect();
        break;
      case 'playPause':
        if (this.props.onPlayPause) {
          this.props.onPlayPause();
        }
        break;
      case 'menu':
        if (this.props.onMenu) {
          this.props.onMenu();
        }
        break;
      default:
        this.logger.debug(`Unhandled TV event: ${eventType}`);
    }
  };

  render() {
    // This component doesn't render anything visible
    // It's purely for handling TV remote events
    return null;
  }
}

const styles = StyleSheet.create({
  // No styles needed for this component
});