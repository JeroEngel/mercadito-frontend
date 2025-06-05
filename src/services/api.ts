import { User, Transaction } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Mock data (will be removed as functions are integrated)
let currentUser: User | null = null;
const transactions: Transaction[] = []; 

// URL del backend - Configuración adaptada según el entorno
const getApiHost = () => {
  if (Platform.OS === 'web') {
    return 'localhost';
  } else if (Platform.OS === 'ios') {
    return 'localhost'; // En iOS, localhost funciona directamente en el simulador
  } else if (Platform.OS === 'android') {
    return '10.0.2.2'; // En emulador Android, se usa 10.0.2.2 para acceder a localhost de la máquina host
  }
  return 'localhost'; // Valor por defecto
};

const API_HOST = getApiHost();
const API_PORT = '8080';
const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;
const AUTH_TOKEN_KEY = '@user_token';

// URL del Fake Bank API
const FAKE_BANK_HOST = getApiHost();
const FAKE_BANK_PORT = '3000';
const FAKE_BANK_URL = `http://${FAKE_BANK_HOST}:${FAKE_BANK_PORT}`;

// Funciones para manejo de token
const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (e) {
    console.error('Error storing token:', e);
  }
};

const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token;
  } catch (e) {
    console.error('Error getting token:', e);
    return null;
  }
};

