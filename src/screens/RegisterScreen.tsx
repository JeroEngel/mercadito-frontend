import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { api } from '../services/api';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    // Limpiar mensaje de error previo
    setErrorMessage('');
    
    if (!firstName || !lastName || !email || !password) {
      setErrorMessage('Por favor, completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await api.register({ firstName, lastName, email, password });
      // Navegar directamente al Login sin Alert
      navigation.navigate('Login');
    } catch (error) {
      // Mostrar el mensaje específico del backend en la página
      const backendErrorMessage = error instanceof Error ? error.message : 'Error desconocido en el registro';
      setErrorMessage(backendErrorMessage);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Create Account</Text>
      
      {/* Mostrar mensaje de error si existe */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
      
      <Input
        placeholder="Nombre"
        value={firstName}
        onChangeText={setFirstName}
        testID="first-name-input"
        accessibilityLabel="First name input"
      />
      <Input
        placeholder="Apellido"
        value={lastName}
        onChangeText={setLastName}
        testID="last-name-input"
        accessibilityLabel="Last name input"
      />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="email-input"
        accessibilityLabel="Email input"
      />
      <Input
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
        accessibilityLabel="Password input"
      />
      <Button
        title="Registrarse"
        onPress={handleRegister}
        loading={loading}
        containerStyle={styles.buttonContainer}
        testID="register-button"
        accessibilityLabel="Register button"
      />
      <Button
        title="Volver a Iniciar Sesión"
        type="clear"
        onPress={() => navigation.goBack()}
        testID="back-to-login-button"
        accessibilityLabel="Back to login button"
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
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
});

export default RegisterScreen;