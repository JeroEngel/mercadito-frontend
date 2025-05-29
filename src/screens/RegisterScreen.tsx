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

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await api.register({ firstName, lastName, email, password });
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Error', 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Create Account</Text>
      <Input
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        testID="first-name-input"
        accessibilityLabel="First name input"
      />
      <Input
        placeholder="Last Name"
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
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
        accessibilityLabel="Password input"
      />
      <Button
        title="Register"
        onPress={handleRegister}
        loading={loading}
        containerStyle={styles.buttonContainer}
        testID="register-button"
        accessibilityLabel="Register button"
      />
      <Button
        title="Back to Login"
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
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
});

export default RegisterScreen; 