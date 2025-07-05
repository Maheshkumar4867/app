export default class TimeFormatter {
  /**
   * Formats seconds into HH:MM:SS or MM:SS format
   * @param seconds - Time in seconds
   * @returns Formatted time string
   */
  static formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) {
      return '00:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const formatNumber = (num: number): string => {
      return num.toString().padStart(2, '0');
    };

    if (hours > 0) {
      return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(secs)}`;
    } else {
      return `${formatNumber(minutes)}:${formatNumber(secs)}`;
    }
  }

  /**
   * Parses a time string (HH:MM:SS or MM:SS) into seconds
   * @param timeString - Time string to parse
   * @returns Time in seconds
   */
  static parseTime(timeString: string): number {
    if (!timeString || typeof timeString !== 'string') {
      return 0;
    }

    const parts = timeString.split(':').map(part => parseInt(part, 10));
    
    if (parts.length === 2) {
      // MM:SS format
      const [minutes, seconds] = parts;
      return (minutes * 60) + seconds;
    } else if (parts.length === 3) {
      // HH:MM:SS format
      const [hours, minutes, seconds] = parts;
      return (hours * 3600) + (minutes * 60) + seconds;
    }

    return 0;
  }

  /**
   * Formats duration for display with units
   * @param seconds - Duration in seconds
   * @returns Human-readable duration string
   */
  static formatDuration(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) {
      return '0 seconds';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];

    if (hours > 0) {
      parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }
    if (secs > 0 || parts.length === 0) {
      parts.push(`${secs} second${secs > 1 ? 's' : ''}`);
    }

    return parts.join(' ');
  }

  /**
   * Formats time as percentage of total duration
   * @param currentTime - Current time in seconds
   * @param totalDuration - Total duration in seconds
   * @returns Percentage as string
   */
  static formatPercentage(currentTime: number, totalDuration: number): string {
    if (!totalDuration || totalDuration <= 0) {
      return '0%';
    }

    const percentage = (currentTime / totalDuration) * 100;
    return `${Math.round(percentage)}%`;
  }
}