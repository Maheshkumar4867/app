import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export default class DeviceDetector {
  private static deviceType: 'phone' | 'tablet' | 'tv' | null = null;
  private static deviceInfo: any = null;

  /**
   * Initialize device detection
   */
  private static async initialize(): Promise<void> {
    if (DeviceDetector.deviceInfo === null) {
      try {
        DeviceDetector.deviceInfo = {
          isTablet: await DeviceInfo.isTablet(),
          deviceType: await DeviceInfo.getDeviceType(),
          systemName: DeviceInfo.getSystemName(),
          systemVersion: DeviceInfo.getSystemVersion(),
          brand: DeviceInfo.getBrand(),
          model: DeviceInfo.getModel(),
        };
      } catch (error) {
        console.warn('DeviceDetector: Failed to get device info', error);
        DeviceDetector.deviceInfo = {};
      }
    }
  }

  /**
   * Check if the device is a TV
   * @returns True if device is a TV
   */
  static isTV(): boolean {
    if (Platform.OS === 'android') {
      return Platform.isTV || false;
    }
    if (Platform.OS === 'ios') {
      return Platform.isTV || false;
    }
    return false;
  }

  /**
   * Check if the device is a tablet
   * @returns True if device is a tablet
   */
  static isTablet(): boolean {
    const { width, height } = Dimensions.get('window');
    const aspectRatio = width / height;
    const minDimension = Math.min(width, height);
    
    // Basic tablet detection based on screen size
    // This is a fallback if DeviceInfo is not available
    const isLikelyTablet = minDimension >= 768 && aspectRatio > 1.2 && aspectRatio < 2.0;
    
    if (DeviceDetector.deviceInfo?.isTablet !== undefined) {
      return DeviceDetector.deviceInfo.isTablet;
    }
    
    return isLikelyTablet;
  }

  /**
   * Check if the device is a phone
   * @returns True if device is a phone
   */
  static isPhone(): boolean {
    return !DeviceDetector.isTV() && !DeviceDetector.isTablet();
  }

  /**
   * Get the device type
   * @returns Device type
   */
  static getDeviceType(): 'phone' | 'tablet' | 'tv' {
    if (DeviceDetector.deviceType === null) {
      if (DeviceDetector.isTV()) {
        DeviceDetector.deviceType = 'tv';
      } else if (DeviceDetector.isTablet()) {
        DeviceDetector.deviceType = 'tablet';
      } else {
        DeviceDetector.deviceType = 'phone';
      }
    }
    return DeviceDetector.deviceType;
  }

  /**
   * Get the current device orientation
   * @returns Device orientation
   */
  static getOrientation(): 'portrait' | 'landscape' {
    const { width, height } = Dimensions.get('window');
    return width > height ? 'landscape' : 'portrait';
  }

  /**
   * Get screen dimensions
   * @returns Screen dimensions
   */
  static getScreenDimensions(): { width: number; height: number } {
    return Dimensions.get('window');
  }

  /**
   * Get device information
   * @returns Device information object
   */
  static async getDeviceInfo(): Promise<{
    isTablet: boolean;
    isTV: boolean;
    isPhone: boolean;
    deviceType: 'phone' | 'tablet' | 'tv';
    orientation: 'portrait' | 'landscape';
    screenDimensions: { width: number; height: number };
    platform: string;
    systemName?: string;
    systemVersion?: string;
    brand?: string;
    model?: string;
  }> {
    await DeviceDetector.initialize();
    
    return {
      isTablet: DeviceDetector.isTablet(),
      isTV: DeviceDetector.isTV(),
      isPhone: DeviceDetector.isPhone(),
      deviceType: DeviceDetector.getDeviceType(),
      orientation: DeviceDetector.getOrientation(),
      screenDimensions: DeviceDetector.getScreenDimensions(),
      platform: Platform.OS,
      systemName: DeviceDetector.deviceInfo?.systemName,
      systemVersion: DeviceDetector.deviceInfo?.systemVersion,
      brand: DeviceDetector.deviceInfo?.brand,
      model: DeviceDetector.deviceInfo?.model,
    };
  }

  /**
   * Check if device supports picture-in-picture
   * @returns True if PiP is supported
   */
  static supportsPictureInPicture(): boolean {
    if (Platform.OS === 'ios') {
      return Platform.Version >= '14.0';
    }
    if (Platform.OS === 'android') {
      return Platform.Version >= 26; // Android 8.0+
    }
    return false;
  }

  /**
   * Check if device supports HDR
   * @returns True if HDR is supported
   */
  static supportsHDR(): boolean {
    // This is a basic implementation
    // In a real app, you might check for specific HDR capabilities
    return DeviceDetector.isTV() || DeviceDetector.isTablet();
  }

  /**
   * Get safe area insets (for devices with notches)
   * @returns Safe area insets
   */
  static getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    // This is a basic implementation
    // In a real app, you might use react-native-safe-area-context
    const { width, height } = Dimensions.get('window');
    const screen = Dimensions.get('screen');
    
    return {
      top: screen.height - height,
      bottom: 0,
      left: 0,
      right: screen.width - width,
    };
  }
}