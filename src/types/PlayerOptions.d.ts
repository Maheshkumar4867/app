// Player Options and Types
export interface PlayerOptions {
  source: VideoSource;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  fullscreen?: boolean;
  controls?: boolean;
  subtitles?: SubtitleTrack[];
  thumbnails?: ThumbnailConfig;
  ads?: AdsConfig;
  analytics?: AnalyticsConfig;
  drm?: DRMConfig;
  style?: any;
  onLoad?: (data: VideoLoadData) => void;
  onProgress?: (data: VideoProgressData) => void;
  onEnd?: () => void;
  onError?: (error: VideoError) => void;
  onBuffer?: (data: VideoBufferData) => void;
  onSeek?: (data: VideoSeekData) => void;
  onFullscreenPlayerWillPresent?: () => void;
  onFullscreenPlayerDidPresent?: () => void;
  onFullscreenPlayerWillDismiss?: () => void;
  onFullscreenPlayerDidDismiss?: () => void;
}

export interface VideoSource {
  uri: string;
  type?: 'hls' | 'dash' | 'mp4' | 'webm';
  headers?: Record<string, string>;
  drm?: DRMConfig;
}

export interface SubtitleTrack {
  title: string;
  language: string;
  type: 'vtt' | 'srt' | 'ttml';
  uri: string;
}

export interface ThumbnailConfig {
  uri: string;
  width: number;
  height: number;
  interval: number;
}

export interface AdsConfig {
  adTagUrl?: string;
  preroll?: string[];
  midroll?: AdBreak[];
  postroll?: string[];
}

export interface AdBreak {
  time: number;
  ads: string[];
}

export interface AnalyticsConfig {
  enabled: boolean;
  provider?: 'google' | 'adobe' | 'custom';
  config?: Record<string, any>;
}

export interface DRMConfig {
  type: 'widevine' | 'playready' | 'fairplay';
  licenseServer: string;
  headers?: Record<string, string>;
}

export interface VideoLoadData {
  duration: number;
  currentTime: number;
  canPlayReverse: boolean;
  canPlayFastForward: boolean;
  canPlaySlowForward: boolean;
  canPlaySlowReverse: boolean;
  canStepBackward: boolean;
  canStepForward: boolean;
  naturalSize: {
    width: number;
    height: number;
    orientation: 'portrait' | 'landscape';
  };
  audioTracks: AudioTrack[];
  textTracks: TextTrack[];
}

export interface VideoProgressData {
  currentTime: number;
  playableDuration: number;
  seekableDuration: number;
}

export interface VideoBufferData {
  isBuffering: boolean;
}

export interface VideoSeekData {
  currentTime: number;
  seekTime: number;
}

export interface VideoError {
  error: {
    code: number;
    domain: string;
    localizedDescription: string;
  };
}

export interface AudioTrack {
  index: number;
  title: string;
  language: string;
  type: string;
}

export interface TextTrack {
  index: number;
  title: string;
  language: string;
  type: string;
}

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
  id?: string;
  settings?: string;
}