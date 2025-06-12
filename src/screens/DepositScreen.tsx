import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
  const [errorMessage, setErrorMessage] = useState('');

  const handleDeposit = async () => {
    // Limpiar mensaje de error previo
    setErrorMessage('');
    
    // Evitar múltiples llamadas si ya está cargando
    if (loading) {
      return;
    }

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

    setLoading(true);

    try {
      // Llamar a la API real para cargar dinero
      const result = await api.depositMoney(cvu, numericAmount);
      
      // Usar goBack() para volver a la pantalla anterior (Home)
      navigation.goBack();
      
    } catch (error: any) {
      console.error('Error completo en carga de dinero:', error);
      console.error('Tipo de error:', typeof error);
      console.error('Mensaje del error:', error?.message);
      
      // Solo mostrar el mensaje si es realmente un error de negocio del backend
      if (error instanceof Error && error.message && 
          !error.message.includes('Unexpected token') && 
          !error.message.includes('not valid JSON')) {
        setErrorMessage(error.message);
      } else {
        // Para errores de parsing u otros errores técnicos, no mostrar nada
        console.log('Error técnico ignorado, no se muestra al usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Cargar dinero</Text>
      
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