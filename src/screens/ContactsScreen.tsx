import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, ListItem, Button, Input } from 'react-native-elements';
import { api } from '../services/api';
import { Contact } from '../types';

const ContactsScreen: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      const cts = await api.getContacts();
      setContacts(cts);
    };
    fetchContacts();
  }, []);

  const handleAddContact = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    const newContact = await api.addContact({ firstName, lastName, email });
    setContacts([...contacts, newContact]);
    setShowAdd(false);
    setFirstName('');
    setLastName('');
    setEmail('');
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Contactos favoritos</Text>
      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ListItem bottomDivider testID={`contact-item-${item.id}`} accessibilityLabel={`Contact item ${item.id}`}>
            <ListItem.Content>
              <ListItem.Title>{item.firstName} {item.lastName}</ListItem.Title>
              <ListItem.Subtitle>{item.email}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay contactos</Text>}
      />
      {showAdd ? (
        <View style={styles.addContainer}>
          <Input
            placeholder="Nombre"
            value={firstName}
            onChangeText={setFirstName}
            testID="add-contact-first-name"
            accessibilityLabel="Add contact first name"
          />
          <Input
            placeholder="Apellido"
            value={lastName}
            onChangeText={setLastName}
            testID="add-contact-last-name"
            accessibilityLabel="Add contact last name"
          />
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            testID="add-contact-email"
            accessibilityLabel="Add contact email"
          />
          <Button
            title="Agregar"
            onPress={handleAddContact}
            testID="add-contact-confirm"
            accessibilityLabel="Add contact confirm button"
          />
          <Button
            title="Cancelar"
            type="clear"
            onPress={() => setShowAdd(false)}
            testID="add-contact-cancel"
            accessibilityLabel="Add contact cancel button"
          />
        </View>
      ) : (
        <Button
          title="Agregar nuevo contacto"
          onPress={() => setShowAdd(true)}
          containerStyle={styles.addButton}
          testID="add-contact-button"
          accessibilityLabel="Add new contact button"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  addButton: {
    marginTop: 20,
  },
  addContainer: {
    marginTop: 20,
  },
});

export default ContactsScreen; 