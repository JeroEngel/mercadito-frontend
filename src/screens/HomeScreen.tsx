import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { api } from '../services/api';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true);
      try {
        const user = await api.getCurrentUser();
        setBalance(user.balance);
      } catch (e) {
        Alert.alert('Error', 'Could not fetch balance');
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

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
        title="Recibir dinero"
        type="outline"
        onPress={() => Alert.alert('Recibir dinero', 'Funcionalidad simulada')}
        containerStyle={styles.button}
        testID="receive-money-button"
        accessibilityLabel="Receive money button"
      />
      <Button
        title="Solicitar DEBIN"
        type="outline"
        onPress={() => Alert.alert('Solicitar DEBIN', 'Funcionalidad simulada')}
        containerStyle={styles.button}
        testID="debin-button"
        accessibilityLabel="Request DEBIN button"
      />
      <Button
        title="Cargar saldo"
        type="outline"
        onPress={() => Alert.alert('Cargar saldo', 'Funcionalidad simulada')}
        containerStyle={styles.button}
        testID="load-balance-button"
        accessibilityLabel="Load balance button"
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