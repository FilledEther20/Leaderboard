import { StyleSheet } from 'react-native';

export const theme = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  row: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', alignItems: 'center' },
  // Add other shared styles here
});