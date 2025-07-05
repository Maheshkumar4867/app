type EventCallback = (...args: any[]) => void;

export default class EventBus {
  private events: Map<string, EventCallback[]> = new Map();
  private onceEvents: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event
   * @param event - Event name
   * @param callback - Callback function
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(callback);
  }

  /**
   * Subscribe to an event that will only be called once
   * @param event - Event name
   * @param callback - Callback function
   */
  once(event: string, callback: EventCallback): void {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, []);
    }
    this.onceEvents.get(event)?.push(callback);
  }

  /**
   * Unsubscribe from an event
   * @param event - Event name
   * @param callback - Callback function to remove
   */
  off(event: string, callback: EventCallback): void {
    if (this.events.has(event)) {
      const callbacks = this.events.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.events.delete(event);
      }
    }

    if (this.onceEvents.has(event)) {
      const callbacks = this.onceEvents.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.onceEvents.delete(event);
      }
    }
  }

  /**
   * Emit an event
   * @param event - Event name
   * @param data - Optional data to pass to callbacks
   */
  emit(event: string, ...data: any[]): void {
    // Call regular event callbacks
    if (this.events.has(event)) {
      const callbacks = this.events.get(event) || [];
      callbacks.forEach(callback => {
        try {
          callback(...data);
        } catch (error) {
          console.error(`EventBus error in callback for event '${event}':`, error);
        }
      });
    }

    // Call once event callbacks and remove them
    if (this.onceEvents.has(event)) {
      const callbacks = this.onceEvents.get(event) || [];
      callbacks.forEach(callback => {
        try {
          callback(...data);
        } catch (error) {
          console.error(`EventBus error in once callback for event '${event}':`, error);
        }
      });
      this.onceEvents.delete(event);
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    this.events.clear();
    this.onceEvents.clear();
  }

  /**
   * Remove all listeners for a specific event
   * @param event - Event name
   */
  removeAllListenersForEvent(event: string): void {
    this.events.delete(event);
    this.onceEvents.delete(event);
  }

  /**
   * Get the number of listeners for an event
   * @param event - Event name
   * @returns Number of listeners
   */
  listenerCount(event: string): number {
    const regularListeners = this.events.get(event)?.length || 0;
    const onceListeners = this.onceEvents.get(event)?.length || 0;
    return regularListeners + onceListeners;
  }

  /**
   * Get all event names that have listeners
   * @returns Array of event names
   */
  eventNames(): string[] {
    const regularEvents = Array.from(this.events.keys());
    const onceEvents = Array.from(this.onceEvents.keys());
    return [...new Set([...regularEvents, ...onceEvents])];
  }
}