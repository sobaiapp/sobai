import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as Haptic from 'expo-haptics'; // Import haptics

const PaywallScreen = ({ navigation }) => {
  const subscribe = async () => {
    await Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
    navigation.navigate('PaywallScreenTwo');
  };

  return (
    <View style={styles.container}>
      {/* Top Section with Image */}
      <View style={styles.mediaContainer}>
      <Image
        source={{ uri: 'https://scontent.fsan1-1.fna.fbcdn.net/v/t39.30808-6/481302879_558011590625224_4456308744439385058_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Ssx7CsN50cYQ7kNvgH8dGd-&_nc_oc=AdkB9mLwWqeBL7hDgY6l7mCfyTadac1ih13VxR9eEJtA6UpL-jS86j6_qZp5j5USSiG1NQLrtYuZ2haEYGzQGRP-&_nc_zt=23&_nc_ht=scontent.fsan1-1.fna&_nc_gid=mcYDkTVFRUqLRoWeVmdDbQ&oh=00_AYHQWHFNFyxCKk4tWazz4nWxTuHFnwssJpb_iPFsLy8T6w&oe=67E9432B' }}
        style={[styles.image, {
          width: '70%',
          height: undefined,
          aspectRatio: 8 / 16,
          marginTop: 220,
          padding: 10,
        }]}
        resizeMode="contain"
      />

        
        {/* Overlay Text */}
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>We want you to try SōB AI Free!</Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Try SōB Ai Free</Text>
        <Text style={styles.description}>
          Enjoy a Free 3-day trial*, then $4.99 per month. Cancel anytime.
        </Text>

        {/* Apple Pay Button */}
        <TouchableOpacity onPress={subscribe} style={[styles.paymentButton, styles.applePay]}>
          <Text style={styles.paymentText}>Try for $0.00</Text>
        </TouchableOpacity>

        <Text style={styles.cancelInfo}>*You can cancel anytime in your account settings.</Text>
      </View>
    </View>
  );
};

export default PaywallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  mediaContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Black background
    position: 'relative', // Allow positioning of overlay text
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 70, // Adjust for positioning
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  overlayText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentButton: {
    width: '90%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  applePay: {
    backgroundColor: '#000',
  },
  googlePay: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  paymentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelInfo: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
});
