import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, ListItem } from 'react-native-elements';
import { api } from '../services/api';
import { Transaction } from '../types';

const TransactionHistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const txs = await api.getTransactions();
      setTransactions(txs);
    };
    fetchTransactions();
  }, []);

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Historial de transacciones</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ListItem bottomDivider testID={`transaction-item-${item.id}`} accessibilityLabel={`Transaction item ${item.id}`}>
            <ListItem.Content>
              <ListItem.Title>{item.amount > 0 ? '+' : ''}${item.amount.toFixed(2)}</ListItem.Title>
              <ListItem.Subtitle>{item.description}</ListItem.Subtitle>
              <Text>{item.status} - {new Date(item.date).toLocaleString()}</Text>
            </ListItem.Content>
          </ListItem>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay transacciones</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
});

export default TransactionHistoryScreen; 