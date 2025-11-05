// screens/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import tw from 'twrnc';
import AnalyticsService, { type AnalyticsEvent } from '../services/AnalyticsService';
import ABTestingService from '../services/ABTestingService';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  LineChart,
  BarChart,
  PieChart
} from 'react-native-chart-kit';

type DashboardScreenProps = {
  navigation: StackNavigationProp<any>;
};

type RenderTimeData = {
  [key: string]: number[];
};

const { width: screenWidth } = Dimensions.get('window');

// Configuração do gráfico
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [currentVariant, setCurrentVariant] = useState<'A' | 'B'>('A');
  const [metrics, setMetrics] = useState<any>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'screens' | 'buttons' | 'performance' | 'abtest'>('overview');

  // Carregar variante inicial e métricas
  useEffect(() => {
    const loadInitialData = () => {
      const variant = ABTestingService.getUserVariant();
      setCurrentVariant(variant);
      AnalyticsService.logScreenView('Dashboard', variant);
      loadMetrics();
    };

    loadInitialData();
    
    // Atualizar métricas a cada 3 segundos
    const interval = setInterval(() => {
      loadMetrics();
      setUpdateCount(prev => prev + 1);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = () => {
    try {
      const events = AnalyticsService.getEvents() as AnalyticsEvent[];
      const screenViews = AnalyticsService.getEventsByType('SCREEN_VIEW') as AnalyticsEvent[];
      const buttonClicks = AnalyticsService.getEventsByType('BUTTON_CLICK') as AnalyticsEvent[];
      const renderTimes = AnalyticsService.getEventsByType('RENDER_TIME') as AnalyticsEvent[];
      
      // Calcular métricas com verificação de undefined
      const avgRenderTime = renderTimes.length > 0 
        ? renderTimes.reduce((acc: number, curr: AnalyticsEvent) => acc + (curr.renderTime || 0), 0) / renderTimes.length 
        : 0;

      const buttonCounts = buttonClicks.reduce((acc: Record<string, number>, event: AnalyticsEvent) => {
        const buttonName = event.buttonName || 'Unknown';
        acc[buttonName] = (acc[buttonName] || 0) + 1;
        return acc;
      }, {});

      const screenViewCounts = screenViews.reduce((acc: Record<string, number>, event: AnalyticsEvent) => {
        const screenName = event.screenName || 'Unknown';
        acc[screenName] = (acc[screenName] || 0) + 1;
        return acc;
      }, {});

      const renderTimeData = screenViews.reduce((acc: RenderTimeData, event: AnalyticsEvent) => {
        const screenName = event.screenName || 'Unknown';
        if (!acc[screenName]) acc[screenName] = [];
        
        const screenRenderTimes = renderTimes.filter((rt: AnalyticsEvent) => rt.screenName === screenName);
        if (screenRenderTimes.length > 0) {
          const latestRenderTime = screenRenderTimes[screenRenderTimes.length - 1].renderTime;
          if (latestRenderTime) {
            acc[screenName].push(latestRenderTime);
          }
        }
        return acc;
      }, {});

      const variantDistribution = {
        A: events.filter((e: AnalyticsEvent) => e.variant === 'A').length,
        B: events.filter((e: AnalyticsEvent) => e.variant === 'B').length,
      };

      setMetrics({
        totalEvents: events.length,
        screenViews: screenViewCounts,
        buttonClicks: buttonCounts,
        renderTimes: renderTimeData,
        variantDistribution,
        avgRenderTime,
        lastEvents: events.slice(-10)
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleToggleVariant = () => {
    const newVariant = currentVariant === 'A' ? 'B' : 'A';
    AnalyticsService.logButtonClick('Toggle AB Variant', 'Dashboard');
    setCurrentVariant(newVariant);
    ABTestingService.setUserVariant(newVariant);
    loadMetrics();
  };

  const handleResetABTest = () => {
    AnalyticsService.logButtonClick('Reset AB Test', 'Dashboard');
    ABTestingService.resetTest();
    const newVariant = ABTestingService.getUserVariant();
    setCurrentVariant(newVariant);
    loadMetrics();
  };

  const handleClearData = () => {
    AnalyticsService.logButtonClick('Clear Analytics Data', 'Dashboard');
    AnalyticsService.clearEvents();
    loadMetrics();
  };

  // Preparar dados para gráficos
  const prepareChartData = () => {
    if (!metrics) return { screenViewData: null, buttonClickData: null, renderTimeData: null, variantData: null };

    // Dados para gráfico de barras (telas)
    const screenViewLabels = Object.keys(metrics.screenViews).map(name => 
      name.length > 8 ? name.substring(0, 8) + '...' : name
    );
    const screenViewValues = Object.values(metrics.screenViews) as number[];

    const screenViewData = {
      labels: screenViewLabels,
      datasets: [
        {
          data: screenViewValues,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    // Dados para gráfico de barras (botões)
    const buttonLabels = Object.keys(metrics.buttonClicks).map(name => 
      name.length > 8 ? name.substring(0, 8) + '...' : name
    );
    const buttonValues = Object.values(metrics.buttonClicks) as number[];

    const buttonClickData = {
      labels: buttonLabels,
      datasets: [
        {
          data: buttonValues,
          color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    // Dados para gráfico de barras (performance)
    const renderLabels = Object.keys(metrics.renderTimes).map(name => 
      name.length > 8 ? name.substring(0, 8) + '...' : name
    );
    const renderValues = Object.entries(metrics.renderTimes as RenderTimeData).map(([name, times]) => {
      return times.length > 0 ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 0;
    });

    const renderTimeData = {
      labels: renderLabels,
      datasets: [
        {
          data: renderValues,
          color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    // Dados para gráfico de pizza (A/B Test)
    const variantData = [
      {
        name: 'Variante A',
        population: metrics.variantDistribution.A,
        color: '#8884d8',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
      {
        name: 'Variante B',
        population: metrics.variantDistribution.B,
        color: '#82ca9d',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
    ];

    return { screenViewData, buttonClickData, renderTimeData, variantData };
  };

  const { screenViewData, buttonClickData, renderTimeData, variantData } = prepareChartData();

  if (!metrics) {
    return (
      <View style={tw`flex-1 bg-gray-50 justify-center items-center`}>
        <Text style={tw`text-lg`}>Carregando métricas...</Text>
      </View>
    );
  }

  const ChartContainer = ({ children, title, height = 200 }: { children: React.ReactNode; title: string; height?: number }) => (
    <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
      <Text style={tw`text-lg font-bold mb-4 text-center`}>{title}</Text>
      <View style={[tw`items-center justify-center`, { height }]}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`bg-white p-4 shadow-sm`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <View style={tw`flex-row items-center gap-4`}>
            <View>
              <Text style={tw`text-2xl font-bold`}>Dashboard Analytics</Text>
              <Text style={tw`text-gray-600`}>
                Métricas em tempo real - {updateCount} atualizações
              </Text>
            </View>
          </View>
          
          <View style={tw`bg-blue-100 px-3 py-1 rounded-full`}>
            <Text style={tw`font-bold text-blue-800`}>Variante {currentVariant}</Text>
          </View>
        </View>

        {/* Cards de Resumo */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-4`}>
          <View style={tw`flex-row gap-3`}>
            <View style={tw`bg-blue-50 p-4 rounded-lg min-w-32`}>
              <Text style={tw`text-sm font-medium text-blue-600`}>Total Eventos</Text>
              <Text style={tw`text-2xl font-bold text-blue-800`}>{metrics.totalEvents}</Text>
            </View>
            
            <View style={tw`bg-green-50 p-4 rounded-lg min-w-32`}>
              <Text style={tw`text-sm font-medium text-green-600`}>Visualizações</Text>
              <Text style={tw`text-2xl font-bold text-green-800`}>
                {Object.values(metrics.screenViews).reduce((sum: number, val: any) => sum + val, 0)}
              </Text>
            </View>
            
            <View style={tw`bg-purple-50 p-4 rounded-lg min-w-32`}>
              <Text style={tw`text-sm font-medium text-purple-600`}>Cliques</Text>
              <Text style={tw`text-2xl font-bold text-purple-800`}>
                {Object.values(metrics.buttonClicks).reduce((sum: number, val: any) => sum + val, 0)}
              </Text>
            </View>
            
            <View style={tw`bg-orange-50 p-4 rounded-lg min-w-32`}>
              <Text style={tw`text-sm font-medium text-orange-600`}>Tempo Render</Text>
              <Text style={tw`text-2xl font-bold text-orange-800`}>
                {metrics.avgRenderTime.toFixed(0)}ms
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={tw`flex-row`}>
            {[
              { key: 'overview', label: 'Visão Geral' },
              { key: 'screens', label: 'Telas' },
              { key: 'buttons', label: 'Botões' },
              { key: 'performance', label: 'Performance' },
              { key: 'abtest', label: 'A/B Test' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={tw`px-4 py-2 mx-1 rounded-full ${
                  activeTab === tab.key ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text style={tw`font-medium ${
                  activeTab === tab.key ? 'text-white' : 'text-gray-700'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Conteúdo das Tabs */}
      <ScrollView style={tw`flex-1 p-4`}>
        {activeTab === 'overview' && (
          <View style={tw`space-y-4`}>
            <ChartContainer title="Visualizações por Tela" height={300}>
              {screenViewData && screenViewData.datasets[0].data.length > 0 ? (
                <BarChart
                  data={screenViewData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  fromZero={true}
                  showValuesOnTopOfBars={true}
                />
              ) : (
                <Text style={tw`text-center text-gray-500 py-8`}>
                  Nenhuma visualização de tela registrada
                </Text>
              )}
            </ChartContainer>

            <ChartContainer title="Distribuição A/B Test" height={300}>
              {variantData && variantData.some(d => d.population > 0) ? (
                <PieChart
                  data={variantData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              ) : (
                <Text style={tw`text-center text-gray-500 py-8`}>
                  Nenhum dado de variante registrado
                </Text>
              )}
            </ChartContainer>
          </View>
        )}

        {activeTab === 'screens' && (
          <ChartContainer title="Visualizações por Tela" height={300}>
            {screenViewData && screenViewData.datasets[0].data.length > 0 ? (
              <>
                <BarChart
                  data={screenViewData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  fromZero={true}
                  showValuesOnTopOfBars={true}
                />
                <View style={tw`mt-4 w-full`}>
                  {Object.entries(metrics.screenViews).map(([name, views]) => (
                    <View key={name} style={tw`flex-row justify-between items-center p-3 bg-gray-50 rounded mb-2`}>
                      <Text style={tw`font-medium flex-1`}>{name}</Text>
                      <Text style={tw`bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-medium`}>
                        {views as number} visualizações
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={tw`text-center text-gray-500 py-8`}>
                Nenhuma visualização de tela registrada
              </Text>
            )}
          </ChartContainer>
        )}

        {activeTab === 'buttons' && (
          <ChartContainer title="Cliques em Botões" height={300}>
            {buttonClickData && buttonClickData.datasets[0].data.length > 0 ? (
              <>
                <BarChart
                  data={buttonClickData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  fromZero={true}
                  showValuesOnTopOfBars={true}
                />
                <View style={tw`mt-4 w-full`}>
                  {Object.entries(metrics.buttonClicks).map(([name, clicks]) => (
                    <View key={name} style={tw`flex-row justify-between items-center p-3 bg-gray-50 rounded mb-2`}>
                      <Text style={tw`font-medium flex-1`}>{name}</Text>
                      <Text style={tw`bg-green-100 px-3 py-1 rounded-full text-green-800 font-medium`}>
                        {clicks as number} cliques
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={tw`text-center text-gray-500 py-8`}>
                Nenhum clique em botão registrado
              </Text>
            )}
          </ChartContainer>
        )}

        {activeTab === 'performance' && (
          <ChartContainer title="Tempo de Renderização" height={300}>
            {renderTimeData && renderTimeData.datasets[0].data.length > 0 ? (
              <>
                <BarChart
                  data={renderTimeData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  fromZero={true}
                  showValuesOnTopOfBars={true}
                />
                <View style={tw`mt-4 w-full`}>
                  {Object.entries(metrics.renderTimes as RenderTimeData).map(([name, times]) => {
                    const avgTime = times.length > 0 
                      ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length)
                      : 0;
                    return (
                      <View key={name} style={tw`flex-row justify-between items-center p-3 bg-gray-50 rounded mb-2`}>
                        <View style={tw`flex-1`}>
                          <Text style={tw`font-medium`}>{name}</Text>
                          <Text style={tw`text-xs text-gray-600`}>{times.length} amostras</Text>
                        </View>
                        <Text style={tw`bg-yellow-100 px-3 py-1 rounded-full text-yellow-800 font-medium`}>
                          {avgTime}ms
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : (
              <Text style={tw`text-center text-gray-500 py-8`}>
                Nenhuma métrica de performance registrada
              </Text>
            )}
          </ChartContainer>
        )}

        {activeTab === 'abtest' && (
          <View style={tw`space-y-4`}>
            <ChartContainer title="Distribuição de Variantes" height={300}>
              {variantData && variantData.some(d => d.population > 0) ? (
                <>
                  <PieChart
                    data={variantData}
                    width={screenWidth - 64}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                  <View style={tw`mt-4 w-full space-y-2`}>
                    {variantData.map((item, index) => (
                      <View key={index} style={tw`flex-row justify-between items-center p-3 bg-gray-50 rounded`}>
                        <View style={tw`flex-row items-center gap-3`}>
                          <View 
                            style={[
                              tw`w-4 h-4 rounded-full`,
                              { backgroundColor: item.color }
                            ]}
                          />
                          <Text style={tw`font-medium`}>{item.name}</Text>
                        </View>
                        <Text style={tw`bg-purple-100 px-3 py-1 rounded-full text-purple-800 font-medium`}>
                          {item.population} eventos
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={tw`text-center text-gray-500 py-8`}>
                  Nenhum dado de variante registrado
                </Text>
              )}
            </ChartContainer>

            <View style={tw`bg-white p-4 rounded-lg shadow`}>
              <Text style={tw`text-lg font-bold mb-4`}>Controles do Teste A/B</Text>
              
              <View style={tw`flex-row gap-2 mb-4`}>
                <TouchableOpacity 
                  style={tw`flex-1 bg-blue-500 p-3 rounded-lg`}
                  onPress={handleToggleVariant}
                >
                  <Text style={tw`text-white text-center font-medium`}>
                    Trocar para {currentVariant === 'A' ? 'B' : 'A'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={tw`flex-1 bg-gray-500 p-3 rounded-lg`}
                  onPress={handleResetABTest}
                >
                  <Text style={tw`text-white text-center font-medium`}>Reset A/B</Text>
                </TouchableOpacity>
              </View>

              <View style={tw`mb-4`}>
                <Text style={tw`font-medium mb-2`}>Variante Atual</Text>
                <View style={tw`bg-blue-500 px-4 py-2 rounded-full self-start`}>
                  <Text style={tw`text-white font-bold text-lg`}>Variante {currentVariant}</Text>
                </View>
              </View>
              
              <View style={tw`mb-4`}>
                <Text style={tw`font-medium mb-2`}>Hipótese do Teste</Text>
                <Text style={tw`text-gray-600 text-sm`}>
                  A adição da aba "Notificações" (Variante B) aumenta o engajamento do usuário 
                  comparado ao layout original (Variante A).
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Botão Limpar Dados */}
        <TouchableOpacity 
          style={tw`bg-red-500 p-4 rounded-lg mt-4`}
          onPress={handleClearData}
        >
          <Text style={tw`text-white text-center font-bold`}>Limpar Todos os Dados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}