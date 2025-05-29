import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { api } from '../services/api';

const TransferScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!email || !amount) {
      Alert.alert('Error', 'Completa email y monto');
      return;
    }
    setLoading(true);
    try {
      await api.transfer(Number(amount), email, description);
      Alert.alert('Éxito', 'Transferencia realizada');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo transferir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Enviar dinero</Text>
      <Input
        placeholder="Email destino"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="destination-email-input"
        accessibilityLabel="Destination email input"
      />
      <Input
        placeholder="Monto"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        testID="amount-input"
        accessibilityLabel="Amount input"
      />
      <Input
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        testID="description-input"
        accessibilityLabel="Description input"
      />
      <Button
        title="Enviar"
        onPress={handleTransfer}
        loading={loading}
        containerStyle={styles.button}
        testID="send-button"
        accessibilityLabel="Send money button"
      />
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
});

export default TransferScreen; 