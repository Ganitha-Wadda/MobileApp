import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SparkDot = ({ style, delay = 0, color = '#B5C8FF' }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 1100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.5, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.sparkDot, style, { backgroundColor: color, transform: [{ scale: scaleAnim }] }]}
    />
  );
};

const FloatingStar = ({ style, size = 16, color = '#FFD700', delay = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(floatAnim, { toValue: -10, duration: 1800, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.Text
      style={[
        { position: 'absolute', fontSize: size, color },
        style,
        { opacity: opacityAnim, transform: [{ translateY: floatAnim }] },
      ]}
    >
      ★
    </Animated.Text>
  );
};

const BadgeTile = ({ icon, bgColor, style, delay = 0 }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(bounceAnim, { toValue: -9, duration: 1600, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bounceAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '8deg'],
  });

  return (
    <Animated.View
      style={[
        styles.badgeTile,
        { backgroundColor: bgColor },
        style,
        { transform: [{ translateY: bounceAnim }, { rotate }] },
      ]}
    >
      <Text style={styles.badgeIcon}>{icon}</Text>
    </Animated.View>
  );
};

const FloatChar = ({ char, color, style, delay = 0, fontSize = 58 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(floatAnim, { toValue: -7, duration: 1700, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.Text
      style={[
        {
          position: 'absolute',
          fontSize,
          color,
          fontWeight: '900',
          textShadowColor: 'rgba(0,0,0,0.13)',
          textShadowOffset: { width: 2, height: 4 },
          textShadowRadius: 7,
          transform: [{ translateY: floatAnim }],
        },
        style,
      ]}
    >
      {char}
    </Animated.Text>
  );
};

export default function FiveHundredPapers({ navigation }) {
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeInAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideUpAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(buttonScaleAnim, { toValue: 0.95, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.spring(buttonScaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  const handleStart = () => {
    if (navigation) navigation.navigate('FiveHundredPaperMenu');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F0FF" />

      <LinearGradient
        colors={['#E4EEFF', '#EEF5FF', '#E8F4F0']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SparkDot style={{ top: height * 0.08, left: width * 0.07 }} delay={0} color="#B5C8FF" />
      <SparkDot style={{ top: height * 0.12, right: width * 0.08 }} delay={400} color="#A0D9C8" />
      <SparkDot style={{ top: height * 0.21, left: width * 0.14 }} delay={200} color="#B5C8FF" />
      <SparkDot style={{ top: height * 0.63, left: width * 0.05 }} delay={600} color="#A0D9C8" />
      <SparkDot style={{ top: height * 0.71, right: width * 0.07 }} delay={300} color="#B5C8FF" />
      <SparkDot style={{ top: height * 0.80, left: width * 0.18 }} delay={100} color="#A0D9C8" />

      <FloatingStar style={{ top: height * 0.07, left: width * 0.05 }} size={20} color="#FFD700" delay={0} />
      <FloatingStar style={{ top: height * 0.13, right: width * 0.05 }} size={13} color="#C8E0FF" delay={300} />
      <FloatingStar style={{ top: height * 0.24, left: width * 0.04 }} size={17} color="#FFD700" delay={600} />
      <FloatingStar style={{ top: height * 0.60, left: width * 0.04 }} size={22} color="#FFD700" delay={200} />
      <FloatingStar style={{ top: height * 0.68, right: width * 0.05 }} size={15} color="#FFD700" delay={500} />
      <FloatingStar style={{ top: height * 0.75, left: width * 0.09 }} size={12} color="#C8E0FF" delay={800} />
      <FloatingStar style={{ top: height * 0.82, right: width * 0.10 }} size={18} color="#FFD700" delay={100} />

      <Animated.View
        style={[styles.header, { opacity: fadeInAnim, transform: [{ translateY: slideUpAnim }] }]}
      >
        <Text style={styles.headerStarLeft}>⭐</Text>
        <Text style={styles.headerTitle}>Daily Quiz</Text>
        <Text style={styles.headerStarRight}>⭐</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.illustrationCard,
          { opacity: fadeInAnim, transform: [{ translateY: slideUpAnim }] },
        ]}
      >
        <View style={styles.bookWrapper}>
          <View style={styles.bookLeft} />
          <View style={styles.bookRight} />
          <View style={styles.bookSpine} />
          <View style={styles.bookShadow} />

          {[0, 1, 2].map((i) => (
            <View key={`ll${i}`} style={[styles.pageLine, { bottom: 40 + i * 11, left: '14%', width: '33%' }]} />
          ))}
          {[0, 1, 2].map((i) => (
            <View key={`rl${i}`} style={[styles.pageLine, { bottom: 40 + i * 11, right: '14%', width: '33%' }]} />
          ))}

          <BadgeTile icon="📋" bgColor="#5B9BF8" style={styles.tileTopLeft} delay={0} />
          <BadgeTile icon="✏️" bgColor="#F87171" style={styles.tileTopRight} delay={300} />
          <BadgeTile icon="✅" bgColor="#34D399" style={styles.tileMidRight} delay={600} />

          <FloatChar char="5" color="#3B82F6" style={styles.bigChar5} delay={100} fontSize={62} />
          <FloatChar char="0" color="#10B981" style={styles.bigChar0a} delay={400} fontSize={62} />
          <FloatChar char="0" color="#3B82F6" style={styles.bigChar0b} delay={250} fontSize={62} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.textSection,
          { opacity: fadeInAnim, transform: [{ translateY: slideUpAnim }] },
        ]}
      >
        <Text style={styles.titleText}>500 Papers Quiz</Text>
        <Text style={styles.subtitleText}>
          Challenge yourself with a new{'\n'}paper every day!
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            opacity: fadeInAnim,
            transform: [{ translateY: slideUpAnim }, { scale: buttonScaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleStart}
        >
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.startButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.startButtonText}>Start</Text>
            <View style={styles.arrowCircle}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F0FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 26,
    marginTop: -20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A6E',
    letterSpacing: 0.3,
    marginHorizontal: 6,
  },
  headerStarLeft: { fontSize: 20 },
  headerStarRight: { fontSize: 20 },
  illustrationCard: {
    width: width * 0.72,
    height: width * 0.72,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  bookWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bookLeft: {
    position: 'absolute',
    bottom: 8,
    left: '8%',
    width: '42%',
    height: '38%',
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 6,
    transform: [{ skewY: '-2deg' }],
  },
  bookRight: {
    position: 'absolute',
    bottom: 8,
    right: '8%',
    width: '42%',
    height: '38%',
    backgroundColor: '#60A5FA',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 6,
    transform: [{ skewY: '2deg' }],
  },
  bookSpine: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: '5%',
    height: '37%',
    backgroundColor: '#1D4ED8',
    borderRadius: 3,
  },
  bookShadow: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: '85%',
    height: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderRadius: 50,
  },
  pageLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  badgeTile: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  badgeIcon: { fontSize: 22 },
  tileTopLeft: {
    top: '10%',
    left: '6%',
    transform: [{ rotate: '-14deg' }],
  },
  tileTopRight: {
    top: '5%',
    right: '10%',
    transform: [{ rotate: '12deg' }],
  },
  tileMidRight: {
    top: '33%',
    right: '4%',
    transform: [{ rotate: '7deg' }],
  },
  bigChar5: { top: '20%', left: '14%' },
  bigChar0a: { top: '17%', left: '38%' },
  bigChar0b: { top: '20%', right: '12%' },
  sparkDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E3A6E',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subtitleText: {
    fontSize: 14.5,
    color: '#6B87A8',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  buttonWrapper: { width: width * 0.55 },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 50,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    gap: 10,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
});