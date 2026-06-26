import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions, Alert, Platform, Button } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const { width } = Dimensions.get('window');

const SERVER_URL = 'http://185.132.47.110:5000';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Permission not granted for notifications!');
    return;
  }
}

export default function HomeScreen() {
  const [latestData, setLatestData] = useState({
    temperature: '--',
    humidity: '--',
    gas: '--',
    steam: '--',
    date: '',
    hour: ''
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const [isOffline, setIsOffline] = useState(false);
  const lastNotificationTime = useRef(0);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const sendNotification = async (title, body) => {
    Alert.alert(title, body);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
      },
      trigger: null,
    });
  };

  const checkAlerts = (latest) => {
    const now = Date.now();
    if (now - lastNotificationTime.current > 120000) {
      let alertTriggered = false;

      if (latest.temperature > 30) {
        sendNotification("⚠ Température élevée", `Température élevée détectée: ${latest.temperature}°C`);
        alertTriggered = true;
      } else if (latest.temperature < 17) {
        sendNotification("⚠ Température basse", `La température est descendue à ${latest.temperature}°C`);
        alertTriggered = true;
      } else if (latest.gas > 10) {
        sendNotification("🔥 Gaz dangereux", `Alerte gaz ! Niveau: ${latest.gas}%`);
        alertTriggered = true;
      } else if (latest.steam > 10) {
        sendNotification("☁ Vapeur élevée", `Niveau de vapeur: ${latest.steam}%`);
        alertTriggered = true;
      } else if (latest.humidity > 80) {
        sendNotification("💧 Humidité élevée", `L'humidité atteint ${latest.humidity}%`);
        alertTriggered = true;
      } else if (latest.humidity < 40) {
        sendNotification("💧 Humidité basse", `L'humidité est tombée à ${latest.humidity}%`);
        alertTriggered = true;
      }

      if (alertTriggered) {
        lastNotificationTime.current = now;
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/get_data`);
      const responseData = await response.json();
      const datas = responseData.data;

      if (!datas || datas.length === 0) return;

      const limitedDatas = datas.slice(-20);
      const latest = limitedDatas[limitedDatas.length - 1];

      setLatestData(latest);
      setHistoricalData(limitedDatas);

      const lastDateStr = `${latest.date}T${latest.hour}`;
      const lastDate = new Date(lastDateStr).getTime();
      const nowDate = Date.now();

      if (!isNaN(lastDate)) {
        const diffMinutes = (nowDate - lastDate) / 1000 / 60;
        setIsOffline(diffMinutes > 5);
      } else {
        setIsOffline(false);
      }

      checkAlerts(latest);

    } catch (error) {
      console.warn("Erreur fetchData:", error);
      setIsOffline(true);
    }
  };

  const fetchWeeklyAverages = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/get_weekly_averages`);
      const responseData = await response.json();
      const datas = responseData.data;

      if (!datas || datas.length === 0) return;
      setWeeklyData(datas);
    } catch (error) {
      console.warn("Erreur fetchWeeklyAverages:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchWeeklyAverages();

    const dataInterval = setInterval(fetchData, 5000);
    const weeklyInterval = setInterval(fetchWeeklyAverages, 60000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(weeklyInterval);
    };
  }, []);

  const renderChart = (title, dataKey, dataArray, color) => {
    if (dataArray.length === 0) {
      return (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{title}</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>En attente des données...</Text>
          </View>
        </View>
      );
    }

    const labels = dataArray.map(d => dataKey.includes('weekly') ? (d.date ? d.date.substring(5) : '') : (d.hour ? d.hour.substring(0, 5) : ''));
    const step = Math.max(1, Math.floor(labels.length / 5));
    const filteredLabels = labels.map((l, i) => i % step === 0 ? l : '');

    const actualDataKey = dataKey.replace('weekly_', '');
    const values = dataArray.map(d => parseFloat(d[actualDataKey]) || 0);

    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        <LineChart
          data={{
            labels: filteredLabels,
            datasets: [{ data: values }]
          }}
          width={width - 80}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#1f2937',
            backgroundGradientFrom: '#1f2937',
            backgroundGradientTo: '#1f2937',
            decimalPlaces: 1,
            color: (opacity = 1) => color,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: color },
            propsForBackgroundLines: {
              stroke: "rgba(255, 255, 255, 0.05)",
              strokeWidth: 1
            }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dashboard IoT (TEST)</Text>

        <View style={{ marginBottom: 20 }}>
          <Button title="Tester la notification (Manuel)" onPress={() => sendNotification("Test Android", "La notification fonctionne bien sur l'émulateur !")} color="#3b82f6" />
        </View>

        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌡 Température</Text>
            <Text style={styles.cardValue}>{latestData.temperature} °C</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💧 Humidité</Text>
            <Text style={styles.cardValue}>{latestData.humidity} %</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔥 Gaz</Text>
            <Text style={styles.cardValue}>{latestData.gas}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>☁ Vapeur</Text>
            <Text style={styles.cardValue}>{latestData.steam}</Text>
          </View>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Dernière réception</Text>
          <Text style={styles.statusDate}>
            {latestData.date && latestData.hour ? `${latestData.date} ${latestData.hour}` : 'Aucune donnée'}
          </Text>
          <Text style={[styles.statusIndicator, { color: isOffline ? 'orange' : 'lightgreen' }]}>
            {isOffline ? '⚠ Capteur hors ligne' : '🟢 Données en direct'}
          </Text>
        </View>

        <View style={styles.chartsContainer}>
          {renderChart('Température', 'temperature', historicalData, 'rgba(255, 99, 132, 1)')}
          {renderChart('Humidité', 'humidity', historicalData, 'rgba(54, 162, 235, 1)')}
          {renderChart('Gaz', 'gas', historicalData, 'rgba(255, 206, 86, 1)')}
          {renderChart('Vapeur', 'steam', historicalData, 'rgba(75, 192, 192, 1)')}

          {renderChart('Moyenne Température / Jour', 'weekly_temperature', weeklyData, 'rgba(255, 99, 132, 1)')}
          {renderChart('Moyenne Humidité / Jour', 'weekly_humidity', weeklyData, 'rgba(54, 162, 235, 1)')}
          {renderChart('Moyenne Gaz / Jour', 'weekly_gas', weeklyData, 'rgba(255, 206, 86, 1)')}
          {renderChart('Moyenne Vapeur / Jour', 'weekly_steam', weeklyData, 'rgba(75, 192, 192, 1)')}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1f2937',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBox: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  statusTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusDate: {
    color: '#d1d5db',
    fontSize: 14,
    marginTop: 8,
  },
  statusIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  chartsContainer: {
    gap: 20,
  },
  chartCard: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 15,
    minHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  chartTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  chartPlaceholder: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 180,
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
