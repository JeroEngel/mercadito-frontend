import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const user = await api.getCurrentUser();
      setBalance(user.balance);
    } catch (e) {
      console.error('Error fetching balance:', e);
      // No mostramos alerta aquí para evitar spam de alertas
    } finally {
      setLoading(false);
    }
  }, []);

  // Esta función se ejecutará cada vez que la pantalla reciba el foco
  useFocusEffect(
    useCallback(() => {
      fetchBalance();
      return () => {
        // Función de limpieza si es necesaria
      };
    }, [fetchBalance])
  );

  // Esta función se ejecutará cuando el componente se monte por primera vez
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <View style={styles.container}>
      <Text h4 style={styles.balanceLabel}>Saldo disponible</Text>
      {loading ? (
        <Text>Cargando saldo...</Text>
      ) : (
        <Text h2 style={styles.balance} testID="balance-text" accessibilityLabel="Balance">
          ${typeof balance === 'number' ? balance.toFixed(2) : '0.00'}
        </Text>
      )}
      <Button
        title="Enviar dinero"
        onPress={() => navigation.navigate('Transfer' as never)}
        containerStyle={styles.button}
        testID="send-money-button"
        accessibilityLabel="Send money button"
      />
      <Button
        title="Retirar dinero"
        type="outline"
        onPress={() => navigation.navigate('Withdraw' as never)}
        containerStyle={styles.button}
        testID="withdraw-money-button"
        accessibilityLabel="Withdraw money button"
      />
      <Button
        title="Cargar dinero"
        type="outline"
        onPress={() => navigation.navigate('Deposit' as never)}
        containerStyle={styles.button}
        testID="load-money-button"
        accessibilityLabel="Load money button"
      />
      <Button
        title="Ver historial de transacciones"
        type="clear"
        onPress={() => navigation.navigate('TransactionHistory' as never)}
        containerStyle={styles.button}
        testID="history-button"
        accessibilityLabel="Transaction history button"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  balanceLabel: {
    marginBottom: 10,
  },
  balance: {
    marginBottom: 30,
  },
  button: {
    width: '100%',
    marginVertical: 5,
  },
});

export default HomeScreen;