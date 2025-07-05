import DeviceDetector from './DeviceDetector';
import Logger from './Logger';

export default class DolbyDetector {
  private static logger = Logger.createScopedLogger('DolbyDetector');
  private static capabilities: string[] | null = null;

  /**
   * Check if Dolby audio is supported
   * @returns True if any Dolby format is supported
   */
  static isDolbySupported(): boolean {
    const capabilities = this.getDolbyCapabilities();
    return capabilities.length > 0;
  }

  /**
   * Get all supported Dolby capabilities
   * @returns Array of supported Dolby formats
   */
  static getDolbyCapabilities(): string[] {
    if (this.capabilities !== null) {
      return this.capabilities;
    }

    this.logger.info('Detecting Dolby capabilities');
    
    const capabilities: string[] = [];
    
    // Check for Dolby Digital (AC-3)
    if (this.isDolbyDigitalSupported()) {
      capabilities.push('dolby-digital');
    }

    // Check for Dolby Digital Plus (E-AC-3)
    if (this.isDolbyDigitalPlusSupported()) {
      capabilities.push('dolby-digital-plus');
    }

    // Check for Dolby Atmos
    if (this.isDolbyAtmosSupported()) {
      capabilities.push('dolby-atmos');
    }

    // Check for Dolby Vision
    if (this.isDolbyVisionSupported()) {
      capabilities.push('dolby-vision');
    }

    // Check for Dolby TrueHD
    if (this.isDolbyTrueHDSupported()) {
      capabilities.push('dolby-truehd');
    }

    this.capabilities = capabilities;
    this.logger.info(`Detected Dolby capabilities: ${capabilities.join(', ')}`);
    
    return capabilities;
  }

  /**
   * Check if Dolby Digital (AC-3) is supported
   * @returns True if supported
   */
  static isDolbyDigitalSupported(): boolean {
    return this.checkAudioCodecSupport('audio/mp4; codecs="ac-3"');
  }

  /**
   * Check if Dolby Digital Plus (E-AC-3) is supported
   * @returns True if supported
   */
  static isDolbyDigitalPlusSupported(): boolean {
    return this.checkAudioCodecSupport('audio/mp4; codecs="ec-3"');
  }

  /**
   * Check if Dolby Atmos is supported
   * @returns True if supported
   */
  static isDolbyAtmosSupported(): boolean {
    // Dolby Atmos is typically supported on high-end devices
    const deviceType = DeviceDetector.getDeviceType();
    const isTV = DeviceDetector.isTV();
    
    if (isTV) {
      // Most modern TVs support Dolby Atmos
      return this.isDolbyDigitalPlusSupported();
    }
    
    // For mobile devices, check if it's a high-end device
    return this.isHighEndDevice() && this.isDolbyDigitalPlusSupported();
  }

  /**
   * Check if Dolby Vision is supported
   * @returns True if supported
   */
  static isDolbyVisionSupported(): boolean {
    // Dolby Vision is typically supported on high-end devices with HDR
    const deviceType = DeviceDetector.getDeviceType();
    const isTV = DeviceDetector.isTV();
    
    if (isTV) {
      // Many modern TVs support Dolby Vision
      return this.supportsHDR();
    }
    
    // For mobile devices, check if it's a high-end device with HDR
    return this.isHighEndDevice() && this.supportsHDR();
  }

  /**
   * Check if Dolby TrueHD is supported
   * @returns True if supported
   */
  static isDolbyTrueHDSupported(): boolean {
    // Dolby TrueHD is typically supported on high-end audio systems
    const deviceType = DeviceDetector.getDeviceType();
    const isTV = DeviceDetector.isTV();
    
    if (isTV) {
      // High-end TVs might support Dolby TrueHD
      return this.isHighEndDevice();
    }
    
    // Mobile devices rarely support Dolby TrueHD
    return false;
  }

