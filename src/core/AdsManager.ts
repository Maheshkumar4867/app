import { AdsConfig, AdBreak } from '../types/PlayerOptions';
import EventBus from '../utils/EventBus';
import Logger from '../utils/Logger';

export default class AdsManager {
  private config: AdsConfig;
  private eventBus: EventBus;
  private logger = Logger.createScopedLogger('AdsManager');
  private currentAdIndex = 0;
  private isAdPlaying = false;
  private adBreaks: AdBreak[] = [];
  private prerollAds: string[] = [];
  private postrollAds: string[] = [];

  constructor(config: AdsConfig) {
    this.config = config;
    this.eventBus = new EventBus();
    
    this.setupAdConfiguration();
    this.logger.info('AdsManager initialized', config);
  }

  private setupAdConfiguration() {
    if (this.config.preroll) {
      this.prerollAds = this.config.preroll;
    }
    
    if (this.config.postroll) {
      this.postrollAds = this.config.postroll;
    }
    
    if (this.config.midroll) {
      this.adBreaks = this.config.midroll;
    }
  }

  /**
   * Load an ad from the ad tag URL
   * @param adTagUrl - URL of the ad tag
   * @returns Promise that resolves when ad is loaded
   */
  async loadAd(adTagUrl: string): Promise<void> {
    try {
      this.logger.info(`Loading ad from: ${adTagUrl}`);
      
      // In a real implementation, this would integrate with an ad SDK
      // like Google IMA SDK, MoPub, etc.
      
      // Simulate ad loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.logger.info('Ad loaded successfully');
      this.eventBus.emit('adLoaded', { adTagUrl });
    } catch (error) {
      this.logger.error('Failed to load ad', error);
      this.eventBus.emit('adError', { error, adTagUrl });
      throw error;
    }
  }

  /**
   * Play the loaded ad
   */
  playAd(): void {
    if (this.isAdPlaying) {
      this.logger.warn('Ad is already playing');
      return;
    }

    this.isAdPlaying = true;
    this.logger.info('Playing ad');
    
    this.eventBus.emit('adStart');
    
    // Simulate ad playback
    setTimeout(() => {
      this.handleAdComplete();
    }, 5000); // 5 second ad duration
  }

  /**
   * Pause the current ad
   */
  pauseAd(): void {
    if (!this.isAdPlaying) {
      this.logger.warn('No ad is currently playing');
      return;
    }

    this.logger.info('Pausing ad');
    this.eventBus.emit('adPaused');
  }

  /**
   * Skip the current ad (if skippable)
   */
  skipAd(): void {
    if (!this.isAdPlaying) {
      this.logger.warn('No ad is currently playing');
      return;
    }

    this.logger.info('Skipping ad');
    this.handleAdComplete();
  }

  /**
   * Check if there are preroll ads to play
   * @returns True if preroll ads exist
   */
  hasPrerollAds(): boolean {
    return this.prerollAds.length > 0;
  }

  /**
   * Check if there are postroll ads to play
   * @returns True if postroll ads exist
   */
  hasPostrollAds(): boolean {
    return this.postrollAds.length > 0;
  }

  /**
   * Check if there are midroll ads for the given time
   * @param currentTime - Current video time in seconds
   * @returns True if there are midroll ads at this time
   */
  hasMidrollAds(currentTime: number): boolean {
    return this.adBreaks.some(adBreak => 
      Math.abs(adBreak.time - currentTime) < 1 // Within 1 second
    );
  }

  /**
   * Get midroll ads for the given time
   * @param currentTime - Current video time in seconds
   * @returns Array of ad URLs
   */
  getMidrollAds(currentTime: number): string[] {
    const adBreak = this.adBreaks.find(adBreak => 
      Math.abs(adBreak.time - currentTime) < 1
    );
    
    return adBreak ? adBreak.ads : [];
  }

  /**
   * Play preroll ads
   */
  async playPrerollAds(): Promise<void> {
    if (!this.hasPrerollAds()) {
      return;
    }

    this.logger.info('Playing preroll ads');
    
    for (const adUrl of this.prerollAds) {
      await this.loadAd(adUrl);
      await new Promise<void>((resolve) => {
        this.eventBus.once('adComplete', resolve);
        this.playAd();
      });
    }
  }

  /**
   * Play postroll ads
   */
  async playPostrollAds(): Promise<void> {
    if (!this.hasPostrollAds()) {
      return;
    }

    this.logger.info('Playing postroll ads');
    
    for (const adUrl of this.postrollAds) {
      await this.loadAd(adUrl);
      await new Promise<void>((resolve) => {
        this.eventBus.once('adComplete', resolve);
        this.playAd();
      });
    }
  }

  /**
   * Play midroll ads for the given time
   * @param currentTime - Current video time in seconds
   */
  async playMidrollAds(currentTime: number): Promise<void> {
    const midrollAds = this.getMidrollAds(currentTime);
    
    if (midrollAds.length === 0) {
      return;
    }

    this.logger.info(`Playing midroll ads at time ${currentTime}`);
    
    for (const adUrl of midrollAds) {
      await this.loadAd(adUrl);
      await new Promise<void>((resolve) => {
        this.eventBus.once('adComplete', resolve);
        this.playAd();
      });
    }
  }

  /**
   * Handle ad completion
   */
  private handleAdComplete(): void {
    this.isAdPlaying = false;
    this.logger.info('Ad completed');
    
    this.eventBus.emit('adComplete');
    this.eventBus.emit('adEnd');
  }

  /**
   * Get ad configuration
   * @returns Current ad configuration
   */
  getConfig(): AdsConfig {
    return this.config;
  }

  /**
   * Update ad configuration
   * @param config - New ad configuration
   */
  updateConfig(config: AdsConfig): void {
    this.config = config;
    this.setupAdConfiguration();
    this.logger.info('Ad configuration updated', config);
  }

  /**
   * Check if an ad is currently playing
   * @returns True if ad is playing
   */
  isPlaying(): boolean {
    return this.isAdPlaying;
  }

  /**
   * Get the event bus for ad events
   * @returns EventBus instance
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.eventBus.removeAllListeners();
    this.isAdPlaying = false;
    this.logger.info('AdsManager destroyed');
  }
}