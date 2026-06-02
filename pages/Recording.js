import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";

const recordings = [
  {
    id: "1",
    title: "Recordings - 1",
    desc: "This is recording",
  },
  {
    id: "2",
    title: "Recordings - 2",
    desc: "This is recording",
  },
  {
    id: "3",
    title: "Recordings - 3",
    desc: "This is recording",
  },
  {
    id: "4",
    title: "Recordings - 4",
    desc: "This is recording",
  },
];

// Zoom-style camera icon using pure RN Views
const ZoomCameraIcon = () => (
  <View style={styles.cameraIcon}>
    <View style={styles.playTriangle} />
    <View style={styles.camBody} />
    <View style={styles.camLens} />
  </View>
);

const RecordingCard = ({ item, onPress }) => (
  <View style={styles.card}>
    <View style={styles.iconBox}>
      <Text style={styles.camEmoji}>🎥</Text>
    </View>

    <View style={styles.textBlock}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>

      <Text style={styles.cardDesc} numberOfLines={1}>
        {item.desc}
      </Text>
    </View>

    <TouchableOpacity
      style={styles.viewBtn}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.viewBtnText}>View</Text>
    </TouchableOpacity>
  </View>
);

export default function Recording({ navigation }) {
  const handlePress = (item) => {
    navigation.navigate("viewrecording", {
      recordingId: item.id,
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Recordings</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {recordings.map((item) => (
          <RecordingCard key={item.id} item={item} onPress={handlePress} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  titleContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1A1A3E",
    textAlign: "center",
    letterSpacing: 0.2,
  },

  scrollArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 110,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EEEAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  camEmoji: {
    fontSize: 24,
  },

  textBlock: {
    flex: 1,
    paddingRight: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1A3E",
    marginBottom: 3,
  },

  cardDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "400",
  },

  viewBtn: {
    backgroundColor: "#6C5CE7",
    borderRadius: 50,
    paddingVertical: 9,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },

  viewBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  cameraIcon: {
    width: 32,
    height: 32,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  playTriangle: {
    position: "absolute",
    left: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#6C5CE7",
    zIndex: 3,
  },

  camBody: {
    width: 24,
    height: 18,
    borderRadius: 5,
    backgroundColor: "#6C5CE7",
  },

  camLens: {
    position: "absolute",
    right: 1,
    width: 8,
    height: 12,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: "#6C5CE7",
  },
});