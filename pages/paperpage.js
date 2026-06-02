import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function Paperpage({ navigation }) {
  const options = [
    { id: "i.", answer: "8" },
    { id: "ii.", answer: "6" },
    { id: "iii.", answer: "9" },
    { id: "iv.", answer: "10" },
  ];

  const handleSubmit = () => {
    navigation.navigate("reviewpage");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8FF" />

      <View style={styles.container}>
        {/* Background small decorations */}
        <Text style={[styles.star, styles.starOne]}>★</Text>
        <Text style={[styles.star, styles.starTwo]}>★</Text>
        <Text style={[styles.star, styles.starThree]}>★</Text>
        <Text style={[styles.star, styles.starFour]}>★</Text>

        <View style={[styles.dot, styles.dotOne]} />
        <View style={[styles.dot, styles.dotTwo]} />
        <View style={[styles.dot, styles.dotThree]} />
        <View style={[styles.dot, styles.dotFour]} />
        <View style={[styles.dot, styles.dotFive]} />
        <View style={[styles.dot, styles.dotSix]} />
        <View style={[styles.dot, styles.dotSeven]} />

        {/* Title */}
        <Text style={styles.title}>Daily Quiz</Text>

        {/* Main Card */}
        <View style={styles.card}>
          <View style={styles.questionBadge}>
            <Text style={styles.questionBadgeText}>Question 1</Text>
          </View>

          <Text style={styles.questionText}>3 × 2 = ??</Text>

          <View style={styles.optionsWrapper}>
            {options.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={styles.optionBox}
              >
                <Text style={styles.optionNumber}>{item.id}</Text>
                <Text style={styles.optionText}>{item.answer}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.submitWrapper}
            onPress={handleSubmit}
          >
            <LinearGradient
              colors={["#8D4DFF", "#233BFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>Submit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom cloud style decoration */}
        <View style={styles.cloudArea}>
          <View style={[styles.cloudCircle, styles.cloudOne]} />
          <View style={[styles.cloudCircle, styles.cloudTwo]} />
          <View style={[styles.cloudCircle, styles.cloudThree]} />
          <View style={[styles.cloudCircle, styles.cloudFour]} />
          <View style={[styles.cloudCircle, styles.cloudFive]} />
          <View style={[styles.cloudCircle, styles.cloudSix]} />
          <View style={[styles.cloudCircle, styles.cloudSeven]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD_WIDTH = width * 0.9;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F8FF",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8F8FF",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    paddingTop: Platform.OS === "android" ? 15 : 5,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#101943",
    marginTop: 8,
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  card: {
    width: CARD_WIDTH,
    minHeight: 560,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    alignItems: "center",
    paddingTop: 25,
    paddingHorizontal: 14,
    paddingBottom: 22,

    shadowColor: "#C9CAD8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },

  questionBadge: {
    backgroundColor: "#F1ECFF",
    paddingHorizontal: 33,
    paddingVertical: 8,
    borderRadius: 18,
    marginBottom: 19,
  },

  questionBadgeText: {
    color: "#4D2DDE",
    fontSize: 13,
    fontWeight: "800",
  },

  questionText: {
    fontSize: 31,
    color: "#060B36",
    fontWeight: "900",
    marginBottom: 15,
    letterSpacing: 1,
  },

  optionsWrapper: {
    width: "100%",
    gap: 11,
    marginTop: 2,
  },

  optionBox: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,

    borderWidth: 1,
    borderColor: "#EEF0F8",

    shadowColor: "#C7C9D8",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  optionNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#6E46F2",
    width: 36,
  },

  optionText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0C123D",
  },

  submitWrapper: {
    marginTop: 16,
  },

  submitButton: {
    width: 150,
    height: 43,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#4338FF",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  star: {
    position: "absolute",
    fontWeight: "900",
    zIndex: 1,
  },

  starOne: {
    top: 20,
    left: 57,
    fontSize: 23,
    color: "#FFD35A",
  },

  starTwo: {
    top: 18,
    right: 78,
    fontSize: 25,
    color: "#8B5CF6",
  },

  starThree: {
    top: 77,
    left: 84,
    fontSize: 16,
    color: "#9B70FF",
  },

  starFour: {
    bottom: 35,
    left: 87,
    fontSize: 17,
    color: "#FFC8D2",
  },

  dot: {
    position: "absolute",
    borderRadius: 50,
    zIndex: 1,
  },

  dotOne: {
    top: 25,
    left: 39,
    width: 4,
    height: 4,
    backgroundColor: "#55B7FF",
  },

  dotTwo: {
    top: 31,
    right: 50,
    width: 4,
    height: 4,
    backgroundColor: "#FFD75D",
  },

  dotThree: {
    top: 84,
    left: 70,
    width: 4,
    height: 4,
    backgroundColor: "#67BFFF",
  },

  dotFour: {
    top: 83,
    right: 62,
    width: 4,
    height: 4,
    backgroundColor: "#67BFFF",
  },

  dotFive: {
    right: 9,
    bottom: 109,
    width: 6,
    height: 6,
    backgroundColor: "#C99BFF",
  },

  dotSix: {
    bottom: 27,
    left: 56,
    width: 5,
    height: 5,
    backgroundColor: "#FFD46A",
  },

  dotSeven: {
    bottom: 18,
    right: 82,
    width: 5,
    height: 5,
    backgroundColor: "#72C4FF",
  },

  cloudArea: {
    position: "absolute",
    width: "100%",
    height: 85,
    bottom: -20,
    left: 0,
    right: 0,
  },

  cloudCircle: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
  },

  cloudOne: {
    width: 80,
    height: 80,
    left: -28,
    bottom: -13,
  },

  cloudTwo: {
    width: 70,
    height: 70,
    left: 22,
    bottom: -9,
  },

  cloudThree: {
    width: 95,
    height: 95,
    left: 78,
    bottom: -35,
  },

  cloudFour: {
    width: 75,
    height: 75,
    left: 150,
    bottom: -24,
  },

  cloudFive: {
    width: 90,
    height: 90,
    right: 52,
    bottom: -34,
  },

  cloudSix: {
    width: 75,
    height: 75,
    right: 9,
    bottom: -16,
  },

  cloudSeven: {
    width: 100,
    height: 100,
    right: -48,
    bottom: -18,
  },
});