  /**
   * Get the best supported Dolby audio format
   * @returns Best Dolby format or null if none supported
   */
  static getBestDolbyFormat(): string | null {
    const capabilities = this.getDolbyCapabilities();
    
    // Priority order (best first)
    const priority = [
      'dolby-atmos',
      'dolby-truehd',
      'dolby-digital-plus',
      'dolby-digital',
    ];

    for (const format of priority) {
      if (capabilities.includes(format)) {
        return format;
      }
    }

    return null;
  }

  /**
   * Get codec string for the best supported Dolby format
   * @returns Codec string or null if none supported
   */
  static getBestDolbyCodec(): string | null {
    const bestFormat = this.getBestDolbyFormat();
    
    switch (bestFormat) {
      case 'dolby-atmos':
      case 'dolby-digital-plus':
        return 'audio/mp4; codecs="ec-3"';
      case 'dolby-digital':
        return 'audio/mp4; codecs="ac-3"';
      case 'dolby-truehd':
        return 'audio/mp4; codecs="mlpa"';
      default:
        return null;
    }
  }

  /**
   * Check if spatial audio is supported
   * @returns True if spatial audio is supported
   */
  static isSpatialAudioSupported(): boolean {
    return this.isDolbyAtmosSupported();
  }

  /**
   * Get audio channel configuration support
   * @returns Object with channel support information
   */
  static getAudioChannelSupport(): {
    stereo: boolean;
    surround_5_1: boolean;
    surround_7_1: boolean;
    atmos: boolean;
  } {
    return {
      stereo: true, // Always supported
      surround_5_1: this.isDolbyDigitalSupported(),
      surround_7_1: this.isDolbyDigitalPlusSupported(),
      atmos: this.isDolbyAtmosSupported(),
    };
  }

  /**
   * Get recommended audio settings based on device capabilities
   * @returns Recommended audio settings
   */
  static getRecommendedAudioSettings(): {
    codec: string | null;
    format: string | null;
    channels: number;
    sampleRate: number;
  } {
    const bestFormat = this.getBestDolbyFormat();
    const bestCodec = this.getBestDolbyCodec();
    
    let channels = 2; // Default stereo
    if (this.isDolbyAtmosSupported()) {
      channels = 8; // 7.1 + height channels
    } else if (this.isDolbyDigitalPlusSupported()) {
      channels = 8; // 7.1
    } else if (this.isDolbyDigitalSupported()) {
      channels = 6; // 5.1
    }

    return {
      codec: bestCodec,
      format: bestFormat,
      channels,
      sampleRate: 48000, // Standard sample rate
    };
  }

  private static checkAudioCodecSupport(codec: string): boolean {
    try {
      // In a real implementation, this would use HTMLMediaElement.canPlayType()
      // For now, we'll simulate based on device capabilities
      const deviceType = DeviceDetector.getDeviceType();
      const isTV = DeviceDetector.isTV();
      
      if (isTV) {
        // TVs typically support more audio codecs
        return true;
      }
      
      if (deviceType === 'tablet') {
        // Some tablets support advanced audio codecs
        return this.isHighEndDevice();
      }
      
      // Phones rarely support advanced audio codecs
      return false;
    } catch (error) {
      this.logger.error('Error checking audio codec support', error);
      return false;
    }
  }

  private static supportsHDR(): boolean {
    // Simplified HDR detection
    const deviceType = DeviceDetector.getDeviceType();
    const isTV = DeviceDetector.isTV();
    
    if (isTV) {
      return true; // Most modern TVs support HDR
    }
    
    return this.isHighEndDevice();
  }

  private static isHighEndDevice(): boolean {
    // Simplified high-end device detection
    // In a real implementation, this would check device specifications
    const deviceType = DeviceDetector.getDeviceType();
    const isTV = DeviceDetector.isTV();
    
    if (isTV) {
      return true; // Assume TVs are high-end
    }
    
    // For mobile devices, this would need more sophisticated detection
    return false;
  }
}