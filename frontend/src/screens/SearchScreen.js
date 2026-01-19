import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import axios from 'axios';
import UserRow from '../components/UserRow';
import client from "../api/client";

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const search = async () => {
      setLoading(true);
      try {
        const res = await client.get(`/search?q=${query}`, {
          signal: controller.signal
        });
        setResults(res.data);
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Request canceled:', query);
        } else {
          console.error(err);
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      if (query.length > 2) {
        search();
      } else {
        setResults([]);
        setLoading(false);
      }
    }, 300); 

    return () => {
      clearTimeout(timer);
      controller.abort(); 
    };
  }, [query]);

  const renderItem = useCallback(({ item }) => (
    <UserRow item={item} highlight={true} />
  ), []);

  return (
    <View style={styles.screenContainer}>
      <TextInput
        style={styles.input}
        placeholder="Search username"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />
      
      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
      
      {!loading && results.length > 0 && (
         <View style={styles.listHeader}>
          <Text style={[styles.colRank, styles.headerText]}>Global Rank</Text>
          <Text style={[styles.colName, styles.headerText]}>User</Text>
          <Text style={[styles.colScore, styles.headerText]}>Rating</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item._id || item.username} 
        renderItem={renderItem}
        removeClippedSubviews={true} 
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, padding: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  listHeader: { flexDirection: 'row', padding: 10, borderBottomWidth: 2, borderColor: '#eee', justifyContent: 'space-between' },
  headerText: { fontWeight: 'bold', color: '#888', fontSize: 12, textTransform: 'uppercase' },
  colRank: { width: 80 },
  colName: { flex: 1 },
  colScore: { width: 60, textAlign: 'right' },
});

export default SearchScreen;