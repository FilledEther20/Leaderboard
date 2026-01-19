import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import client from '../api/client';
import UserRow from '../components/UserRow';

const LeaderboardScreen = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchLeaderboard = async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await client.get(`/leaderboard?page=${pageNum}&limit=20`);
      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        setData(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(1); }, []);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLeaderboard(nextPage);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.listHeader}>
         <Text style={styles.headerText}>#</Text>
         <Text style={[styles.headerText, { flex: 1, paddingLeft: 10 }]}>User</Text>
         <Text style={styles.headerText}>Rating</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.username + index}
        renderItem={({ item }) => <UserRow item={item} highlight={false} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listHeader: { flexDirection: 'row', padding: 10, borderBottomWidth: 2, borderColor: '#eee', justifyContent: 'space-between' },
  headerText: { fontWeight: 'bold', color: '#888', fontSize: 12, textTransform: 'uppercase' },
});

export default LeaderboardScreen;
