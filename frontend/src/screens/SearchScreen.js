import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet,TextInput} from 'react-native';
import axios from 'axios';
import UserRow from '../components/UserRow';
import client from "../api/client"

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        handleSearch(query);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (text) => {
    setLoading(true);
    try {
      const res = await client.get(`/search?q=${text}`);
      console.log("Resultant data",res.data)
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      <Text>{console.log(results)}</Text>
      <FlatList
        data={results}
        keyExtractor={(item, index) => item.username + index}
        renderItem={({ item }) => <UserRow item={item} highlight={true} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listHeader: { flexDirection: 'row', padding: 10, borderBottomWidth: 2, borderColor: '#eee', justifyContent: 'space-between' },
  headerText: { fontWeight: 'bold', color: '#888', fontSize: 12, textTransform: 'uppercase' },
});

export default SearchScreen;