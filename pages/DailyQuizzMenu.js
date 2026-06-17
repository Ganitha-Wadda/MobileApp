import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import useT from "../app/i18n/useT";
import { useGetMyGradePapersByTypeQuery } from "../app/features/paperApi";

const { width, height } = Dimensions.get("window");

const clickSound = require("../assets/clip5.mp3");

const CARD_STYLES = [
  {
    icon: "📋",
    iconBg: ["#E8E4FF", "#D4CEFF"],
    starColor: "#8B7CF8",
  },
  {
    icon: "📚",
    iconBg: ["#FFF3D4", "#FFE8A0"],
    starColor: "#F5A623",
  },
  {
    icon: "💡",
    iconBg: ["#E8F4FF", "#D0EAFF"],
    starColor: "#5BC8FF",
  },
  {
    icon: "🏆",
    iconBg: ["#FFF0E8", "#FFE0CC"],
    starColor: "#FF6EB4",
  },
];

const getPapersFromResponse = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.papers)) return response.papers;
  if (Array.isArray(response)) return response;
  return [];
};

const getPaperId = (paper) => paper?.id || paper?._id || "";

const getPaperTitle = (paper) =>
  String(
    paper?.paperTitle ||
      paper?.paperName ||
      paper?.title ||
      paper?.name ||
      "Paper"
  ).trim();

const getPaperSubtitle = (paper) =>
  String(
    paper?.paperSubtitle ||
      paper?.subtitle ||
      paper?.description ||
      ""
  ).trim();

const mapBackendPapersToCards = (papers) =>
  papers.map((paper, index) => {
    const style = CARD_STYLES[index % CARD_STYLES.length];

    return {
      id: getPaperId(paper) || String(index + 1),
      paperId: getPaperId(paper),
      title: getPaperTitle(paper),
      subtitle: getPaperSubtitle(paper),
      icon: style.icon,
      iconBg: style.iconBg,
      starColor: style.starColor,
      rawPaper: paper,
    };
  });

const getErrorMessage = (error, token) => {
  if (!token) return "Please login first.";
  return (
    error?.data?.message ||
    error?.error ||
    error?.message ||
    "Unable to load papers."
  );
};

const StateBox = ({ loading, title, message, onRetry }) => (
  <TouchableOpacity
    activeOpacity={onRetry ? 0.85 : 1}
    onPress={onRetry}
    disabled={!onRetry || loading}
    style={styles.stateBox}
  >
    {loading && <ActivityIndicator size="small" />}
    <Text style={styles.stateTitle}>{title}</Text>
    {!!message && <Text style={styles.stateText}>{message}</Text>}
    {!!onRetry && !loading && <Text style={styles.retryText}>Tap to retry</Text>}
  </TouchableOpacity>
);

