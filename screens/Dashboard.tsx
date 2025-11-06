// screens/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import tw from 'twrnc';
import AnalyticsService, { type AnalyticsEvent } from '../services/AnalyticsService';
import ABTestingService from '../services/ABTestingService';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  LineChart,
  BarChart,
  PieChart
} from 'react-native-chart-kit';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type DashboardScreenProps = {
  navigation: StackNavigationProp<any>;
};

type RenderTimeData = {
  [key: string]: number[];
};

const { width: screenWidth } = Dimensions.get('window');

// Configuração do gráfico com tema escuro idêntico ao Flutter
const chartConfig = {
  backgroundColor: '#0F172A',
  backgroundGradientFrom: '#0F172A',
  backgroundGradientTo: '#0F172A',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#60A5FA',
  },
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [currentVariant, setCurrentVariant] = useState<'A' | 'B'>('A');
  const [metrics, setMetrics] = useState<any>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'screens' | 'buttons' | 'performance' | 'abtest'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const loadInitialData = () => {
    const variant = ABTestingService.getUserVariant();
    setCurrentVariant(variant);
    AnalyticsService.logScreenView('Dashboard', variant);
    loadMetrics();
  };

  useEffect(() => {
    loadInitialData();
    
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

      // Simular dados do dashboard Flutter
      const simulatedData = {
        realtimeEvents: events.length,
        avgScreenLoad: avgRenderTime,
        avgApiResponse: avgRenderTime * 0.8,
        avgMemory: (events.length * 0.1),
        performanceMetrics: Array.from({length: 10}, (_, i) => ({ screenLoadTime: avgRenderTime * (0.9 + Math.random() * 0.2) })),
        abTestResults: [
          { version: 'A', users: variantDistribution.A, conversionRate: (variantDistribution.A / (variantDistribution.A + variantDistribution.B) * 100).toFixed(1), avgEngagement: (avgRenderTime * 0.8).toFixed(0), avgSessionTime: avgRenderTime.toFixed(0) },
          { version: 'B', users: variantDistribution.B, conversionRate: (variantDistribution.B / (variantDistribution.A + variantDistribution.B) * 100).toFixed(1), avgEngagement: (avgRenderTime * 0.9).toFixed(0), avgSessionTime: (avgRenderTime * 1.2).toFixed(0) }
        ]
      };

      setMetrics({
        ...simulatedData,
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

  const onRefresh = () => {
    setRefreshing(true);
    loadInitialData();
    setTimeout(() => setRefreshing(false), 1000);
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

  const handleNavigateToVariant = (variant: 'A' | 'B') => {
    AnalyticsService.logButtonClick(`Navigate to Variant ${variant}`, 'Dashboard');
    
    // Navegar para a tela correspondente da variante
    if (variant === 'A') {
      navigation.navigate('VariantAScreen');
    } else {
      navigation.navigate('VariantBScreen');
    }
  };

  const prepareChartData = () => {
    if (!metrics) return { screenViewData: null, buttonClickData: null, renderTimeData: null, variantData: null };

    const screenViewLabels = Object.keys(metrics.screenViews).map(name => 
      name.length > 8 ? name.substring(0, 8) + '...' : name
    );
    const screenViewValues = Object.values(metrics.screenViews) as number[];

    const screenViewData = {
      labels: screenViewLabels,
      datasets: [
        {
          data: screenViewValues,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    const buttonLabels = Object.keys(metrics.buttonClicks).map(name => 
      name.length > 8 ? name.substring(0, 8) + '...' : name
    );
    const buttonValues = Object.values(metrics.buttonClicks) as number[];

    const buttonClickData = {
      labels: buttonLabels,
      datasets: [
        {
          data: buttonValues,
          color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

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
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    const variantData = [
      {
        name: 'Variante A',
        population: metrics.variantDistribution.A,
        color: '#3B82F6',
        legendFontColor: '#CBD5E1',
        legendFontSize: 12,
      },
      {
        name: 'Variante B',
        population: metrics.variantDistribution.B,
        color: '#10B981',
        legendFontColor: '#CBD5E1',
        legendFontSize: 12,
      },
    ];

    return { screenViewData, buttonClickData, renderTimeData, variantData };
  };

  const { screenViewData, buttonClickData, renderTimeData, variantData } = prepareChartData();

  if (!metrics) {
    return (
      <View style={tw`flex-1 bg-[#0F172A] justify-center items-center`}>
        <Text style={tw`text-white text-lg`}>Carregando métricas...</Text>
      </View>
    );
  }

  const ChartContainer = ({ children, title, subtitle, height = 200 }: { children: React.ReactNode; title: string; subtitle?: string; height?: number }) => (
    <View style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-4`}>
      <Text style={tw`text-white text-lg font-bold`}>{title}</Text>
      {subtitle && <Text style={tw`text-gray-400 text-sm mb-4`}>{subtitle}</Text>}
      <View style={[tw`items-center justify-center`, { height }]}>
        {children}
      </View>
    </View>
  );

  const MetricCard = ({ title, value, icon, color, trend, subtitle }: any) => (
    <View style={tw`bg-white bg-opacity-5 p-3 rounded-xl border border-white border-opacity-10`}>
      <View style={tw`flex-row justify-between items-start mb-3`}>
        <View style={[tw`p-2 rounded-lg`, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[tw`text-xs font-medium`, trend.startsWith('+') ? tw`text-green-400` : tw`text-red-400`]}>
          {trend}
        </Text>
      </View>
      <View>
        <Text style={tw`text-white text-lg font-bold`}>{value}</Text>
        <Text style={tw`text-gray-400 text-sm mt-1`}>{title}</Text>
        <Text style={tw`text-gray-500 text-xs mt-1`}>{subtitle}</Text>
      </View>
    </View>
  );

  const ABTestCard = ({ result, isWinner }: any) => (
    <View style={[tw`p-3 rounded-lg`, isWinner ? tw`bg-green-500 bg-opacity-10 border border-green-500 border-opacity-50` : tw`bg-white bg-opacity-5 border border-white border-opacity-10`]}>
      <View style={tw`flex-row justify-between items-start mb-3`}>
        <Text style={tw`text-white text-base font-bold`}>Versão {result.version}</Text>
        {isWinner && (
          <View style={tw`bg-green-500 px-2 py-1 rounded-full`}>
            <Text style={tw`text-white text-xs font-bold`}>Vencedor</Text>
          </View>
        )}
      </View>
      <View style={tw`flex-row flex-wrap justify-between`}>
        <View style={tw`w-1/2 mb-2`}>
          <Text style={tw`text-white text-sm font-bold`}>{result.users}</Text>
          <Text style={tw`text-gray-400 text-xs`}>Usuários</Text>
        </View>
        <View style={tw`w-1/2 mb-2`}>
          <Text style={tw`text-white text-sm font-bold`}>{result.conversionRate}%</Text>
          <Text style={tw`text-gray-400 text-xs`}>Conversão</Text>
        </View>
        <View style={tw`w-1/2`}>
          <Text style={tw`text-white text-sm font-bold`}>{result.avgEngagement}%</Text>
          <Text style={tw`text-gray-400 text-xs`}>Engajamento</Text>
        </View>
        <View style={tw`w-1/2`}>
          <Text style={tw`text-white text-sm font-bold`}>{result.avgSessionTime}s</Text>
          <Text style={tw`text-gray-400 text-xs`}>Tempo Médio</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-[#0F172A]`}>
      <ScrollView 
        style={tw`flex-1 p-4`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Header */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row justify-between items-start`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-white text-2xl font-bold`}>Dashboard de Performance</Text>
              <Text style={tw`text-gray-400 text-sm mt-1`}>Monitoramento em tempo real</Text>
            </View>
          
          </View>
          
          <View style={tw`bg-green-500 bg-opacity-20 px-4 py-2 rounded-full border border-green-500 border-opacity-30 self-start mt-4`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-2 h-2 bg-green-400 rounded-full mr-2`} />
              <Text style={tw`text-green-400 font-medium`}>Live: {metrics.realtimeEvents || 0} eventos</Text>
            </View>
          </View>
        </View>

        {/* Controles A/B Test */}
        <View style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-6`}>
          <Text style={tw`text-white text-lg font-bold mb-4`}>Controles do Teste A/B</Text>
          
          <View style={tw`flex-row gap-3 mb-4`}>
            <TouchableOpacity
              style={tw`flex-1 bg-blue-500 bg-opacity-20 p-3 rounded-xl border border-blue-500 border-opacity-30`}
              onPress={handleToggleVariant}
            >
              <Text style={tw`text-blue-400 text-center font-medium`}>
                Trocar para {currentVariant === 'A' ? 'B' : 'A'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={tw`flex-1 bg-gray-500 bg-opacity-20 p-3 rounded-xl border border-gray-500 border-opacity-30`}
              onPress={handleResetABTest}
            >
              <Text style={tw`text-gray-400 text-center font-medium`}>Reset A/B</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-400 text-sm mb-2`}>Variante Atual</Text>
            <View style={tw`bg-blue-500 px-4 py-2 rounded-full self-start`}>
              <Text style={tw`text-white font-bold`}>Variante {currentVariant}</Text>
            </View>
          </View>
        
        </View>

        {/* Métricas Principais - Grid 2x2 */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row flex-wrap -mx-1.5`}>
            <View style={tw`w-1/2 px-1.5 mb-3`}>
              <MetricCard
                title="Carga de Tela"
                value={`${metrics.avgScreenLoad?.toFixed(0) || 0}ms`}
                icon="phone-portrait-outline"
                color="#3B82F6"
                trend="+12%"
                subtitle="Performance Monitor"
              />
            </View>
            <View style={tw`w-1/2 px-1.5 mb-3`}>
              <MetricCard
                title="Resposta API"
                value={`${metrics.avgApiResponse?.toFixed(0) || 0}ms`}
                icon="flash-outline"
                color="#8B5CF6"
                trend="+8%"
                subtitle="Network Monitor"
              />
            </View>
            <View style={tw`w-1/2 px-1.5`}>
              <MetricCard
                title="Uso de Memória"
                value={`${metrics.avgMemory?.toFixed(1) || 0}%`}
                icon="hardware-chip-outline"
                color="#10B981"
                trend="-3%"
                subtitle="System Metrics"
              />
            </View>
            <View style={tw`w-1/2 px-1.5`}>
              <MetricCard
                title="Throughput"
                value={`${metrics.realtimeEvents || 0}/s`}
                icon="server-outline"
                color="#F59E0B"
                trend="+15%"
                subtitle="Load Test"
              />
            </View>
          </View>
        </View>

        {/* Resultados do Teste A/B */}
        <View style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-6`}>
          <View style={tw`flex-row items-center mb-4`}>
            <Ionicons name="trending-up" size={20} color="white" />
            <Text style={tw`text-white text-lg font-bold ml-2`}>Resultados do Teste A/B</Text>
          </View>
          <View style={tw`flex-row -mx-1.5`}>
            <View style={tw`w-1/2 px-1.5`}>
              <ABTestCard result={metrics.abTestResults?.[0]} isWinner={false} />
            </View>
            <View style={tw`w-1/2 px-1.5`}>
              <ABTestCard result={metrics.abTestResults?.[1]} isWinner={true} />
            </View>
          </View>
        </View>

        {/* Gráfico de Performance */}
        <ChartContainer 
          title="Tendência de Performance" 
          subtitle="Últimas 10 medições"
          height={250}
        >
          {metrics.performanceMetrics && metrics.performanceMetrics.length > 0 ? (
            <LineChart
              data={{
                labels: metrics.performanceMetrics.map((_: any, i: { toString: () => any; }) => i.toString()),
                datasets: [
                  {
                    data: metrics.performanceMetrics.map((m: { screenLoadTime: any; }) => m.screenLoadTime),
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={tw`rounded-xl`}
            />
          ) : (
            <Text style={tw`text-gray-400 text-center py-8`}>
              Nenhuma métrica de performance registrada
            </Text>
          )}
          <View style={tw`flex-row justify-center mt-2`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-3 h-3 bg-blue-500 rounded-full mr-2`} />
              <Text style={tw`text-white text-sm`}>Carga de Tela (ms)</Text>
            </View>
          </View>
        </ChartContainer>

        {/* Ferramentas de Monitoramento */}
        <View style={tw`bg-blue-500 bg-opacity-10 p-4 rounded-xl border border-blue-500 border-opacity-30 mb-6`}>
          <Text style={tw`text-white text-lg font-bold`}>Ferramentas de Monitoramento</Text>
          <Text style={tw`text-gray-400 text-sm mb-4`}>Integradas</Text>
          <View style={tw`flex-row flex-wrap -mx-1`}>
            {[
              { name: 'Performance Monitor', desc: 'Monitoramento de performance' },
              { name: 'System Metrics', desc: 'Análise de performance em campo' },
              { name: 'Load Testing', desc: 'Testes de carga e stress' },
              { name: 'Network Monitor', desc: 'Condições de rede' },
              { name: 'User Analytics', desc: 'Testes em condições reais' },
              { name: 'Real-time Analytics', desc: 'Monitoramento tempo real' },
            ].map((tool, index) => (
              <View key={index} style={tw`w-1/2 px-1 mb-2`}>
                <View style={tw`bg-white bg-opacity-5 p-3 rounded-lg`}>
                  <Text style={tw`text-white font-medium text-sm`}>{tool.name}</Text>
                  <Text style={tw`text-gray-400 text-xs mt-1`}>{tool.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Botão Limpar Dados */}
        <TouchableOpacity 
          style={tw`bg-red-500 bg-opacity-20 p-4 rounded-xl border border-red-500 border-opacity-30 mb-6`}
          onPress={handleClearData}
        >
          <Text style={tw`text-red-400 text-center font-bold`}>Limpar Todos os Dados</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={tw`absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg`}
        onPress={onRefresh}
      >
        <Ionicons name="refresh" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}