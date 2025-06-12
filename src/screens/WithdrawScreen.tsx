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
  const [errorMessage, setErrorMessage] = useState('');

  const handleWithdraw = async () => {
    // Limpiar mensaje de error previo
    setErrorMessage('');
    
    // Validaciones
    if (!cvu.trim()) {
      setErrorMessage('Por favor, ingresa un CVU válido');
      return;
    }

    if (!amount.trim()) {
      setErrorMessage('Por favor, ingresa una cantidad');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Por favor, ingresa una cantidad válida mayor a 0');
      return;
    }

    // Validar formato de CVU (22 dígitos)
    const cvuRegex = /^\d{22}$/;
    if (!cvuRegex.test(cvu)) {
      setErrorMessage('El CVU debe tener exactamente 22 dígitos');
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
            onPress: () => {
              // Usar goBack para regresar al home y que se actualice el saldo
              navigation.goBack();
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Error completo en retiro de dinero:', error);
      console.error('Tipo de error:', typeof error);
      console.error('Mensaje del error:', error?.message);
      
      // Mejorar el parsing del mensaje de error del backend
      let errorMessage = '';
      
      if (error instanceof Error) {
        // Si el error contiene información del backend, extraer el mensaje específico
        if (error.message.includes('Saldo insuficiente')) {
          errorMessage = 'Saldo insuficiente para realizar el retiro';
        } else if (error.message && 
                   !error.message.includes('Unexpected token') && 
                   !error.message.includes('not valid JSON') &&
                   !error.message.includes('Bad Request')) {
          errorMessage = error.message;
        } else {
          // Para "Bad Request" y otros errores genéricos, mostrar mensaje específico
          errorMessage = 'Saldo insuficiente para realizar el retiro';
        }
      } else {
        errorMessage = 'Saldo insuficiente para realizar el retiro';
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Retirar dinero</Text>
      
      {/* Mostrar mensaje de error si existe */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
      
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
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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