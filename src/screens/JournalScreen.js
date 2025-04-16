import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
  Modal, Platform, StatusBar, Keyboard, TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JournalScreen = () => {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [editIndex, setEditIndex] = useState(null);

  // Load journal entries
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const storedEntries = await AsyncStorage.getItem('journalEntries');
        if (storedEntries) setEntries(JSON.parse(storedEntries));
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    };
    loadEntries();
  }, []);

  // Save journal entries
  useEffect(() => {
    const saveEntries = async () => {
      try {
        await AsyncStorage.setItem('journalEntries', JSON.stringify(entries));
      } catch (error) {
        console.error('Error saving entries:', error);
      }
    };
    if (entries.length > 0) saveEntries();
  }, [entries]);

  const handleAddEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;
    
    const entryWithDate = { 
      ...newEntry, 
      date: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      id: Date.now().toString()
    };

    if (editIndex !== null) {
      // Update existing entry
      const updatedEntries = [...entries];
      updatedEntries[editIndex] = entryWithDate;
      setEntries(updatedEntries);
    } else {
      // Add new entry
      setEntries([entryWithDate, ...entries]);
    }

    resetForm();
  };

  const handleEditEntry = (index) => {
    setNewEntry({
      title: entries[index].title,
      content: entries[index].content
    });
    setEditIndex(index);
    setModalVisible(true);
  };

  const handleDeleteEntry = async (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
  
    try {
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error saving after deletion:', error);
    }
  };
  

  const resetForm = () => {
    setNewEntry({ title: '', content: '' });
    setEditIndex(null);
    setModalVisible(false);
  };

  const renderEntry = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.entryCard}
      onPress={() => handleEditEntry(index)}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteEntry(item.id);
          }}
        >
          <Icon name="delete-outline" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.entryDate}>{item.date}</Text>
      <Text style={styles.entryContent} numberOfLines={3}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Entries List */}
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="book-open-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>No entries yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap the + button to add your first entry</Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Floating Add Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={28} color="white" />
        </TouchableOpacity>

        {/* Add/Edit Entry Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={resetForm}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  {editIndex !== null ? 'Edit Entry' : 'New Entry'}
                </Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  placeholderTextColor="#999"
                  value={newEntry.title}
                  onChangeText={(text) => setNewEntry({ ...newEntry, title: text })}
                  autoFocus
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Write your thoughts..."
                  placeholderTextColor="#999"
                  value={newEntry.content}
                  onChangeText={(text) => setNewEntry({ ...newEntry, content: text })}
                  multiline
                />
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={resetForm}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.saveButton,
                      (!newEntry.title.trim() || !newEntry.content.trim()) && styles.disabledButton
                    ]}
                    onPress={handleAddEntry}
                    disabled={!newEntry.title.trim() || !newEntry.content.trim()}
                  >
                    <Text style={styles.buttonText}>
                      {editIndex !== null ? 'Update' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 80,
  },
  entryCard: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  entryDate: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  entryContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#333',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 150,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default JournalScreen;