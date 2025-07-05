import { PlayerOptions } from '../types/PlayerOptions';
import Logger from '../utils/Logger';

export default class PlayerConfig {
  private static logger = Logger.createScopedLogger('PlayerConfig');
  
  /**
   * Default player configuration
   */
  static defaultOptions: PlayerOptions = {
    source: {
      uri: '',
      type: 'mp4',
    },
    autoPlay: false,
    loop: false,
    muted: false,
    volume: 1.0,
    playbackRate: 1.0,
    resizeMode: 'contain',
    fullscreen: false,
    controls: true,
    subtitles: [],
    analytics: {
      enabled: false,
      provider: 'custom',
      config: {},
    },
  };

  /**
   * Set default configuration options
   * @param options - Partial player options to merge with defaults
   */
  static setDefaults(options: Partial<PlayerOptions>): void {
    this.logger.info('Updating default player configuration', options);
    
    this.defaultOptions = {
      ...this.defaultOptions,
      ...options,
    };
  }

  /**
   * Get current default configuration
   * @returns Current default player options
   */
  static getDefaults(): PlayerOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Reset to original default configuration
   */
  static resetDefaults(): void {
    this.logger.info('Resetting to original default configuration');
    
    this.defaultOptions = {
      source: {
        uri: '',
        type: 'mp4',
      },
      autoPlay: false,
      loop: false,
      muted: false,
      volume: 1.0,
      playbackRate: 1.0,
      resizeMode: 'contain',
      fullscreen: false,
      controls: true,
      subtitles: [],
      analytics: {
        enabled: false,
        provider: 'custom',
        config: {},
      },
    };
  }

  /**
   * Get configuration for a specific device type
   * @param deviceType - Device type ('phone', 'tablet', 'tv')
   * @returns Optimized configuration for the device type
   */
  static getConfigForDevice(deviceType: 'phone' | 'tablet' | 'tv'): Partial<PlayerOptions> {
    const baseConfig = this.getDefaults();
    
    switch (deviceType) {
      case 'tv':
        return {
          ...baseConfig,
          controls: true,
          fullscreen: true,
          resizeMode: 'contain',
          volume: 1.0,
          analytics: {
            enabled: true,
            provider: 'custom',
            config: {
              enableQualityTracking: true,
              enableBufferTracking: true,
              enableErrorTracking: true,
            },
          },
        };
        
      case 'tablet':
        return {
          ...baseConfig,
          controls: true,
          fullscreen: false,
          resizeMode: 'contain',
          volume: 0.8,
          analytics: {
            enabled: true,
            provider: 'custom',
            config: {
              enableQualityTracking: true,
              enableBufferTracking: false,
              enableErrorTracking: true,
            },
          },
        };
        
      case 'phone':
        return {
          ...baseConfig,
          controls: true,
          fullscreen: false,
          resizeMode: 'cover',
          volume: 0.7,
          analytics: {
            enabled: false,
            provider: 'custom',
            config: {},
          },
        };
        
      default:
        return baseConfig;
    }
  }

  /**
   * Validate player configuration
   * @param options - Player options to validate
   * @returns Validation result with errors if any
   */
  static validateConfig(options: PlayerOptions): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate source
    if (!options.source) {
      errors.push('Source is required');
    } else {
      if (!options.source.uri) {
        errors.push('Source URI is required');
      }
      
      if (options.source.type && 
          !['hls', 'dash', 'mp4', 'webm'].includes(options.source.type)) {
        errors.push('Invalid source type');
      }
    }

    // Validate volume
    if (options.volume !== undefined && 
        (options.volume < 0 || options.volume > 1)) {
      errors.push('Volume must be between 0 and 1');
    }

    // Validate playback rate
    if (options.playbackRate !== undefined && 
        (options.playbackRate < 0.5 || options.playbackRate > 2.0)) {
      errors.push('Playback rate must be between 0.5 and 2.0');
    }

    // Validate resize mode
    if (options.resizeMode && 
        !['contain', 'cover', 'stretch', 'center'].includes(options.resizeMode)) {
      errors.push('Invalid resize mode');
    }

    // Validate DRM configuration
    if (options.drm) {
      if (!options.drm.type) {
        errors.push('DRM type is required');
      }
      
      if (!options.drm.licenseServer) {
        errors.push('DRM license server is required');
      }
      
      if (!['widevine', 'playready', 'fairplay'].includes(options.drm.type)) {
        errors.push('Invalid DRM type');
      }
    }

    // Validate subtitle tracks
    if (options.subtitles) {
      options.subtitles.forEach((track, index) => {
        if (!track.uri) {
          errors.push(`Subtitle track ${index}: URI is required`);
        }
        
        if (!track.language) {
          errors.push(`Subtitle track ${index}: Language is required`);
        }
        
        if (!['vtt', 'srt', 'ttml'].includes(track.type)) {
          errors.push(`Subtitle track ${index}: Invalid type`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge configuration with defaults
   * @param options - Partial player options
   * @returns Complete player options with defaults applied
   */
  static mergeWithDefaults(options: Partial<PlayerOptions>): PlayerOptions {
    const defaults = this.getDefaults();
    
    return {
      ...defaults,
      ...options,
      source: {
        ...defaults.source,
        ...options.source,
      },
      analytics: {
        ...defaults.analytics,
        ...options.analytics,
        config: {
          ...defaults.analytics?.config,
          ...options.analytics?.config,
        },
      },
    };
  }

  /**
   * Get environment-specific configuration
   * @param environment - Environment name ('development', 'staging', 'production')
   * @returns Environment-specific configuration
   */
  static getEnvironmentConfig(environment: 'development' | 'staging' | 'production'): Partial<PlayerOptions> {
    switch (environment) {
      case 'development':
        return {
          analytics: {
            enabled: true,
            provider: 'custom',
            config: {
              debug: true,
              verbose: true,
              enableAllTracking: true,
            },
          },
        };
        
      case 'staging':
        return {
          analytics: {
            enabled: true,
            provider: 'custom',
            config: {
              debug: false,
              verbose: false,
              enableErrorTracking: true,
            },
          },
        };
        
      case 'production':
        return {
          analytics: {
            enabled: true,
            provider: 'custom',
            config: {
              debug: false,
              verbose: false,
              enableErrorTracking: true,
              enablePerformanceTracking: true,
            },
          },
        };
        
      default:
        return {};
    }
  }
}