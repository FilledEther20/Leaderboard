import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import SearchScreen from './src/screens/SearchScreen';
import TabButton from './src/components/TabButton';

export default function App() {
  const [activeTab, setActiveTab] = useState('leaderboard');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>
      <View style={styles.tabs}>
        <TabButton title="Top Rated" active={activeTab === 'leaderboard'} onPress={() => setActiveTab('leaderboard')} />
        <TabButton title="Search User" active={activeTab === 'search'} onPress={() => setActiveTab('search')} />
      </View>
      <View style={styles.content}>
        {activeTab === 'leaderboard' ? <LeaderboardScreen /> : <SearchScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  tabs: { flexDirection: 'row', padding: 10 },
  content: { flex: 1, padding: 10 },
});