import { User, Transaction, Contact } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock data (will be removed as functions are integrated)
let currentUser: User | null = null; // This will now be populated from backend on successful login/getCurrentUser
const transactions: Transaction[] = []; // TODO: Integrate with backend
const contacts: Contact[] = []; // TODO: Integrate with backend

const API_BASE_URL = 'http://localhost:8080/api'; // <<-- ** IMPORTANTE: Actualiza esta URL si tu backend no corre en localhost:8080 **
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
    if (currentUser) {
      return currentUser;
    }
    
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

  // Add other API calls here, using getAuthHeaders() for authenticated requests

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    // TODO: Implement actual get transactions API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return transactions;
  },

  transfer: async (amount: number, recipientEmail: string, description: string): Promise<Transaction> => {
    // TODO: Implement actual transfer API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!currentUser) throw new Error('Not authenticated');
    if (currentUser.balance < amount) throw new Error('Insufficient funds');

    const transaction: Transaction = {
      id: Math.random().toString(),
      amount,
      description,
      status: 'completed',
      date: new Date().toISOString(),
      type: 'send',
      recipientEmail
    };

    currentUser.balance -= amount;
    transactions.unshift(transaction);
    return transaction;
  },

  // Contacts
  getContacts: async (): Promise<Contact[]> => {
    // TODO: Implement actual get contacts API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return contacts;
  },

  addContact: async (contactData: Omit<Contact, 'id'>): Promise<Contact> => {
    // TODO: Implement actual add contact API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const contact: Contact = {
      ...contactData,
      id: Math.random().toString()
    };
    
    contacts.push(contact);
    return contact;
  }
}; 