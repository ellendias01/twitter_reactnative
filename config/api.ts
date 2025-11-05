
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://192.168.226.237:8080' // IP da máquina para Expo/React Native - ATUALIZE quando mudar de rede
    : 'http://192.168.226.237:8080', // Para produção - ALTERE para sua URL real
  
  // Endpoint para analytics
  ANALYTICS_ENDPOINT: '/api/analytics',
  
  // Timeout para requisições (em ms)
  TIMEOUT: 8000,
  
  // Habilitar envio automático para API
  ENABLE_API_SYNC: true,
  
  // Tamanho do lote para envio em batch
  BATCH_SIZE: 10,
  
  // Intervalo para envio em lote (em ms) - reduzido para envio mais rápido
  BATCH_INTERVAL: 2000,
};

export const getAnalyticsUrl = (): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ANALYTICS_ENDPOINT}`;
};

export const getAnalyticsBatchUrl = (): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ANALYTICS_ENDPOINT}/batch`;
};

