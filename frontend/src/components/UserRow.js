import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserRow = ({ item, highlight }) => (
  <View style={[styles.row, highlight && styles.highlightRow]}>
    <Text style={[styles.colRank, styles.rankText]}>{item.global_rank}</Text>
    <View style={styles.colName}>
       <Text style={styles.usernameText}>{item.username}</Text>
    </View>
    <Text style={[styles.colScore, styles.scoreText]}>{item.rating}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', alignItems: 'center' },
  highlightRow: { backgroundColor: '#e6f2ff' }, 
  colRank: { width: 60, textAlign: 'center' },
  colName: { flex: 1, paddingLeft: 10 },
  colScore: { width: 80, textAlign: 'center', fontWeight: 'bold' },
  rankText: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  usernameText: { fontSize: 16, color: '#000' },
  scoreText: { fontSize: 16, color: '#007AFF' },
});

export default UserRow ;