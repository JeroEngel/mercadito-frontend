import { User, Transaction, Contact } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Mock data (will be removed as functions are integrated)
let currentUser: User | null = null;
const transactions: Transaction[] = []; 
const contacts: Contact[] = []; 

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

  // Contacts
  getContacts: async (): Promise<Contact[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/contacts/favorites`, {
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
        throw new Error(errorData.error || errorData.message || 'Error al obtener contactos');
      }

      const data = await response.json();
      
      // Transforma los datos del backend al formato de Contact esperado por el frontend
      const transformedContacts: Contact[] = data.content.map((contact: any) => ({
        id: contact.user.id.toString(),
        firstName: contact.user.firstName,
        lastName: contact.user.lastName,
        email: contact.user.email,
        isFavorite: contact.isFavorite
      }));
      
      return transformedContacts;
    } catch (error) {
      console.error('Error obteniendo contactos:', error);
      throw error;
    }
  },

  searchUsers: async (query: string): Promise<Contact[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error('Error al buscar usuarios');
      }

      const data = await response.json();
      
      // Transforma los datos del backend al formato de Contact
      return data.map((user: any) => ({
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isFavorite: false
      }));
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      throw error;
    }
  },

  addContact: async (userId: string): Promise<Contact> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/contacts/favorites`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ userId: Number(userId) })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Error al agregar contacto');
      }

      const contactData = await response.json();
      
      return {
        id: contactData.user.id.toString(),
        firstName: contactData.user.firstName,
        lastName: contactData.user.lastName,
        email: contactData.user.email,
        isFavorite: contactData.isFavorite
      };
    } catch (error) {
      console.error('Error al agregar contacto:', error);
      throw error;
    }
  },

  removeContact: async (contactId: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/contacts/favorites/${contactId}`, {
        method: 'DELETE',
        headers: headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Error al eliminar contacto');
      }
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      throw error;
    }
  }
};