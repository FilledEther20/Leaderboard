import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TabButton = ({ title, active, onPress }) => (
  <TouchableOpacity 
    style={[styles.tab, active && styles.activeTab]} 
    onPress={onPress}
  >
    <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tab: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { fontWeight: '600', color: '#666' },
  activeTabText: { color: '#fff' },
});

export default TabButton;