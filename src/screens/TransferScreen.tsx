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
    if (!email || !amount) {
      Alert.alert('Error', 'Completa email y monto');
      return;
    }

    // Validar que el monto sea un número válido
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'El monto debe ser un número mayor que cero');
      return;
    }

    setLoading(true);
    try {
      await api.transfer(numAmount, email, description);
      
      // Mostrar mensaje de éxito
      Alert.alert('Éxito', 'Transferencia realizada exitosamente', [
        { 
          text: 'OK', 
          onPress: () => {
            // Volver a la pantalla principal
            navigation.navigate('Main');
          } 
        }
      ]);
      
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo transferir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Enviar dinero</Text>
      
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
  button: {
    marginTop: 20,
    width: '100%',
  },
  loader: {
    marginVertical: 20,
  }
});

export default TransferScreen;