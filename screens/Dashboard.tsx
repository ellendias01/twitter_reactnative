// screens/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import tw from 'twrnc';
import AnalyticsService from '../services/AnalyticsService';
import ABTestingService from '../services/ABTestingService';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

type DashboardScreenProps = {
  navigation: StackNavigationProp<any>;
};

type AnalyticsEvent = {
  type: string;
  timestamp: number;
  screenName?: string;
  buttonName?: string;
  renderTime?: number;
  variant?: string;
};

type RenderTimeData = {
  [key: string]: number[];
};

const { width: screenWidth } = Dimensions.get('window');

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#ffa726' },
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [currentVariant, setCurrentVariant] = useState<'A' | 'B'>('A');
  const [metrics, setMetrics] = useState<any>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'screens' | 'buttons' | 'performance' | 'abtest'>('overview');

  useEffect(() => {
    const loadInitialData = () => {
      const variant = ABTestingService.getUserVariant();
      setCurrentVariant(variant);
      AnalyticsService.logScreenView('Dashboard', variant);
      loadMetrics();
    };
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
        ? renderTimes.reduce((acc, curr) => acc + (curr.renderTime || 0), 0) / renderTimes.length
        : 0;

      const buttonCounts = buttonClicks.reduce((acc: Record<string, number>, event) => {
        const buttonName = event.buttonName || 'Unknown';
        acc[buttonName] = (acc[buttonName] || 0) + 1;
        return acc;
      }, {});

      const screenViewCounts = screenViews.reduce((acc: Record<string, number>, event) => {
        const screenName = event.screenName || 'Unknown';
        acc[screenName] = (acc[screenName] || 0) + 1;
        return acc;
      }, {});

      const renderTimeData = screenViews.reduce((acc: RenderTimeData, event: AnalyticsEvent) => {
        const screenName = event.screenName || 'Unknown';
        if (!acc[screenName]) acc[screenName] = [];

        const screenRenderTimes = renderTimes.filter(rt => rt.screenName === screenName);
        if (screenRenderTimes.length > 0) {
          const latestRenderTime = screenRenderTimes[screenRenderTimes.length - 1].renderTime;
          if (latestRenderTime) acc[screenName].push(latestRenderTime);
        }
        return acc;
      }, {});

      const variantDistribution = {
        A: events.filter(e => e.variant === 'A').length,
        B: events.filter(e => e.variant === 'B').length,
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

  const prepareChartData = () => {
    if (!metrics) return { screenViewData: null, buttonClickData: null, renderTimeData: null, variantData: null };

    const screenViewLabels = Object.keys(metrics.screenViews).map(name =>
      name.length > 8 ? name.substring(0, 8) + '...' : name
    );
    const screenViewValues = Object.values(metrics.screenViews) as number[];

    const screenViewData = { labels: screenViewLabels, datasets: [{ data: screenViewValues }] };

    const buttonLabels = Object.keys(metrics.buttonClicks).map(name =>
      name.length > 8 ? name.substring(0, 8) + '...' : name
    );
    const buttonValues = Object.values(metrics.buttonClicks) as number[];

    const buttonClickData = { labels: buttonLabels, datasets: [{ data: buttonValues }] };

    const renderLabels = Object.keys(metrics.renderTimes).map(name =>
      name.length > 8 ? name.substring(0, 8) + '...' : name
    );
    const renderValues = Object.entries(metrics.renderTimes).map(([name, times]) =>
      times.length > 0 ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 0
    );

    const renderTimeData = {
      labels: renderLabels,
      datasets: [{
        data: renderValues,
        color: (opacity = 1, index?: number) =>
          renderValues[index!] > 16 ? `rgba(255,0,0,${opacity})` : `rgba(255,193,7,${opacity})`,
        strokeWidth: 2
      }]
    };

    const variantData = [
      { name: 'Variante A', population: metrics.variantDistribution.A, color: '#8884d8', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: 'Variante B', population: metrics.variantDistribution.B, color: '#82ca9d', legendFontColor: '#7F7F7F', legendFontSize: 15 },
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
      <View style={[tw`items-center justify-center`, { height }]}>{children}</View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`bg-white p-4 shadow-sm`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <View style={tw`flex-row items-center gap-4`}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={tw`text-blue-500 font-bold text-lg`}>← Voltar</Text>
            </TouchableOpacity>
            <View>
              <Text style={tw`text-2xl font-bold`}>Dashboard Analytics</Text>
              <Text style={tw`text-gray-600`}>Métricas em tempo real - {updateCount} atualizações</Text>
            </View>
          </View>
          <View style={tw`bg-blue-100 px-3 py-1 rounded-full`}>
            <Text style={tw`font-bold text-blue-800`}>Variante {currentVariant}</Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={tw`flex-row`}>
            {['overview', 'screens', 'buttons', 'performance', 'abtest'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={tw`px-4 py-2 mx-1 rounded-full ${activeTab === tab ? 'bg-blue-500' : 'bg-gray-200'}`}
                onPress={() => setActiveTab(tab as any)}
              >
                <Text style={tw`font-medium ${activeTab === tab ? 'text-white' : 'text-gray-700'}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Conteúdo das Tabs */}
      <ScrollView style={tw`flex-1 p-4`}>
        {/* Overview */}
        {activeTab === 'overview' && (
          <View style={tw`space-y-4`}>
            <ChartContainer title="Visualizações por Tela" height={300}>
              {screenViewData && screenViewData.datasets[0].data.length > 0 ? (
                <BarChart data={screenViewData} width={screenWidth - 64} height={220} chartConfig={chartConfig} verticalLabelRotation={30} fromZero showValuesOnTopOfBars />
              ) : <Text style={tw`text-center text-gray-500 py-8`}>Nenhuma visualização de tela registrada</Text>}
            </ChartContainer>

            <ChartContainer title="Distribuição A/B Test" height={300}>
              {variantData && variantData.some(d => d.population > 0) ? (
                <PieChart data={variantData} width={screenWidth - 64} height={220} chartConfig={chartConfig} accessor="population" backgroundColor="transparent" paddingLeft="15" absolute />
              ) : <Text style={tw`text-center text-gray-500 py-8`}>Nenhum dado de variante registrado</Text>}
            </ChartContainer>
          </View>
        )}

        {/* Outras Tabs renderizam gráficos similares */}
        {/* Aqui você pode manter o código que já tem para screens, buttons, performance e abtest */}
        <TouchableOpacity style={tw`bg-red-500 p-4 rounded-lg mt-4`} onPress={handleClearData}>
          <Text style={tw`text-white text-center font-bold`}>Limpar Todos os Dados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
