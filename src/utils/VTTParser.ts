import { SubtitleCue } from '../types/PlayerOptions';

export default class VTTParser {
  /**
   * Parse WebVTT content into subtitle cues
   * @param vttContent - WebVTT content as string
   * @returns Array of subtitle cues
   */
  static parse(vttContent: string): SubtitleCue[] {
    if (!vttContent || typeof vttContent !== 'string') {
      return [];
    }

    const lines = vttContent.split('\n');
    const cues: SubtitleCue[] = [];
    let currentCue: Partial<SubtitleCue> = {};
    let state: 'header' | 'cue' | 'text' = 'header';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) {
        if (state === 'text' && currentCue.text) {
          // End of cue
          cues.push(currentCue as SubtitleCue);
          currentCue = {};
          state = 'cue';
        }
        continue;
      }

      // Skip WebVTT header
      if (line.startsWith('WEBVTT')) {
        state = 'cue';
        continue;
      }

      // Skip NOTE lines
      if (line.startsWith('NOTE')) {
        continue;
      }

      // Parse timestamp line
      if (line.includes('-->')) {
        const timingMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})(.*)/);
        if (timingMatch) {
          const [, startTime, endTime, settings] = timingMatch;
          
          currentCue.start = VTTParser.parseTimestamp(startTime);
          currentCue.end = VTTParser.parseTimestamp(endTime);
          currentCue.settings = settings.trim();
          
          state = 'text';
          continue;
        }
      }

      // Parse cue ID (optional)
      if (state === 'cue' && !line.includes('-->')) {
        currentCue.id = line;
        continue;
      }

      // Parse cue text
      if (state === 'text') {
        if (currentCue.text) {
          currentCue.text += '\n' + line;
        } else {
          currentCue.text = line;
        }
      }
    }

    // Add the last cue if it exists
    if (currentCue.text) {
      cues.push(currentCue as SubtitleCue);
    }

    return cues;
  }

  /**
   * Parse a WebVTT timestamp into seconds
   * @param timestamp - Timestamp in format HH:MM:SS.mmm
   * @returns Time in seconds
   */
  static parseTimestamp(timestamp: string): number {
    const parts = timestamp.split(':');
    if (parts.length !== 3) {
      return 0;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const secondsAndMilliseconds = parts[2].split('.');
    const seconds = parseInt(secondsAndMilliseconds[0], 10);
    const milliseconds = parseInt(secondsAndMilliseconds[1], 10);

    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
  }

  /**
   * Format seconds back to WebVTT timestamp format
   * @param seconds - Time in seconds
   * @returns Timestamp in format HH:MM:SS.mmm
   */
  static formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    const pad = (num: number, size: number) => num.toString().padStart(size, '0');

    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)}.${pad(milliseconds, 3)}`;
  }

  /**
   * Convert subtitle cues back to WebVTT format
   * @param cues - Array of subtitle cues
   * @returns WebVTT content as string
   */
  static stringify(cues: SubtitleCue[]): string {
    let vttContent = 'WEBVTT\n\n';

    cues.forEach((cue, index) => {
      // Add cue ID if present
      if (cue.id) {
        vttContent += `${cue.id}\n`;
      }

      // Add timestamp
      const startTime = VTTParser.formatTimestamp(cue.start);
      const endTime = VTTParser.formatTimestamp(cue.end);
      vttContent += `${startTime} --> ${endTime}`;

      // Add settings if present
      if (cue.settings) {
        vttContent += ` ${cue.settings}`;
      }
      vttContent += '\n';

      // Add text
      vttContent += `${cue.text}\n\n`;
    });

    return vttContent;
  }

  /**
   * Validate WebVTT content
   * @param vttContent - WebVTT content to validate
   * @returns True if valid, false otherwise
   */
  static validate(vttContent: string): boolean {
    if (!vttContent || typeof vttContent !== 'string') {
      return false;
    }

    const lines = vttContent.split('\n');
    
    // Check for WebVTT header
    if (!lines[0].trim().startsWith('WEBVTT')) {
      return false;
    }

    // Basic validation - check for at least one timestamp
    const hasTimestamp = lines.some(line => line.includes('-->'));
    return hasTimestamp;
  }

  /**
   * Clean WebVTT text by removing HTML tags and entities
   * @param text - Text to clean
   * @returns Cleaned text
   */
  static cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
  }
}