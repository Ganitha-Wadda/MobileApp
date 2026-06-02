import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const avatarImages = [
  "https://api.dicebear.com/9.x/adventurer/png?seed=boy1&backgroundColor=transparent",
  "https://api.dicebear.com/9.x/adventurer/png?seed=boy2&backgroundColor=transparent",
  "https://api.dicebear.com/9.x/adventurer/png?seed=boy3&backgroundColor=transparent",
];

const items = [
  { id: 1, type: "hoodie", color: "#FFBF00", selected: true },
  { id: 2, type: "hoodie", color: "#0058D9", star: true },
  { id: 3, type: "hoodie", color: "#D71920" },
  { id: 4, type: "beanie", color: "#6A1BC7", star: true },
  { id: 5, type: "cap", color: "#7A2DCE", star: true },
  { id: 6, type: "bag" },
];

export default function ChooseAvatarPage({ navigation }) {
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(1);
  const [activeTab, setActiveTab] = useState("Shirts");

  const nextAvatar = () => {
    setAvatarIndex((prev) => (prev + 1) % avatarImages.length);
  };

  const previousAvatar = () => {
    setAvatarIndex((prev) =>
      prev === 0 ? avatarImages.length - 1 : prev - 1
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={["#3522D8", "#4C2EFF", "#2616C7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.glowCircleOne} />
            <View style={styles.glowCircleTwo} />
            <View style={styles.orbitOne} />
            <View style={styles.orbitTwo} />
            <View style={styles.floorRingOne} />
            <View style={styles.floorRingTwo} />

            <Text style={[styles.star, styles.starOne]}>★</Text>
            <Text style={[styles.star, styles.starTwo]}>★</Text>
            <Text style={[styles.star, styles.starThree]}>✦</Text>
            <Text style={[styles.star, styles.starFour]}>✦</Text>
            <Text style={[styles.planet, styles.planetOne]}>🪐</Text>
            <Text style={[styles.planet, styles.planetTwo]}>🪐</Text>

            <TouchableOpacity style={styles.leftArrow} onPress={previousAvatar}>
              <Text style={styles.arrowText}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rightArrow} onPress={nextAvatar}>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>

            <Image
              source={{ uri: avatarImages[avatarIndex] }}
              style={styles.avatarImage}
              resizeMode="contain"
            />

            <View style={styles.avatarBody}>
              <View style={styles.leftHand} />
              <View style={styles.rightHand} />

              <View style={styles.hoodieTop} />
              <View style={styles.hoodieBody}>
                <View style={styles.hoodLineOne} />
                <View style={styles.hoodLineTwo} />
              </View>

              <View style={styles.legWrapper}>
                <View style={styles.leftLeg} />
                <View style={styles.rightLeg} />
              </View>

              <View style={styles.shoeWrapper}>
                <View style={styles.shoe} />
                <View style={styles.shoe} />
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Customize items</Text>

        <View style={styles.tabRow}>
          <TabButton
            title="Shirts"
            icon="👕"
            active={activeTab === "Shirts"}
            onPress={() => setActiveTab("Shirts")}
          />
          <TabButton
            title="Hat"
            icon="🎩"
            active={activeTab === "Hat"}
            onPress={() => setActiveTab("Hat")}
          />
          <TabButton
            title="Cap"
            icon="🧢"
            active={activeTab === "Cap"}
            onPress={() => setActiveTab("Cap")}
          />
          <TabButton
            title="Bag"
            icon="🎒"
            active={activeTab === "Bag"}
            onPress={() => setActiveTab("Bag")}
          />
        </View>

        <View style={styles.grid}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => setSelectedItem(item.id)}
              style={[
                styles.itemCard,
                selectedItem === item.id && styles.selectedCard,
              ]}
            >
              {selectedItem === item.id && (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}

              {item.type === "hoodie" && (
                <Hoodie color={item.color} star={item.star} />
              )}

              {item.type === "beanie" && (
                <Beanie color={item.color} star={item.star} />
              )}

              {item.type === "cap" && (
                <Cap color={item.color} star={item.star} />
              )}

              {item.type === "bag" && <Bag />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.continueButtonWrapper}
          onPress={() => navigation?.navigate("Home")}
        >
          <LinearGradient
            colors={["#FFC928", "#FFB800"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Text style={styles.continueArrow}>›</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function TabButton({ title, icon, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.tabButton, active && styles.activeTabButton]}
    >
      <Text style={[styles.tabIcon, active && styles.activeTabIcon]}>
        {icon}
      </Text>
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function Hoodie({ color, star }) {
  return (
    <View style={styles.clothBox}>
      <View style={[styles.hood, { backgroundColor: color }]} />
      <View style={[styles.leftSleeve, { backgroundColor: color }]} />
      <View style={[styles.rightSleeve, { backgroundColor: color }]} />
      <View style={[styles.hoodieMain, { backgroundColor: color }]}>
        {star && <Text style={styles.itemStar}>★</Text>}
        <View style={styles.pocket} />
      </View>
    </View>
  );
}

function Beanie({ color, star }) {
  return (
    <View style={styles.clothBox}>
      <View style={[styles.beaniePom, { backgroundColor: "#E5A500" }]} />
      <View style={[styles.beanieTop, { backgroundColor: color }]}>
        {star && <Text style={styles.hatStar}>★</Text>}
      </View>
      <View style={[styles.beanieBottom, { backgroundColor: color }]} />
    </View>
  );
}

function Cap({ color, star }) {
  return (
    <View style={styles.clothBox}>
      <View style={[styles.capTop, { backgroundColor: color }]}>
        {star && <Text style={styles.capStar}>★</Text>}
      </View>
      <View style={[styles.capPeak, { backgroundColor: "#FFC21A" }]} />
    </View>
  );
}

function Bag() {
  return (
    <View style={styles.bagBox}>
      <View style={styles.bagHandle} />
      <View style={styles.bagBody}>
        <Text style={styles.bagPatternOne}>✦</Text>
        <Text style={styles.bagPatternTwo}>✦</Text>
        <Text style={styles.bagLogo}>V</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingBottom: 18,
  },

  heroWrapper: {
    paddingHorizontal: 6,
    paddingTop: 8,
  },

  heroCard: {
    height: 230,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2511B8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  glowCircleOne: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: 12,
    left: 45,
  },

  glowCircleTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(236,72,153,0.14)",
    top: 45,
    right: 40,
  },

  orbitOne: {
    position: "absolute",
    width: 225,
    height: 70,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: "rgba(255,102,203,0.8)",
    transform: [{ rotate: "-8deg" }],
    top: 93,
  },

  orbitTwo: {
    position: "absolute",
    width: 250,
    height: 82,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: "rgba(255,210,70,0.55)",
    transform: [{ rotate: "-14deg" }],
    top: 94,
  },

  floorRingOne: {
    position: "absolute",
    width: 190,
    height: 42,
    borderRadius: 95,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    bottom: 14,
  },

  floorRingTwo: {
    position: "absolute",
    width: 245,
    height: 55,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    bottom: 7,
  },

  star: {
    position: "absolute",
    color: "#FFD21B",
    fontSize: 18,
  },

  starOne: {
    left: 27,
    top: 64,
  },

  starTwo: {
    right: 24,
    top: 85,
  },

  starThree: {
    left: 22,
    bottom: 60,
    color: "#B782FF",
    fontSize: 15,
  },

  starFour: {
    right: 70,
    top: 38,
    color: "#FFFFFF",
    fontSize: 12,
  },

  planet: {
    position: "absolute",
    fontSize: 20,
    opacity: 0.75,
  },

  planetOne: {
    right: 14,
    bottom: 45,
  },

  planetTwo: {
    right: 8,
    top: 8,
    fontSize: 16,
    opacity: 0.35,
  },

  leftArrow: {
    position: "absolute",
    left: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  rightArrow: {
    position: "absolute",
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  arrowText: {
    fontSize: 36,
    color: "#FFFFFF",
    lineHeight: 36,
    marginTop: -3,
  },

  avatarImage: {
    width: 122,
    height: 122,
    position: "absolute",
    top: 12,
    zIndex: 6,
  },

  avatarBody: {
    position: "absolute",
    bottom: 26,
    width: 130,
    height: 120,
    alignItems: "center",
    zIndex: 5,
  },

  leftHand: {
    position: "absolute",
    width: 18,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#FDB887",
    left: 20,
    top: 20,
    transform: [{ rotate: "-36deg" }],
  },

  rightHand: {
    position: "absolute",
    width: 16,
    height: 37,
    borderRadius: 10,
    backgroundColor: "#FDB887",
    right: 21,
    top: 39,
    transform: [{ rotate: "14deg" }],
  },

  hoodieTop: {
    position: "absolute",
    top: 28,
    width: 55,
    height: 35,
    borderRadius: 24,
    backgroundColor: "#FFC400",
  },

  hoodieBody: {
    position: "absolute",
    top: 50,
    width: 72,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFBA00",
    alignItems: "center",
  },

  hoodLineOne: {
    width: 2,
    height: 28,
    backgroundColor: "#FFFFFF",
    opacity: 0.5,
    position: "absolute",
    top: 8,
    left: 30,
  },

  hoodLineTwo: {
    width: 2,
    height: 28,
    backgroundColor: "#FFFFFF",
    opacity: 0.5,
    position: "absolute",
    top: 8,
    right: 30,
  },

  legWrapper: {
    position: "absolute",
    top: 94,
    flexDirection: "row",
    gap: 8,
  },

  leftLeg: {
    width: 23,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#0079C8",
  },

  rightLeg: {
    width: 23,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#0079C8",
  },

  shoeWrapper: {
    position: "absolute",
    top: 137,
    flexDirection: "row",
    gap: 4,
  },

  shoe: {
    width: 31,
    height: 11,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADAF8",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#17245A",
    marginTop: 13,
    marginLeft: 7,
    marginBottom: 8,
  },

  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 7,
    justifyContent: "space-between",
    marginBottom: 10,
  },

  tabButton: {
    width: (width - 42) / 4,
    height: 29,
    borderRadius: 16,
    backgroundColor: "#F1F2F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B8B8C8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 2,
  },

  activeTabButton: {
    backgroundColor: "#087BFF",
  },

  tabIcon: {
    fontSize: 13,
    marginRight: 4,
  },

  activeTabIcon: {
    color: "#FFFFFF",
  },

  tabText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#464A5C",
  },

  activeTabText: {
    color: "#FFFFFF",
  },

  grid: {
    paddingHorizontal: 7,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  itemCard: {
    width: (width - 24) / 3,
    height: 88,
    backgroundColor: "#F4F5FA",
    borderRadius: 12,
    marginBottom: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#ECEEF7",
    shadowColor: "#B5B5C5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 4,
    elevation: 2,
  },

  selectedCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#1683FF",
    shadowColor: "#1683FF",
    shadowOpacity: 0.28,
    elevation: 5,
  },

  checkCircle: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1683FF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  checkText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  clothBox: {
    width: 76,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },

  hood: {
    position: "absolute",
    top: 6,
    width: 38,
    height: 31,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    opacity: 0.95,
  },

  hoodieMain: {
    position: "absolute",
    top: 25,
    width: 54,
    height: 43,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  leftSleeve: {
    position: "absolute",
    top: 28,
    left: 5,
    width: 23,
    height: 37,
    borderRadius: 12,
    transform: [{ rotate: "13deg" }],
  },

  rightSleeve: {
    position: "absolute",
    top: 28,
    right: 5,
    width: 23,
    height: 37,
    borderRadius: 12,
    transform: [{ rotate: "-13deg" }],
  },

  itemStar: {
    color: "#FFC928",
    fontSize: 22,
    marginTop: -4,
    zIndex: 5,
  },

  pocket: {
    width: 22,
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    position: "absolute",
    bottom: 7,
  },

  beaniePom: {
    position: "absolute",
    top: 1,
    width: 18,
    height: 18,
    borderRadius: 9,
    zIndex: 3,
  },

  beanieTop: {
    position: "absolute",
    top: 14,
    width: 65,
    height: 43,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  beanieBottom: {
    position: "absolute",
    top: 52,
    width: 68,
    height: 13,
    borderRadius: 8,
    opacity: 0.9,
  },

  hatStar: {
    color: "#FFC928",
    fontSize: 23,
    marginTop: 8,
  },

  capTop: {
    width: 66,
    height: 39,
    borderTopLeftRadius: 33,
    borderTopRightRadius: 33,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  capPeak: {
    width: 45,
    height: 13,
    borderRadius: 20,
    marginTop: -3,
    marginLeft: -27,
    transform: [{ rotate: "-8deg" }],
  },

  capStar: {
    color: "#FFC928",
    fontSize: 22,
    marginTop: 7,
  },

  bagBox: {
    width: 72,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
  },

  bagHandle: {
    position: "absolute",
    top: 4,
    width: 38,
    height: 30,
    borderRadius: 18,
    borderWidth: 5,
    borderColor: "#A66B24",
    backgroundColor: "transparent",
  },

  bagBody: {
    position: "absolute",
    top: 25,
    width: 58,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#6B3D1C",
    borderWidth: 2,
    borderColor: "#B5792C",
    alignItems: "center",
    justifyContent: "center",
  },

  bagPatternOne: {
    position: "absolute",
    left: 8,
    top: 7,
    color: "#B5792C",
    fontSize: 10,
  },

  bagPatternTwo: {
    position: "absolute",
    right: 8,
    bottom: 7,
    color: "#B5792C",
    fontSize: 10,
  },

  bagLogo: {
    color: "#D7A950",
    fontWeight: "900",
    fontSize: 17,
    fontStyle: "italic",
  },

  continueButtonWrapper: {
    marginHorizontal: 13,
    marginTop: 4,
    borderRadius: 24,
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.42,
    shadowRadius: 8,
    elevation: 6,
  },

  continueButton: {
    height: 42,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  continueText: {
    fontSize: 15,
    color: "#241C00",
    fontWeight: "800",
  },

  continueArrow: {
    fontSize: 28,
    color: "#241C00",
    fontWeight: "600",
    marginLeft: 14,
    marginTop: -2,
  },
});