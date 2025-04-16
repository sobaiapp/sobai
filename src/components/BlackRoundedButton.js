import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const BlackRoundedButton = ({ title, onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#000', // Black background
        paddingVertical: 15, // Vertical padding for button
        paddingHorizontal: 40, // Horizontal padding for button
        borderRadius: 25, // Rounded corners
        alignItems: 'center', // Center the text horizontally
        justifyContent: 'center', // Center the text vertically
        marginVertical: 10, // Margin between buttons (optional)
    },
    buttonText: {
        color: '#fff', // White text color
        fontSize: 18, // Text size
        fontWeight: 'bold', // Bold text for emphasis
    },
});

export default BlackRoundedButton;
