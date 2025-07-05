import { Platform } from 'react-native';
import DeviceDetector from './DeviceDetector';
import Logger from './Logger';

export default class CodecDetector {
  private static logger = Logger.createScopedLogger('CodecDetector');
  private static supportedCodecs: string[] | null = null;

  /**
   * Check if a specific codec is supported
   * @param codec - Codec name to check
   * @returns True if supported
   */
  static isSupported(codec: string): boolean {
    if (!codec) {
      return false;
    }

    const normalizedCodec = codec.toLowerCase().trim();
    const supportedCodecs = this.getSupportedCodecs();
    
    return supportedCodecs.some(supported => 
      supported.toLowerCase().includes(normalizedCodec)
    );
  }

  /**
   * Get all supported codecs
   * @returns Array of supported codec names
   */
  static getSupportedCodecs(): string[] {
    if (this.supportedCodecs !== null) {
      return this.supportedCodecs;
    }

    this.logger.info('Detecting supported codecs');
    
    const codecs: string[] = [];
    
    // Common video codecs
    const videoCodecs = [
      'video/mp4; codecs="avc1.42E01E"', // H.264 baseline
      'video/mp4; codecs="avc1.4d001e"', // H.264 main
      'video/mp4; codecs="avc1.64001e"', // H.264 high
      'video/mp4; codecs="hev1.1.6.L93.B0"', // H.265/HEVC
      'video/mp4; codecs="hvc1.1.6.L93.B0"', // H.265/HEVC
      'video/mp4; codecs="av01.0.05M.08"', // AV1
      'video/webm; codecs="vp8"', // VP8
      'video/webm; codecs="vp9"', // VP9
      'video/webm; codecs="av01.0.05M.08"', // AV1 in WebM
    ];

    // Common audio codecs
    const audioCodecs = [
      'audio/mp4; codecs="mp4a.40.2"', // AAC-LC
      'audio/mp4; codecs="mp4a.40.5"', // AAC-HE
      'audio/mp4; codecs="mp4a.40.29"', // AAC-HEv2
      'audio/mp4; codecs="mp4a.67"', // MP3
      'audio/webm; codecs="opus"', // Opus
      'audio/webm; codecs="vorbis"', // Vorbis
      'audio/ogg; codecs="opus"', // Opus in OGG
      'audio/ogg; codecs="vorbis"', // Vorbis in OGG
    ];

    const allCodecs = [...videoCodecs, ...audioCodecs];

    // Check each codec
    for (const codec of allCodecs) {
      if (this.canPlayType(codec)) {
        codecs.push(codec);
      }
    }

    // Add device-specific codecs
    const deviceSpecificCodecs = this.getDeviceSpecificCodecs();
    codecs.push(...deviceSpecificCodecs);

    this.supportedCodecs = codecs;
    this.logger.info(`Detected ${codecs.length} supported codecs`, codecs);
    
    return codecs;
  }

  /**
   * Check if a specific video codec is supported
   * @param codec - Video codec name
   * @returns True if supported
   */
  static isVideoCodecSupported(codec: string): boolean {
    const videoCodecs = this.getSupportedVideoCodecs();
    return videoCodecs.includes(codec);
  }

  /**
   * Check if a specific audio codec is supported
   * @param codec - Audio codec name
   * @returns True if supported
   */
  static isAudioCodecSupported(codec: string): boolean {
    const audioCodecs = this.getSupportedAudioCodecs();
    return audioCodecs.includes(codec);
  }

  /**
   * Get supported video codecs
   * @returns Array of supported video codec names
   */
  static getSupportedVideoCodecs(): string[] {
    const allCodecs = this.getSupportedCodecs();
    return allCodecs.filter(codec => codec.startsWith('video/'));
  }

  /**
   * Get supported audio codecs
   * @returns Array of supported audio codec names
   */
  static getSupportedAudioCodecs(): string[] {
    const allCodecs = this.getSupportedCodecs();
    return allCodecs.filter(codec => codec.startsWith('audio/'));
  }

