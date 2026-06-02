import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const GAMES = [
  {
    id: 1,
    title: 'Chakkra\nWadda Racing',
    desc: 'Race, solve and win! Multiply your way to the finish line.',
    image: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400&q=80',
    // ↑ replace with your actual racing game image URL
    color: '#4FC3F7',
    route: 'ChakkraWaddaRacing',
  },
  {
    id: 2,
    title: 'Boss\nBattle',
    desc: 'Face the boss, solve math challenges and be the hero!',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80',
    // ↑ replace with your actual boss battle image URL
    color: '#7E57C2',
    route: 'BossBattle',
  },
];

const Sparkle = ({ style, color = '#A78BFA', size = 14 }) => (
  <Text style={[{ position: 'absolute', color, fontSize: size }, style]}>✦</Text>
);

const GameCard = ({ game, onPlay }) => (
  <View style={styles.card}>
    {/* left image */}
    <View style={[styles.cardImageWrap, { backgroundColor: game.color }]}>
      <Image
        source={{ uri: game.image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
    </View>

    {/* right content */}
    <View style={styles.cardContent}>
      <Sparkle style={{ top: 10, right: 16 }} color="#C4B5FD" size={12} />
      <Sparkle style={{ top: 40, right: 40 }} color="#DDD6FE" size={10} />
      <Sparkle style={{ bottom: 50, right: 20 }} color="#A78BFA" size={11} />

      <Text style={styles.cardTitle}>{game.title}</Text>

      <View style={styles.descRow}>
        <Text style={styles.descStar}>★</Text>
        <Text style={styles.descText}>{game.desc}</Text>
      </View>

      <TouchableOpacity
        style={styles.playBtn}
        onPress={() => onPlay(game.route)}
        activeOpacity={0.82}
      >
        <Text style={styles.playBtnText}>Play  ›</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function Game({ navigation }) {
  const handlePlay = (route) => {
    // navigation.navigate(route);
    console.log('Navigate to:', route);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EEFF" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── section title ─────────────────────────────────────────── */}
        <View style={styles.titleRow}>
          <Text style={{ fontSize: 18, marginRight: 6 }}>⭐</Text>
          <Text style={styles.sectionTitle}>Games</Text>
          <Text style={{ fontSize: 16, marginLeft: 6, color: '#A78BFA' }}>★</Text>
        </View>

        {/* ── game cards ────────────────────────────────────────────── */}
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} onPlay={handlePlay} />
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eae8fa',
  },

  // ── scroll ──────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50,
    flexGrow: 1,
  },

  // ── section title ────────────────────────────────────────────────────
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A3E',
    letterSpacing: 0.3,
  },

  // ── card ─────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#3D2FD9',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    height: 200,
  },
  cardImageWrap: {
    width: width * 0.42,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A3E',
    lineHeight: 26,
    marginBottom: 8,
    marginTop: 4,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginBottom: 12,
  },
  descStar: { color: '#FBBF24', fontSize: 14, marginRight: 5, marginTop: 1 },
  descText: { fontSize: 12.5, color: '#4B5563', lineHeight: 18, flex: 1 },

  // play button
  playBtn: {
    backgroundColor: '#5B4FE8',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#5B4FE8',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

});