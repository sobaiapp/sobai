// components/DaysSoberCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DaysSoberCard = ({ navigation }) => {
  const [startDate, setStartDate] = useState(null);
  const [daysSober, setDaysSober] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadStartDate();
  }, []);

  const loadStartDate = async () => {
    try {
      const storedDate = await AsyncStorage.getItem('sobrietyStartDate');
      if (storedDate) {
        setStartDate(storedDate);
        calculateDaysSober(storedDate);
      }
    } catch (error) {
      console.error('Error loading date:', error);
    }
  };

  const calculateDaysSober = (date) => {
    const start = new Date(date);
    const today = new Date();
    const difference = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    setDaysSober(difference);
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  const onDateChange = (event, selected) => {
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const confirmDate = async () => {
    setShowPicker(false);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    try {
      await AsyncStorage.setItem('sobrietyStartDate', formattedDate);
      setStartDate(formattedDate);
      calculateDaysSober(formattedDate);
    } catch (error) {
      console.error('Error saving date:', error);
    }
  };
  
 return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Days Sober Card with Date Picker */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Days Clean</Text>
        <Text style={styles.counter}>{daysSober} Days</Text>
        {startDate ? (
          <Text style={styles.dateText}>Since: {startDate}</Text>
        ) : (
          <Text style={styles.dateText}>Set your start date below.</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={showDatePicker}>
          <Text style={styles.buttonText}>Select Start Date</Text>
        </TouchableOpacity>
      </View>
       {/* Date Picker Modal */}
       {showPicker && (
        <Modal transparent={true} animationType="slide" visible={showPicker} onRequestClose={() => setShowPicker(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker value={selectedDate} mode="date" display="spinner" onChange={onDateChange} maximumDate={new Date()} />
              <TouchableOpacity style={styles.doneButton} onPress={confirmDate}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
          </ScrollView>
            );

      };

      const styles = StyleSheet.create({
        container: {
          flexGrow: 1,
          alignItems: 'center',
          padding: 0,
          backgroundColor: '#F9F9F9',
        },
        cardTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#000',
          marginBottom: 10,
        },
        counter: {
          fontSize: 42,
          fontWeight: 'bold',
          color: '#323232',
        },
        dateText: {
          fontSize: 16,
          color: '#555',
          marginTop: 5,
          marginBottom: 5,
        },
        card: {
          width: '100%',
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 20,
          marginBottom: 15,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        cardTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#000',
          marginBottom: 10,
        },
      
        dateText: {
          fontSize: 16,
          color: '#555',
          marginTop: 5,
          marginBottom: 5,
        },
        button: {
          backgroundColor: '#000',
          paddingVertical: 12,
          paddingHorizontal: 25,
          borderRadius: 30,
          marginBottom: 10,
          elevation: 3,
        },
        buttonText: {
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold',
        },
        modalContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContent: {
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 10,
          width: '80%',
          alignItems: 'center',
        },
        doneButton: {
          marginTop: 10,
          backgroundColor: '#000',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
        },
        doneButtonText: {
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold',
        },
      });

export default DaysSoberCard;
