import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { api } from '../services/api';

type DepositScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DepositScreen: React.FC = () => {
  const navigation = useNavigation<DepositScreenNavigationProp>();
  
  const [cvu, setCvu] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    // Evitar múltiples llamadas si ya está cargando
    if (loading) {
      return;
    }

    // Validaciones
    if (!cvu.trim()) {
      Alert.alert('Error', 'Por favor, ingresa un CVU válido');
      return;
    }

    if (!amount.trim()) {
      Alert.alert('Error', 'Por favor, ingresa una cantidad');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Por favor, ingresa una cantidad válida mayor a 0');
      return;
    }

    // Validar formato de CVU (22 dígitos)
    const cvuRegex = /^\d{22}$/;
    if (!cvuRegex.test(cvu)) {
      Alert.alert('Error', 'El CVU debe tener exactamente 22 dígitos');
      return;
    }

    setLoading(true);

    try {
      // Llamar a la API real para cargar dinero
      const result = await api.depositMoney(cvu, numericAmount);
      
      Alert.alert(
        'Carga exitosa',
        `${result.message}\nNuevo saldo en cuenta bancaria: $${result.newBalance.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Error en carga de dinero:', error);
      Alert.alert('Error', error.message || 'No se pudo completar la carga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Cargar dinero</Text>
      
      <Input
        placeholder="CVU (22 dígitos)"
        value={cvu}
        onChangeText={setCvu}
        keyboardType="numeric"
        maxLength={22}
        testID="cvu-input"
        accessibilityLabel="CVU"
        containerStyle={styles.inputContainer}
      />
      
      <Input
        placeholder="Cantidad a cargar"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        testID="amount-input"
        accessibilityLabel="Cantidad"
        containerStyle={styles.inputContainer}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <Button
          title="Cargar"
          onPress={handleDeposit}
          disabled={loading}
          containerStyle={styles.button}
          buttonStyle={styles.buttonStyle}
          testID="deposit-button"
          accessibilityLabel="Botón de cargar dinero"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
  buttonStyle: {
    backgroundColor: '#007AFF',
  },
  loader: {
    marginVertical: 20,
  },
});

export default DepositScreen;