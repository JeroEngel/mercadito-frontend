import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, ListItem, Button, Icon, SearchBar, Divider } from 'react-native-elements';
import { api } from '../services/api';
import { Contact } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const ContactsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar contactos
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const contactsList = await api.getContacts();
      setContacts(contactsList);
    } catch (error: any) {
      console.error('Error cargando contactos:', error);
      setError(error.message || 'No se pudieron cargar los contactos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Actualiza los contactos cuando la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [fetchContacts])
  );

  // Búsqueda de usuarios
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await api.searchUsers(query);
      // Filtra los usuarios que ya están en la lista de contactos
      const filteredResults = results.filter(
        user => !contacts.some(contact => contact.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [contacts]);

  // Agregar un contacto
  const handleAddContact = async (userId: string) => {
    try {
      setLoading(true);
      const newContact = await api.addContact(userId);
      setContacts(prevContacts => [...prevContacts, newContact]);
      setSearchResults(searchResults.filter(user => user.id !== userId));
      Alert.alert('Éxito', 'Contacto agregado a favoritos');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo agregar el contacto');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un contacto
  const handleRemoveContact = async (contactId: string) => {
    try {
      setLoading(true);
      await api.removeContact(contactId);
      setContacts(contacts.filter(contact => contact.id !== contactId));
      Alert.alert('Éxito', 'Contacto eliminado de favoritos');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo eliminar el contacto');
    } finally {
      setLoading(false);
    }
  };

  // Navegar a la pantalla de transferencia con el email prellenado
  const handleContactPress = (contact: Contact) => {
    try {
      navigation.navigate('Transfer', { email: contact.email });
    } catch (error) {
      console.error('Error al navegar:', error);
      Alert.alert('Error', 'No se pudo abrir la pantalla de transferencia');
    }
  };

  // Renderizar un ítem de contacto
  const renderContactItem = ({ item }: { item: Contact }) => (
    <ListItem 
      bottomDivider 
      testID={`contact-item-${item.id}`}
      accessibilityLabel={`Contact item ${item.id}`}
      onPress={() => handleContactPress(item)}
    >
      <ListItem.Content>
        <ListItem.Title>{item.firstName} {item.lastName}</ListItem.Title>
        <ListItem.Subtitle>{item.email}</ListItem.Subtitle>
      </ListItem.Content>
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation(); // Evita que se active el onPress del ListItem
          handleRemoveContact(item.id);
        }}
        style={styles.removeButton}
        testID={`remove-contact-${item.id}`}
      >
        <Icon name="delete" color="#FF3B30" size={24} />
      </TouchableOpacity>
    </ListItem>
  );

  // Renderizar un ítem de resultado de búsqueda
  const renderSearchResultItem = ({ item }: { item: Contact }) => (
    <ListItem 
      bottomDivider 
      testID={`search-result-${item.id}`}
      accessibilityLabel={`Search result ${item.id}`}
    >
      <ListItem.Content>
        <ListItem.Title>{item.firstName} {item.lastName}</ListItem.Title>
        <ListItem.Subtitle>{item.email}</ListItem.Subtitle>
      </ListItem.Content>
      <TouchableOpacity 
        onPress={() => handleAddContact(item.id)}
        style={styles.addButton}
        testID={`add-contact-${item.id}`}
      >
        <Icon name="add" color="#007AFF" size={24} />
      </TouchableOpacity>
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Contactos favoritos</Text>
      
      {/* Barra de búsqueda */}
      <SearchBar
        placeholder="Buscar usuarios por nombre o email..."
        onChangeText={handleSearch}
        value={searchQuery}
        platform="ios"
        containerStyle={styles.searchBar}
        onClear={() => setSearchResults([])}
        showLoading={searching}
        testID="search-bar"
      />
      
      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Resultados de búsqueda</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderSearchResultItem}
            style={styles.searchResultsList}
            ListEmptyComponent={searching ? 
              <ActivityIndicator size="small" color="#007AFF" /> : 
              <Text style={styles.emptyMessage}>No se encontraron resultados</Text>
            }
          />
          <Divider style={styles.divider} />
        </>
      )}
      
      {/* Lista de contactos favoritos */}
      <Text style={styles.sectionTitle}>Mis contactos</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            title="Reintentar" 
            onPress={fetchContacts} 
            type="outline"
            containerStyle={styles.retryButton}
          />
        </View>
      ) : loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          ListEmptyComponent={
            <Text style={styles.emptyMessage}>No hay contactos favoritos</Text>
          }
          onRefresh={() => {
            setRefreshing(true);
            fetchContacts();
          }}
          refreshing={refreshing}
          style={styles.contactList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    marginBottom: 10,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#333',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  contactList: {
    flex: 1,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#E0E0E0',
    height: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    width: '50%',
  }
});

export default ContactsScreen;