// Helper to add Authorization header
const getAuthHeaders = async (): Promise<{'Content-Type': string; 'Authorization'?: string}> => {
  const token = await getToken();
  const headers: {'Content-Type': string; 'Authorization'?: string} = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const loginResponse = await response.json();
      const { token, user } = loginResponse; // Assuming backend returns { token: string, user: User }

      await storeToken(token);
      currentUser = user; // Cache user data after login

      return user;

    } catch (error) {
      console.error('Login API error:', error);
      throw error; // Re-throw the error so calling code can handle it
    }
  },

  register: async (userData: { firstName: string; lastName: string; email: string; password: string }): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const registeredUser = await response.json();
      // Assuming backend returns the registered user object which matches frontend User type
      return registeredUser as User;

    } catch (error) {
      console.error('Registration API error:', error);
      throw error; // Re-throw the error so calling code can handle it
    }
  },

  // User
  getCurrentUser: async (): Promise<User> => {
    // Use cached user data if available, otherwise fetch

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        // If unauthorized, clear token and cached user
        if (response.status === 401) {
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
          currentUser = null;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch current user');
      }

      const user = await response.json();
      currentUser = user; // Cache fetched user data
      return user;

    } catch (error) {
      console.error('getCurrentUser API error:', error);
      throw error; // Re-throw the error
    }
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
          currentUser = null;
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Error al obtener transacciones');
      }

      const data = await response.json();
      
      // Transforma los datos del backend al formato de Transaction esperado por el frontend
      const transformedTransactions: Transaction[] = data.content.map((tx: any) => ({
        id: tx.id.toString(),
        amount: tx.type === 'incoming' ? parseFloat(tx.amount) : -parseFloat(tx.amount),
        description: tx.description || 'Sin descripción',
        status: tx.status,
        date: tx.date,
        type: tx.type === 'incoming' ? 'receive' : 'send',
        recipientEmail: tx.to?.email || tx.from?.email
      }));
      
      return transformedTransactions;

    } catch (error) {
      console.error('Error obteniendo transacciones:', error);
      throw error;
    }
  },

  transfer: async (amount: number, recipientEmail: string, description: string): Promise<Transaction> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/transactions/transfer`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          email: recipientEmail,
          amount: amount,
          description: description
        }),
      });

      if (!response.ok) {
        // Manejo específico para errores de autenticación
        if (response.status === 401 || response.status === 403) {
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
          currentUser = null;
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Error en la transferencia');
      }

      // Actualizar el usuario actual después de la transferencia exitosa
      try {
        const updatedUser = await api.getCurrentUser();
        currentUser = updatedUser;
      } catch (userError) {
        console.warn('No se pudo actualizar los datos del usuario después de la transferencia:', userError);
      }

      // Crear el objeto de transacción basado en la respuesta del backend
      const transaction: Transaction = {
        id: Math.random().toString(), // Debería ser reemplazado por un ID real del backend
        amount: -amount, // Negativo porque es dinero enviado
        description: description || 'Transferencia',
        status: 'completed',
        date: new Date().toISOString(),
        type: 'send',
        recipientEmail
      };

      return transaction;

    } catch (error) {
      console.error('Error en API de transferencia:', error);
      throw error;
    }
  },

  // Withdraw money to bank account
  withdrawMoney: async (cvu: string, amount: number): Promise<{ success: boolean; message: string; newBalance: number }> => {
    try {
      // Primero verificar que el usuario tenga saldo suficiente
      const currentUser = await api.getCurrentUser();
      
      if (currentUser.balance < amount) {
        throw new Error('Saldo insuficiente en tu cuenta');
      }

      // Hacer el retiro al banco externo
      const bankResponse = await fetch(`${FAKE_BANK_URL}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvu: cvu,
          amount: amount
        }),
      });

      if (!bankResponse.ok) {
        const errorData = await bankResponse.json();
        throw new Error(errorData.error || 'Error en el retiro bancario');
      }

      const bankData = await bankResponse.json();

      // Si el retiro bancario fue exitoso, debitar de la cuenta del usuario
      const headers = await getAuthHeaders();
      const walletResponse = await fetch(`${API_BASE_URL}/transactions/withdraw`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          amount: amount,
          cvu: cvu,
          description: `Retiro a cuenta bancaria ${cvu}`
        }),
      });

      if (!walletResponse.ok) {
        // Si falla el débito en nuestra wallet, intentar revertir en el banco
        // (En un sistema real, esto requeriría un mecanismo de compensación más robusto)
        console.error('Error al debitar de la wallet, se requiere reversión manual');
        const errorData = await walletResponse.json();
        throw new Error(errorData.error || errorData.message || 'Error al procesar el retiro');
      }

      return {
        success: true,
        message: `Retiro exitoso a ${bankData.data.nombre}`,
        newBalance: bankData.data.newBalance
      };

    } catch (error) {
      console.error('Error en retiro de dinero:', error);
      throw error;
    }
  },

  // Deposit money from bank account
  depositMoney: async (cvu: string, amount: number): Promise<{ success: boolean; message: string; newBalance: number }> => {
    try {
      console.log('Iniciando depósito:', { cvu, amount });
      
      // Primero llamar al Fake Bank API para debitar el dinero de la cuenta bancaria
      const fakeBankResponse = await fetch(`${FAKE_BANK_URL}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvu,
          amount
        }),
      });

      if (!fakeBankResponse.ok) {
        const errorData = await fakeBankResponse.json();
        console.error('Error en fake bank API:', errorData);
        throw new Error(errorData.error || 'Error en el servicio bancario');
      }

      const fakeBankResult = await fakeBankResponse.json();
      console.log('Fake bank response exitosa:', fakeBankResult);

      // Luego llamar a nuestra API para acreditar el dinero en la wallet
      const headers = await getAuthHeaders();
      console.log('Headers para wallet API:', headers);
      
      const response = await fetch(`${API_BASE_URL}/transactions/deposit`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          cvu,
          amount,
          description: `Carga desde cuenta bancaria ${cvu}`
        }),
      });

      console.log('Wallet API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en wallet API:', errorData);
        throw new Error(errorData.error || errorData.message || 'Error al procesar la carga en la wallet');
      }

      const walletResult = await response.json();
      console.log('Wallet API response exitosa:', walletResult);

      return {
        success: true,
        message: 'Carga realizada exitosamente',
        newBalance: fakeBankResult.data.newBalance
      };
    } catch (error) {
      console.error('Error en carga:', error);
      throw error;
    }
  }
};