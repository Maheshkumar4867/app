import { PlayerOptions, VideoSource } from '../types/PlayerOptions';
import Logger from '../utils/Logger';
import EventBus from '../utils/EventBus';

export default class PlayerEngine {
  protected options: PlayerOptions;
  protected eventBus: EventBus;
  protected logger = Logger.createScopedLogger('PlayerEngine');
  protected isInitialized = false;
  protected currentSource: VideoSource | null = null;

  constructor(options: PlayerOptions) {
    this.options = options;
    this.eventBus = new EventBus();
    this.logger.info('PlayerEngine initialized');
  }

  /**
   * Load a video source
   * @param source - Video source to load
   * @returns Promise that resolves when source is loaded
   */
  async load(source: VideoSource): Promise<void> {
    this.logger.info('Loading video source', source);
    
    try {
      this.currentSource = source;
      await this.loadSource(source);
      this.isInitialized = true;
      
      this.eventBus.emit('sourceLoaded', source);
      this.logger.info('Video source loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load video source', error);
      this.eventBus.emit('sourceError', error);
      throw error;
    }
  }

  /**
   * Play the video
   */
  play(): void {
    if (!this.isInitialized) {
      this.logger.warn('Cannot play: Player not initialized');
      return;
    }

    this.logger.info('Playing video');
    this.handlePlay();
    this.eventBus.emit('play');
  }

  /**
   * Pause the video
   */
  pause(): void {
    if (!this.isInitialized) {
      this.logger.warn('Cannot pause: Player not initialized');
      return;
    }

    this.logger.info('Pausing video');
    this.handlePause();
    this.eventBus.emit('pause');
  }

  /**
   * Seek to a specific time
   * @param time - Time in seconds
   */
  seek(time: number): void {
    if (!this.isInitialized) {
      this.logger.warn('Cannot seek: Player not initialized');
      return;
    }

    this.logger.info(`Seeking to ${time}s`);
    this.handleSeek(time);
    this.eventBus.emit('seek', { time });
  }

  /**
   * Set the volume
   * @param volume - Volume level (0-1)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.logger.info(`Setting volume to ${clampedVolume}`);
    
    this.handleSetVolume(clampedVolume);
    this.eventBus.emit('volumeChange', { volume: clampedVolume });
  }

  /**
   * Set the playback rate
   * @param rate - Playback rate (0.5 - 2.0)
   */
  setPlaybackRate(rate: number): void {
    const clampedRate = Math.max(0.5, Math.min(2.0, rate));
    this.logger.info(`Setting playback rate to ${clampedRate}`);
    
    this.handleSetPlaybackRate(clampedRate);
    this.eventBus.emit('playbackRateChange', { rate: clampedRate });
  }

  /**
   * Get the current time
   * @returns Current playback time in seconds
   */
  getCurrentTime(): number {
    if (!this.isInitialized) {
      return 0;
    }
    
    return this.handleGetCurrentTime();
  }

  /**
   * Get the duration
   * @returns Video duration in seconds
   */
  getDuration(): number {
    if (!this.isInitialized) {
      return 0;
    }
    
    return this.handleGetDuration();
  }

  /**
   * Check if the video is playing
   * @returns True if playing
   */
  isPlaying(): boolean {
    if (!this.isInitialized) {
      return false;
    }
    
    return this.handleIsPlaying();
  }

  /**
   * Check if the video is paused
   * @returns True if paused
   */
  isPaused(): boolean {
    return !this.isPlaying();
  }

  /**
   * Check if the video has ended
   * @returns True if ended
   */
  hasEnded(): boolean {
    if (!this.isInitialized) {
      return false;
    }
    
    return this.handleHasEnded();
  }

  /**
   * Get the current source
   * @returns Current video source
   */
  getCurrentSource(): VideoSource | null {
    return this.currentSource;
  }

  /**
   * Get the event bus
   * @returns EventBus instance
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Update player options
   * @param options - New options
   */
  updateOptions(options: Partial<PlayerOptions>): void {
    this.options = { ...this.options, ...options };
    this.logger.info('Player options updated', options);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.logger.info('Destroying player engine');
    
    this.handleDestroy();
    this.eventBus.removeAllListeners();
    this.isInitialized = false;
    this.currentSource = null;
  }

  // Protected methods to be implemented by subclasses
  protected async loadSource(source: VideoSource): Promise<void> {
    // Override in subclasses
    throw new Error('loadSource must be implemented by subclass');
  }

  protected handlePlay(): void {
    // Override in subclasses
    throw new Error('handlePlay must be implemented by subclass');
  }

  protected handlePause(): void {
    // Override in subclasses
    throw new Error('handlePause must be implemented by subclass');
  }

  protected handleSeek(time: number): void {
    // Override in subclasses
    throw new Error('handleSeek must be implemented by subclass');
  }

  protected handleSetVolume(volume: number): void {
    // Override in subclasses
    throw new Error('handleSetVolume must be implemented by subclass');
  }

  protected handleSetPlaybackRate(rate: number): void {
    // Override in subclasses
    throw new Error('handleSetPlaybackRate must be implemented by subclass');
  }

  protected handleGetCurrentTime(): number {
    // Override in subclasses
    throw new Error('handleGetCurrentTime must be implemented by subclass');
  }

  protected handleGetDuration(): number {
    // Override in subclasses
    throw new Error('handleGetDuration must be implemented by subclass');
  }

  protected handleIsPlaying(): boolean {
    // Override in subclasses
    throw new Error('handleIsPlaying must be implemented by subclass');
  }

  protected handleHasEnded(): boolean {
    // Override in subclasses
    throw new Error('handleHasEnded must be implemented by subclass');
  }

  protected handleDestroy(): void {
    // Override in subclasses if needed
    // Default implementation does nothing
  }
}