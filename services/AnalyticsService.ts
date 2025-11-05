// services/AnalyticsService.ts

import axios from 'axios';
import { API_CONFIG, getAnalyticsUrl, getAnalyticsBatchUrl } from '../config/api';

/**
 * Interface para eventos de analytics
 */
export interface AnalyticsEvent {
  type: string;
  screenName?: string;
  variant?: 'A' | 'B';
  buttonName?: string;
  renderTime?: number;
  timestamp: number;
  [key: string]: any;
}

/**
 * Serviço de analytics para coletar métricas de engajamento e performance
 * Envia automaticamente os dados para a API/banco de dados
 */
class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private pendingEvents: AnalyticsEvent[] = [];
  private batchTimer: ReturnType<typeof setInterval> | null = null;
  private isSending: boolean = false;

  constructor() {
    // Iniciar timer para envio em lote
    if (API_CONFIG.ENABLE_API_SYNC) {
      this.startBatchTimer();
    }
  }

  /**
   * Envia um evento único para a API
   */
  private async sendEventToAPI(event: AnalyticsEvent): Promise<void> {
    if (!API_CONFIG.ENABLE_API_SYNC) {
      return;
    }

    try {
      // Formato correto que o backend espera
      const logData = {
        type: event.type,
        message: this.formatEventMessage(event),
        screenName: event.screenName,
        variant: event.variant,
        buttonName: event.buttonName,
        renderTime: event.renderTime,
        timestamp: event.timestamp || Date.now(),
        metadata: {
          // Dados adicionais que não estão nos campos principais
          ...(event.metadata || {}),
        },
      };

      await axios.post(getAnalyticsUrl(), logData, {
        timeout: API_CONFIG.TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: (status) => status < 500,
      });

      console.log(`[Analytics] Event sent to API: ${event.type}`);
    } catch (error: any) {
      // Não quebrar a aplicação se a API estiver offline
      console.warn(`[Analytics] Failed to send event to API:`, error.message);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.warn(`[Analytics] ⏱️ Request timed out`);
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.warn(`[Analytics] ⚠️ Server not reachable`);
      }
      
      if (error.response) {
        console.warn(`[Analytics] Response status:`, error.response.status);
        console.warn(`[Analytics] Response data:`, error.response.data);
      }
      // Adicionar à fila de pendentes para tentar novamente depois
      this.pendingEvents.push(event);
    }
  }

  /**
   * Formata mensagem do evento para o backend
   */
  private formatEventMessage(event: AnalyticsEvent): string {
    switch (event.type) {
      case 'SCREEN_VIEW':
        return `Screen View: ${event.screenName} (Variant ${event.variant})`;
      case 'BUTTON_CLICK':
        return `Button Click: ${event.buttonName} on ${event.screenName}`;
      case 'RENDER_TIME':
        return `Render Time: ${event.screenName} - ${event.renderTime}ms`;
      default:
        return `Event: ${event.type}`;
    }
  }

  /**
   * Envia eventos em lote para a API
   */
  private async sendBatchToAPI(): Promise<void> {
    if (this.isSending) {
      console.log(`[Analytics] Already sending, skipping...`);
      return;
    }
    
    if (this.pendingEvents.length === 0) {
      console.log(`[Analytics] No pending events to send`);
      return;
    }

    console.log(`[Analytics] 🚀 Starting batch send. Pending events: ${this.pendingEvents.length}`);
    this.isSending = true;
    const eventsToSend = [...this.pendingEvents];
    this.pendingEvents = [];

    try {
      const url = getAnalyticsBatchUrl();
      console.log(`[Analytics] 📡 Sending to: ${url}`);

      // Preparar eventos para envio em batch - formato correto que o backend espera
      const eventsData = eventsToSend.map(event => ({
        type: event.type,
        message: this.formatEventMessage(event),
        screenName: event.screenName,
        variant: event.variant,
        buttonName: event.buttonName,
        renderTime: event.renderTime,
        timestamp: event.timestamp || Date.now(),
        metadata: event.metadata || {},
      }));

      console.log(`[Analytics] 📦 Prepared ${eventsData.length} events for batch`);
      console.log(`[Analytics] Data:`, JSON.stringify(eventsData, null, 2));

      // Enviar em lotes usando o endpoint batch
      const batches = [];
      for (let i = 0; i < eventsData.length; i += API_CONFIG.BATCH_SIZE) {
        batches.push(eventsData.slice(i, i + API_CONFIG.BATCH_SIZE));
      }

      console.log(`[Analytics] Split into ${batches.length} batches`);

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        try {
          console.log(`[Analytics] 📤 Sending batch ${batchIndex + 1}/${batches.length} with ${batch.length} events...`);
          
          const response = await axios.post(url, { events: batch }, {
            timeout: API_CONFIG.TIMEOUT,
            headers: {
              'Content-Type': 'application/json',
            },
            validateStatus: (status) => status < 500, // Aceitar até 499 como sucesso
          });
          
          if (response.status >= 200 && response.status < 300) {
            console.log(`[Analytics] ✅ Batch sent successfully!`, response.data);
          } else {
            throw new Error(`Server returned status ${response.status}`);
          }
        } catch (batchError: any) {
          console.error(`[Analytics] ❌ Failed to send batch:`, batchError.message);
          
          // Tratar diferentes tipos de erro
          if (batchError.code === 'ECONNABORTED' || batchError.message.includes('timeout')) {
            console.error(`[Analytics] ⏱️ Request timed out after ${API_CONFIG.TIMEOUT}ms`);
            console.error(`[Analytics] Server may be slow or unreachable`);
          } else if (batchError.code === 'ECONNREFUSED' || batchError.code === 'ENOTFOUND') {
            console.error(`[Analytics] ⚠️ Connection refused or server not found`);
            console.error(`[Analytics] Server URL: ${url}`);
            console.error(`[Analytics] Check if server is running at ${url}`);
          } else if (batchError.code) {
            console.error(`[Analytics] Error code:`, batchError.code);
          }
          
          if (batchError.response) {
            console.error(`[Analytics] Response status:`, batchError.response.status);
            console.error(`[Analytics] Response data:`, JSON.stringify(batchError.response.data, null, 2));
          } else if (batchError.request && !batchError.code) {
            console.error(`[Analytics] ⚠️ No response received!`);
            console.error(`[Analytics] This usually means the server is not reachable at ${url}`);
            console.error(`[Analytics] Check if server is running and URL is correct`);
          }
          // Se falhar, adicionar os eventos originais correspondentes de volta à fila
          const batchStart = batchIndex * API_CONFIG.BATCH_SIZE;
          const batchEnd = Math.min(batchStart + batch.length, eventsToSend.length);
          for (let i = batchStart; i < batchEnd; i++) {
            this.pendingEvents.push(eventsToSend[i]);
          }
          console.warn(`[Analytics] Re-added ${batchEnd - batchStart} events to queue`);
        }
      }

      console.log(`[Analytics] ✅ Batch processing complete: ${eventsToSend.length} events processed`);
    } catch (error: any) {
      console.error(`[Analytics] ❌ Fatal error in batch send:`, error.message);
      if (error.response) {
        console.error(`[Analytics] Response status:`, error.response.status);
        console.error(`[Analytics] Response data:`, JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error(`[Analytics] No response received`);
      }
      // Recolocar eventos originais na fila se falhar completamente
      this.pendingEvents.unshift(...eventsToSend);
      console.warn(`[Analytics] Re-added all ${eventsToSend.length} events to queue`);
    } finally {
      // Sempre liberar o flag de envio, mesmo em caso de erro
      this.isSending = false;
      console.log(`[Analytics] Send flag released`);
    }
  }

  /**
   * Inicia timer para envio em lote periódico
   */
  private startBatchTimer(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = setInterval(() => {
      this.sendBatchToAPI();
    }, API_CONFIG.BATCH_INTERVAL);
  }

  /**
   * Registra um evento genérico
   */
  private logEvent(event: AnalyticsEvent): void {
    this.events.push(event);
    console.log(`[Analytics] Event logged: ${event.type}`, event);
    
    if (API_CONFIG.ENABLE_API_SYNC) {
      // Adicionar à fila de pendentes para envio
      this.pendingEvents.push(event);
      console.log(`[Analytics] Event added to queue. Total pending: ${this.pendingEvents.length}`);
      
      // Enviar imediatamente se houver eventos e não estiver enviando
      if (this.pendingEvents.length >= 1 && !this.isSending) {
        console.log(`[Analytics] Triggering immediate batch send...`);
        // Usar setTimeout para não bloquear
        setTimeout(() => {
          this.sendBatchToAPI();
        }, 0);
      }
    } else {
      console.warn(`[Analytics] API sync is disabled!`);
    }
  }

  /**
   * Registra visualização de tela
   */
  logScreenView(screenName: string, variant: 'A' | 'B'): void {
    const event: AnalyticsEvent = {
      type: 'SCREEN_VIEW',
      screenName,
      variant,
      timestamp: Date.now(),
    };
    this.logEvent(event);
    console.log(`[Analytics] Screen View: ${screenName} (Variant ${variant})`);
  }

  /**
   * Registra clique em botão
   */
  logButtonClick(buttonName: string, screenName: string): void {
    const event: AnalyticsEvent = {
      type: 'BUTTON_CLICK',
      buttonName,
      screenName,
      timestamp: Date.now(),
    };
    this.logEvent(event);
    console.log(`[Analytics] Button Click: ${buttonName} on ${screenName}`);
  }

  /**
   * Registra tempo de renderização
   */
  logRenderTime(screenName: string, renderTime: number): void {
    const event: AnalyticsEvent = {
      type: 'RENDER_TIME',
      screenName,
      renderTime,
      timestamp: Date.now(),
    };
    this.logEvent(event);
    console.log(`[Analytics] Render Time: ${screenName} - ${renderTime}ms`);
  }

  /**
   * Obtém todos os eventos coletados
   */
  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  /**
   * Obtém eventos filtrados por tipo
   */
  getEventsByType(type: string): AnalyticsEvent[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Limpa todos os eventos (útil para testes)
   */
  clearEvents(): void {
    this.events = [];
    this.pendingEvents = [];
  }

  /**
   * Força o envio imediato de todos os eventos pendentes
   */
  async flushEvents(): Promise<void> {
    await this.sendBatchToAPI();
  }

  /**
   * Obtém o número de eventos pendentes de envio
   */
  getPendingEventsCount(): number {
    return this.pendingEvents.length;
  }
}

export default new AnalyticsService();