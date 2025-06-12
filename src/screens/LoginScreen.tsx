import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { api } from '../services/api';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    // Limpiar mensaje de error previo
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Por favor, completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await api.login(email, password);
      navigation.replace('Main');
    } catch (error) {
      // Mostrar el mensaje específico del backend en la página
      const backendErrorMessage = error instanceof Error ? error.message : 'Error desconocido en el inicio de sesión';
      setErrorMessage(backendErrorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Mercadito Wallet</Text>
      
      {/* Mostrar mensaje de error si existe */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
      
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
        title="Iniciar Sesión"
        onPress={handleLogin}
        loading={loading}
        containerStyle={styles.buttonContainer}
        testID="login-button"
        accessibilityLabel="Login button"
      />
      <Button
        title="Crear Cuenta"
        type="clear"
        onPress={() => navigation.navigate('Register')}
        testID="register-button"
        accessibilityLabel="Create account button"
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

export default LoginScreen;