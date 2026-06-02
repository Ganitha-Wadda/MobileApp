import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  FlatList,
} from "react-native";

const { width } = Dimensions.get("screen");

const avatars = [
  { id: "1", image: "https://img.icons8.com/color/96/000000/boy-student.png" },
  { id: "2", image: "https://img.icons8.com/color/96/000000/girl-student.png" },
  { id: "3", image: "https://img.icons8.com/color/96/000000/boy-with-hat.png" },
  { id: "4", image: "https://img.icons8.com/color/96/000000/girl-with-pony-tail.png" },
  { id: "5", image: "https://img.icons8.com/color/96/000000/smiling-boy.png" },
  { id: "6", image: "https://img.icons8.com/color/96/000000/smiling-girl.png" },
];

export default function ChooseAvatar({ navigation }) {
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.avatarItem, selectedAvatar.id === item.id && styles.selectedAvatar]}
      onPress={() => setSelectedAvatar(item)}
    >
      <Image source={{ uri: item.image }} style={styles.avatarImage} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Choose Avatar</Text>
        <Text style={styles.subText}>Pick your favorite character</Text>
      </View>

      <View style={styles.mainAvatarContainer}>
        <Image source={{ uri: selectedAvatar.image }} style={styles.mainAvatar} />
      </View>

      <FlatList
        data={avatars}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.avatarGrid}
      />

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate("home")}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#b5b5f3", alignItems: "center" },
  header: { alignItems: "center", marginTop: 20, marginBottom: 20 },
  headerText: { fontSize: 28, fontWeight: "700", color: "#000" },
  subText: { fontSize: 16, color: "#6b6b6b", marginTop: 4 },
  mainAvatarContainer: {
    width: width * 0.95,
    height: width * 0.95,
    backgroundColor: "#635bff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
  },
  mainAvatar: { width: "70%", height: "70%" },
  avatarGrid: { justifyContent: "center", alignItems: "center" },
  avatarItem: {
    width: width / 3 - 16,
    height: width / 3 - 16,
    margin: 8,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedAvatar: { borderColor: "#ffcc00" },
  avatarImage: { width: "70%", height: "70%" },
  continueButton: {
    backgroundColor: "#ffcc00",
    width: "80%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  continueText: { fontSize: 18, fontWeight: "700", color: "#fff" },
});