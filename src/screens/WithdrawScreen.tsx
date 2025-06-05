import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { api } from '../services/api';

type WithdrawScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation<WithdrawScreenNavigationProp>();
  
  const [cvu, setCvu] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
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

    try {
      setLoading(true);
      
      // Llamar a la API real para retirar dinero
      const result = await api.withdrawMoney(cvu, numericAmount);
      
      Alert.alert(
        'Retiro exitoso',
        `${result.message}\nNuevo saldo en cuenta bancaria: $${result.newBalance.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo completar el retiro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Retirar dinero</Text>
      
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
        placeholder="Cantidad a retirar"
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
          title="Retirar"
          onPress={handleWithdraw}
          disabled={loading}
          containerStyle={styles.button}
          testID="withdraw-button"
          accessibilityLabel="Botón de retirar dinero"
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
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
  loader: {
    marginVertical: 20,
  }
});

export default WithdrawScreen;