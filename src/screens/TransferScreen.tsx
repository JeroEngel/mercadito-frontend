import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { api } from '../services/api';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type TransferScreenRouteProp = RouteProp<RootStackParamList, 'Transfer'>;
type TransferScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TransferScreen: React.FC = () => {
  const navigation = useNavigation<TransferScreenNavigationProp>();
  const route = useRoute<TransferScreenRouteProp>();
  
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Utilizar el email recibido como parámetro si existe
  useEffect(() => {
    try {
      if (route.params?.email) {
        setEmail(route.params.email);
      }
    } catch (error) {
      console.error('Error al obtener parámetros de ruta:', error);
    }
  }, [route.params]);

  const handleTransfer = async () => {
    // Limpiar mensaje de error previo
    setErrorMessage('');
    
    if (!email || !amount) {
      setErrorMessage('Completa email y monto');
      return;
    }

    // Validar que el monto sea un número válido
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('El monto debe ser un número mayor que cero');
      return;
    }

    setLoading(true);
    try {
      await api.transfer(numAmount, email, description);
      
      // Navegar directamente a Main sin Alert
      navigation.navigate('Main');
      
    } catch (error: any) {
      console.error('Error completo en transferencia:', error);
      
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
      <Text h4 style={styles.title}>Enviar dinero</Text>
      
      {/* Mostrar mensaje de error si existe */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
      
      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
      ) : (
        <>
          <Input
            placeholder="Email destino"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            testID="destination-email-input"
            accessibilityLabel="Email destino"
            disabled={!!route.params?.email} // Deshabilitar si viene precompletado
          />
          
          <Input
            placeholder="Monto"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            testID="amount-input"
            accessibilityLabel="Monto"
          />
          
          <Input
            placeholder="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            testID="description-input"
            accessibilityLabel="Descripción"
          />
          
          <Button
            title="Enviar"
            onPress={handleTransfer}
            disabled={loading}
            containerStyle={styles.button}
            testID="send-button"
            accessibilityLabel="Botón de enviar dinero"
          />
        </>
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
  button: {
    marginTop: 20,
    width: '100%',
  },
  loader: {
    marginVertical: 20,
  }
});

export default TransferScreen;