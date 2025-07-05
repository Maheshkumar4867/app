import { VideoSource } from '../types/PlayerOptions';
import DeviceDetector from './DeviceDetector';
import Logger from './Logger';

export default class SourceSelector {
  private static logger = Logger.createScopedLogger('SourceSelector');

  /**
   * Select the best video source from available sources
   * @param sources - Array of video sources
   * @returns Best suitable video source
   */
  static selectBestSource(sources: VideoSource[]): VideoSource {
    if (!sources || sources.length === 0) {
      throw new Error('No video sources provided');
    }

    if (sources.length === 1) {
      return sources[0];
    }

    this.logger.info('Selecting best source from options', sources);

    // Get device capabilities
    const deviceType = DeviceDetector.getDeviceType();
    const isTV = DeviceDetector.isTV();
    const orientation = DeviceDetector.getOrientation();

    // Priority order based on device type and capabilities
    const priorities = this.getSourcePriorities(deviceType, isTV);

    // Find the best source based on priorities
    for (const priority of priorities) {
      const source = sources.find(s => s.type === priority);
      if (source) {
        this.logger.info(`Selected ${priority} source for ${deviceType}`, source);
        return source;
      }
    }

    // Fallback to the first source
    this.logger.warn('No optimal source found, using first available source');
    return sources[0];
  }

  /**
   * Detect video source type from URI
   * @param uri - Video URI
   * @returns Detected source type
   */
  static detectSourceType(uri: string): string {
    if (!uri) {
      return 'unknown';
    }

    const url = uri.toLowerCase();

    if (url.includes('.m3u8') || url.includes('/hls/')) {
      return 'hls';
    }

    if (url.includes('.mpd') || url.includes('/dash/')) {
      return 'dash';
    }

    if (url.includes('.mp4')) {
      return 'mp4';
    }

    if (url.includes('.webm')) {
      return 'webm';
    }

    if (url.includes('.mkv')) {
      return 'mkv';
    }

    if (url.includes('.mov')) {
      return 'mov';
    }

    if (url.includes('.avi')) {
      return 'avi';
    }

    // Check for streaming protocols
    if (url.startsWith('rtmp://') || url.startsWith('rtmps://')) {
      return 'rtmp';
    }

    if (url.startsWith('rtsp://')) {
      return 'rtsp';
    }

    return 'unknown';
  }

  /**
   * Check if a source type is supported on the current device
   * @param sourceType - Source type to check
   * @returns True if supported
   */
  static isSourceTypeSupported(sourceType: string): boolean {
    const deviceType = DeviceDetector.getDeviceType();
    const supportedTypes = this.getSupportedTypes(deviceType);
    return supportedTypes.includes(sourceType);
  }

  /**
   * Get supported video formats for the current device
   * @returns Array of supported formats
   */
  static getSupportedFormats(): string[] {
    const deviceType = DeviceDetector.getDeviceType();
    return this.getSupportedTypes(deviceType);
  }

  /**
   * Filter sources to only include supported formats
   * @param sources - Array of video sources
   * @returns Array of supported sources
   */
  static filterSupportedSources(sources: VideoSource[]): VideoSource[] {
    const supportedTypes = this.getSupportedFormats();
    
    return sources.filter(source => {
      const sourceType = source.type || this.detectSourceType(source.uri);
      return supportedTypes.includes(sourceType);
    });
  }

  /**
   * Get quality score for a source based on device capabilities
   * @param source - Video source
   * @returns Quality score (higher is better)
   */
  static getQualityScore(source: VideoSource): number {
    const deviceType = DeviceDetector.getDeviceType();
    const sourceType = source.type || this.detectSourceType(source.uri);
    
    const baseScores: { [key: string]: number } = {
      'hls': 100,
      'dash': 95,
      'mp4': 80,
      'webm': 70,
      'mkv': 60,
      'mov': 50,
      'avi': 40,
      'rtmp': 30,
      'rtsp': 20,
      'unknown': 10,
    };

    let score = baseScores[sourceType] || 10;

    // Adjust score based on device type
    if (deviceType === 'tv') {
      // TVs prefer HLS and DASH for adaptive streaming
      if (sourceType === 'hls' || sourceType === 'dash') {
        score += 20;
      }
    } else if (deviceType === 'phone') {
      // Phones might prefer more efficient formats
      if (sourceType === 'mp4') {
        score += 10;
      }
    }

    return score;
  }

  /**
   * Sort sources by quality score (best first)
   * @param sources - Array of video sources
   * @returns Sorted array of sources
   */
  static sortSourcesByQuality(sources: VideoSource[]): VideoSource[] {
    return sources.sort((a, b) => {
      const scoreA = this.getQualityScore(a);
      const scoreB = this.getQualityScore(b);
      return scoreB - scoreA;
    });
  }

  private static getSourcePriorities(deviceType: string, isTV: boolean): string[] {
    if (isTV) {
      return ['hls', 'dash', 'mp4', 'webm', 'mkv', 'mov', 'avi'];
    }

    if (deviceType === 'tablet') {
      return ['hls', 'dash', 'mp4', 'webm', 'mkv', 'mov', 'avi'];
    }

    // Phone or default
    return ['mp4', 'hls', 'dash', 'webm', 'mkv', 'mov', 'avi'];
  }

  private static getSupportedTypes(deviceType: string): string[] {
    const baseTypes = ['mp4', 'webm', 'hls', 'dash'];
    
    if (deviceType === 'tv') {
      return [...baseTypes, 'mkv', 'mov', 'avi', 'rtmp', 'rtsp'];
    }

    return baseTypes;
  }
}