const SparkDot = ({ style, delay = 0, color = "#E0D8FF" }) => {
  const scaleAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.sparkDot,
        style,
        {
          backgroundColor: color,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

const DecoStar = ({
  style,
  size = 22,
  color = "#8B7CF8",
  delay = 0,
  filled = true,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(filled ? 0.85 : 0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: filled ? 0.85 : 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.decoStar,
        {
          fontSize: size,
          color,
          opacity: opacityAnim,
          transform: [{ translateY: floatAnim }],
        },
        style,
      ]}
    >
      {filled ? "★" : "☆"}
    </Animated.Text>
  );
};

const PaperCard = ({ item, index, navigation, playClickSound, startLabel }) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = async () => {
    await playClickSound();

    navigation.navigate("paperpage", {
      paperId: item.paperId,
      paperTitle: item.title,
      paperType: "daily paper",
      hidePaperTitle: true,
      paper: item.rawPaper,
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={item.iconBg}
        style={styles.iconCircle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.iconEmoji}>{item.icon}</Text>
      </LinearGradient>

      <View style={styles.cardTextBlock}>
        <Text
          style={[
            styles.cardTitle,
            !item.subtitle && styles.cardTitleNoSubtitle,
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {!!item.subtitle && (
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
        )}

        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handlePress}
            onPressIn={() =>
              Animated.spring(btnScale, {
                toValue: 0.93,
                useNativeDriver: true,
              }).start()
            }
            onPressOut={() =>
              Animated.spring(btnScale, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
              }).start()
            }
          >
            <LinearGradient
              colors={["#6B5BF5", "#4F3FE8"]}
              style={styles.startBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.startBtnText}>{startLabel}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Text style={[styles.cardStar, { color: item.starColor }]}>★</Text>
    </Animated.View>
  );
};

export default function DailyQuizzmenu({ navigation }) {
  const soundRef = useRef(null);
  const { t } = useT();
  const token = useSelector((state) => state?.auth?.token);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMyGradePapersByTypeQuery(
    { paperType: "daily paper" },
    { skip: !token }
  );

  const backendPapers = getPapersFromResponse(data);

  const papers = useMemo(
    () => mapBackendPapersToCards(backendPapers),
    [backendPapers]
  );

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(clickSound);
      soundRef.current = sound;
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playClickSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.log("Sound play error:", error);
    }
  };

  const isBusy = isLoading || isFetching;
  const errorMessage = error || !token ? getErrorMessage(error, token) : "";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECEEFF" />

      <LinearGradient
        colors={["#ECEEFF", "#F0EEFF", "#E8ECFF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SparkDot style={{ top: height * 0.05, left: width * 0.06 }} delay={0} color="#D0CAFF" />
      <SparkDot style={{ top: height * 0.09, right: width * 0.07 }} delay={300} color="#FFD6F0" />
      <SparkDot style={{ top: height * 0.18, left: width * 0.1 }} delay={150} color="#D0CAFF" />
      <SparkDot style={{ top: height * 0.3, right: width * 0.05 }} delay={500} color="#FFE0A0" />
      <SparkDot style={{ top: height * 0.45, left: width * 0.04 }} delay={200} color="#D0CAFF" />
      <SparkDot style={{ top: height * 0.55, right: width * 0.06 }} delay={700} color="#FFD6F0" />
      <SparkDot style={{ top: height * 0.68, left: width * 0.07 }} delay={400} color="#D0CAFF" />
      <SparkDot style={{ top: height * 0.78, right: width * 0.08 }} delay={100} color="#FFE0A0" />
      <SparkDot style={{ top: height * 0.88, left: width * 0.12 }} delay={600} color="#D0CAFF" />

      <DecoStar style={{ top: height * 0.07, left: width * 0.03 }} size={14} color="#C8BFFF" delay={0} filled={false} />
      <DecoStar style={{ top: height * 0.22, left: width * 0.02 }} size={20} color="#C8BFFF" delay={400} filled={false} />
      <DecoStar style={{ top: height * 0.4, left: width * 0.03 }} size={16} color="#C8BFFF" delay={200} filled={false} />
      <DecoStar style={{ top: height * 0.58, left: width * 0.02 }} size={22} color="#C8BFFF" delay={600} filled={false} />
      <DecoStar style={{ top: height * 0.74, left: width * 0.04 }} size={14} color="#C8BFFF" delay={300} filled={false} />

      <DecoStar style={{ top: height * 0.12, right: width * 0.03 }} size={18} color="#C8BFFF" delay={100} filled={false} />
      <DecoStar style={{ top: height * 0.28, right: width * 0.02 }} size={14} color="#C8BFFF" delay={500} filled={false} />
      <DecoStar style={{ top: height * 0.48, right: width * 0.03 }} size={20} color="#C8BFFF" delay={250} filled={false} />
      <DecoStar style={{ top: height * 0.65, right: width * 0.02 }} size={16} color="#C8BFFF" delay={700} filled={false} />
      <DecoStar style={{ top: height * 0.82, right: width * 0.04 }} size={22} color="#C8BFFF" delay={350} filled={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isBusy ? (
          <StateBox loading title="Loading daily quiz papers..." />
        ) : errorMessage ? (
          <StateBox title="Cannot load papers" message={errorMessage} onRetry={token ? refetch : undefined} />
        ) : papers.length === 0 ? (
          <StateBox title="No daily quiz papers" message="No published daily quiz papers are available for your login grade yet." />
        ) : (
          papers.map((item, index) => (
            <PaperCard
              key={item.id}
              item={item}
              index={index}
              navigation={navigation}
              playClickSound={playClickSound}
              startLabel={t("start") || "Start"}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECEEFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
    gap: 16,
  },
  stateBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
    shadowColor: "#7B6FCC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  stateTitle: {
    marginTop: 8,
    color: "#1A1A2E",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  stateText: {
    marginTop: 6,
    color: "#7D76A8",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  retryText: {
    marginTop: 10,
    color: "#4F3FE8",
    fontSize: 13,
    fontWeight: "700",
  },
  sparkDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  decoStar: {
    position: "absolute",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: "#7B6FCC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 38,
  },
  cardTextBlock: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  cardTitleNoSubtitle: {
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: "#7D76A8",
    lineHeight: 18,
    marginBottom: 10,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 50,
    gap: 8,
    alignSelf: "flex-start",
    shadowColor: "#4F3FE8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  startBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  startBtnArrow: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cardStar: {
    position: "absolute",
    top: 14,
    right: 16,
    fontSize: 20,
  },
});


