// services/AnalyticsService.ts

/**
 * Serviço de analytics para coletar métricas de engajamento e performance
 * Simula integração com ferramentas como Firebase Analytics
 */
class AnalyticsService {
  private events: any[] = [];

  /**
   * Registra visualização de tela
   */
  logScreenView(screenName: string, variant: 'A' | 'B'): void {
    const event = {
      type: 'SCREEN_VIEW',
      screenName,
      variant,
      timestamp: Date.now(),
    };
    this.events.push(event);
    console.log(`[Analytics] Screen View: ${screenName} (Variant ${variant})`);
  }

  /**
   * Registra clique em botão
   */
  logButtonClick(buttonName: string, screenName: string): void {
    const event = {
      type: 'BUTTON_CLICK',
      buttonName,
      screenName,
      timestamp: Date.now(),
    };
    this.events.push(event);
    console.log(`[Analytics] Button Click: ${buttonName} on ${screenName}`);
  }

  /**
   * Registra tempo de renderização
   */
  logRenderTime(screenName: string, renderTime: number): void {
    const event = {
      type: 'RENDER_TIME',
      screenName,
      renderTime,
      timestamp: Date.now(),
    };
    this.events.push(event);
    console.log(`[Analytics] Render Time: ${screenName} - ${renderTime}ms`);
  }

  /**
   * Obtém todos os eventos coletados
   */
  getEvents(): any[] {
    return this.events;
  }

  /**
   * Obtém eventos filtrados por tipo
   */
  getEventsByType(type: string): any[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Limpa todos os eventos (útil para testes)
   */
  clearEvents(): void {
    this.events = [];
  }
}

export default new AnalyticsService();