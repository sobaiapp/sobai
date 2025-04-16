import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import YoutubeIframe from "react-native-youtube-iframe";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function GuidedMeditationScreen() {
  const navigation = useNavigation();
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  // List of YouTube meditation tracks (replace with your own)
  const tracks = [
    "uTN29kj7e-w", // Meditation Track 1
    "4EaMJOo1jks", // Meditation Track 2
    "rPJzL4hvzqs", // Meditation Track 3
  ];

  // Play/Pause Toggle
  const togglePlayPause = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  // Play Next Track
  const playNext = () => {
    setPlaying(false);
    setTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  return (
    <View style={styles.container}>
      {/* Video Background */}
      <Video
        source={{
          uri: "https://videos.pexels.com/video-files/7297870/7297870-hd_1080_1920_30fps.mp4",
        }}
        rate={1.0}
        volume={0}
        isMuted
        resizeMode="cover"
        shouldPlay
        isLooping
        style={styles.videoBackground}
      />
      <View style={styles.overlay} />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      {/* Meditation Info */}
      <Text style={styles.header}>Guided Meditation</Text>
      <Text style={styles.instruction}>Relax and enjoy your session.</Text>

      {/* YouTube Audio Player (Hidden Video) */}
      <YoutubeIframe
        height={0} // Hide video, only play audio
        play={playing}
        videoId={tracks[trackIndex]}
      />

      {/* Audio Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlayPause}>
          <Ionicons name={playing ? "pause-circle" : "play-circle"} size={70} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext}>
          <Ionicons name="play-skip-forward-circle" size={70} color="white" />
        </TouchableOpacity>
      </View>

      {/* Timer Text */}
      <Text style={styles.timer}>Breathe & Focus</Text>
      <Text style={styles.logo}>SōB AI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  videoBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Dark transparent overlay
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 10,
    borderRadius: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  instruction: {
    fontSize: 18,
    color: "#ddd",
    marginBottom: 40,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
  },
  timer: {
    fontSize: 20,
    marginTop: 30,
    color: "#fff",
  },
  logo: {
    fontSize: 24,
    opacity: 0.5,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 35,
    color: '#fff'

  }
});

