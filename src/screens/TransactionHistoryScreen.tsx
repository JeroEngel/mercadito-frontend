import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, ListItem, Divider } from 'react-native-elements';
import { api } from '../services/api';
import { Transaction } from '../types';
import { useFocusEffect } from '@react-navigation/native';

const TransactionHistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setError(null);
      const txs = await api.getTransactions();
      setTransactions(txs);
    } catch (e: any) {
      console.error('Error obteniendo transacciones:', e);
      setError(e.message || 'Error al cargar las transacciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Cargar transacciones cuando la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTransactions();
    }, [fetchTransactions])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
  }, [fetchTransactions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isPositive = item.amount >= 0;
    const amountColor = isPositive ? '#28a745' : '#dc3545';

    return (
      <ListItem 
        bottomDivider 
        testID={`transaction-item-${item.id}`}
        accessibilityLabel={`Transaction item ${item.id}`}
      >
        <ListItem.Content>
          <View style={styles.transactionHeader}>
            <ListItem.Title style={{ fontWeight: 'bold' }}>
              {item.type === 'receive' ? 'Recibido' : 'Enviado'}
            </ListItem.Title>
            <Text style={{ color: amountColor, fontWeight: 'bold' }}>
              {isPositive ? '+' : ''}{item.amount.toFixed(2)} $
            </Text>
          </View>
          
          <Divider style={{ marginVertical: 5 }} />
          
          <ListItem.Subtitle>
            {item.description || 'Sin descripción'}
          </ListItem.Subtitle>
          
          <View style={styles.transactionFooter}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            <Text style={styles.statusText}>
              {item.status === 'completed' ? '✓ Completado' : item.status}
            </Text>
          </View>
          
          {item.recipientEmail && (
            <Text style={styles.emailText}>
              {item.type === 'receive' ? 'De: ' : 'Para: '}{item.recipientEmail}
            </Text>
          )}
        </ListItem.Content>
      </ListItem>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando transacciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Historial de transacciones</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderTransactionItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay transacciones disponibles</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0066cc"]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    width: '100%',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default TransactionHistoryScreen;