import { DeviceEventEmitter } from 'react-native';

class AnalyticsService {
  private events: any[] = [];

  constructor() {
    // Inicializa listener de eventos do Native
    DeviceEventEmitter.addListener('analyticsEvent', (event) => {
      this.events.push({ ...event, timestamp: Date.now() });
      console.log(`[Analytics] Evento Native recebido:`, event);
    });
  }

  logScreenView(screenName: string, variant: 'A' | 'B'): void {
    const event = { type: 'SCREEN_VIEW', screenName, variant, timestamp: Date.now() };
    this.events.push(event);
    console.log(`[Analytics] Screen View: ${screenName} (Variant ${variant})`);
  }

  logButtonClick(buttonName: string, screenName: string): void {
    const event = { type: 'BUTTON_CLICK', buttonName, screenName, timestamp: Date.now() };
    this.events.push(event);
    console.log(`[Analytics] Button Click: ${buttonName} on ${screenName}`);
  }

  logRenderTime(screenName: string, renderTime: number): void {
    const event = { type: 'RENDER_TIME', screenName, renderTime, timestamp: Date.now() };
    this.events.push(event);
    console.log(`[Analytics] Render Time: ${screenName} - ${renderTime}ms`);
  }

  getEvents(): any[] {
    return this.events;
  }

  getEventsByType(type: string): any[] {
    return this.events.filter(event => event.type === type);
  }

  clearEvents(): void {
    this.events = [];
  }
}

export default new AnalyticsService();