  /**
   * Get the best supported video codec
   * @returns Best video codec or null if none supported
   */
  static getBestVideoCodec(): string | null {
    const videoCodecs = this.getSupportedVideoCodecs();
    
    // Priority order (best first)
    const priority = [
      'video/mp4; codecs="hev1.1.6.L93.B0"', // H.265
      'video/mp4; codecs="hvc1.1.6.L93.B0"', // H.265
      'video/mp4; codecs="av01.0.05M.08"', // AV1
      'video/webm; codecs="av01.0.05M.08"', // AV1
      'video/webm; codecs="vp9"', // VP9
      'video/mp4; codecs="avc1.64001e"', // H.264 high
      'video/mp4; codecs="avc1.4d001e"', // H.264 main
      'video/mp4; codecs="avc1.42E01E"', // H.264 baseline
      'video/webm; codecs="vp8"', // VP8
    ];

    for (const codec of priority) {
      if (videoCodecs.includes(codec)) {
        return codec;
      }
    }

    return videoCodecs.length > 0 ? videoCodecs[0] : null;
  }

  /**
   * Get the best supported audio codec
   * @returns Best audio codec or null if none supported
   */
  static getBestAudioCodec(): string | null {
    const audioCodecs = this.getSupportedAudioCodecs();
    
    // Priority order (best first)
    const priority = [
      'audio/webm; codecs="opus"', // Opus
      'audio/ogg; codecs="opus"', // Opus
      'audio/mp4; codecs="mp4a.40.29"', // AAC-HEv2
      'audio/mp4; codecs="mp4a.40.5"', // AAC-HE
      'audio/mp4; codecs="mp4a.40.2"', // AAC-LC
      'audio/webm; codecs="vorbis"', // Vorbis
      'audio/ogg; codecs="vorbis"', // Vorbis
      'audio/mp4; codecs="mp4a.67"', // MP3
    ];

    for (const codec of priority) {
      if (audioCodecs.includes(codec)) {
        return codec;
      }
    }

    return audioCodecs.length > 0 ? audioCodecs[0] : null;
  }

  /**
   * Get codec information
   * @param codec - Codec string
   * @returns Codec information object
   */
  static getCodecInfo(codec: string): {
    type: 'video' | 'audio' | 'unknown';
    container: string;
    codecName: string;
    profile?: string;
  } {
    const info = {
      type: 'unknown' as 'video' | 'audio' | 'unknown',
      container: '',
      codecName: '',
      profile: undefined as string | undefined,
    };

    if (codec.startsWith('video/')) {
      info.type = 'video';
      info.container = codec.split(';')[0].replace('video/', '');
    } else if (codec.startsWith('audio/')) {
      info.type = 'audio';
      info.container = codec.split(';')[0].replace('audio/', '');
    }

    // Extract codec name from codecs parameter
    const codecsMatch = codec.match(/codecs="([^"]+)"/);
    if (codecsMatch) {
      info.codecName = codecsMatch[1];
    }

    return info;
  }

  private static canPlayType(codec: string): boolean {
    try {
      // React Native codec support detection
      const normalizedCodec = codec.toLowerCase();
      
      // Android and iOS common codec support
      if (normalizedCodec.includes('mp4') && normalizedCodec.includes('avc1')) {
        return true; // H.264 is widely supported on both platforms
      }
      
      if (normalizedCodec.includes('mp4') && normalizedCodec.includes('mp4a')) {
        return true; // AAC is widely supported on both platforms
      }
      
      // Platform-specific codec support
      if (Platform.OS === 'android') {
        if (normalizedCodec.includes('webm') && normalizedCodec.includes('vp8')) {
          return true; // VP8 supported on Android
        }
        if (normalizedCodec.includes('webm') && normalizedCodec.includes('vp9')) {
          return true; // VP9 supported on Android
        }
        if (normalizedCodec.includes('opus') || normalizedCodec.includes('vorbis')) {
          return true; // Opus and Vorbis supported on Android
        }
      }
      
      if (Platform.OS === 'ios') {
        if (normalizedCodec.includes('hev1') || normalizedCodec.includes('hvc1')) {
          return true; // H.265 supported on iOS 11+
        }
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking codec support', error);
      return false;
    }
  }

  private static getDeviceSpecificCodecs(): string[] {
    const deviceType = DeviceDetector.getDeviceType();
    const codecs: string[] = [];

    if (deviceType === 'tv') {
      // TVs might support additional codecs
      codecs.push(
        'video/mp4; codecs="hev1.1.6.L93.B0"', // H.265
        'audio/mp4; codecs="ac-3"', // AC-3
        'audio/mp4; codecs="ec-3"', // E-AC-3
      );
    }

    return codecs;
  }
}