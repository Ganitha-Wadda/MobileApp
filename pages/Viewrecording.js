import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Video player height: 16:9 landscape ratio ──
const VIDEO_HEIGHT = Math.round((SCREEN_WIDTH - 32) * (9 / 16));

// ── Sample recordings data ──
const RECORDINGS = [
  {
    id: "1",
    title: "Recordings - 1",
    subtitle: "Introduction to Fractions",
    duration: "12:45",
    date: "15 May 2024",
    videoId: "dQw4w9WgXcQ",
  },
  
];

// ── Build self-contained YouTube iframe HTML ──
const buildYouTubeHTML = (videoId) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      width: 100%;
      height: 100%;
      background: #000;
      overflow: hidden;
    }

    #container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000;
    }

    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
      border: none;
    }

    #yt-player {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  </style>
</head>

<body>
  <div id="container">
    <div id="yt-player"></div>
  </div>

  <script>
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.getElementsByTagName('head')[0].appendChild(tag);

    var player;

    function onYouTubeIframeAPIReady() {
      player = new YT.Player('yt-player', {
        videoId: '${videoId}',
        playerVars: {
          autoplay: 0,
          playsinline: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 1
        },
        events: {
          onError: function(e) {
            if (e.data === 150 || e.data === 151 || e.data === 5) {
              document.getElementById('container').innerHTML =
                '<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&controls=1&modestbranding=1&rel=0" allow="autoplay; fullscreen; encrypted-media" allowfullscreen frameborder="0"></iframe>';
            }
          }
        }
      });
    }
  </script>
</body>
</html>
`;

// ── Recording List Item ──
const RecordingItem = ({ item, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.recordingItem, isActive && styles.recordingItemActive]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
      <View style={styles.videoIconOuter}>
        <View style={styles.camBody} />
        <View style={styles.camLens} />
        <View style={styles.camTri} />
      </View>
    </View>

    <View style={styles.recordingTextWrap}>
      <Text
        style={[styles.recordingTitle, isActive && styles.recordingTitleActive]}
      >
        {item.title}
      </Text>

      <Text style={styles.recordingSubtitle}>{item.subtitle}</Text>

      <Text style={styles.recordingMeta}>
        {item.duration} · {item.date}
      </Text>
    </View>

    {isActive && <View style={styles.activeDot} />}
  </TouchableOpacity>
);

// ── Main Screen ──
export default function ViewRecording({ route }) {
  const selectedRecordingId = route?.params?.recordingId
    ? String(route.params.recordingId)
    : RECORDINGS[0].id;

  const [activeId, setActiveId] = useState(selectedRecordingId);

  useEffect(() => {
    if (route?.params?.recordingId) {
      setActiveId(String(route.params.recordingId));
    }
  }, [route?.params?.recordingId]);

  const activeRecording =
    RECORDINGS.find((recording) => recording.id === activeId) || RECORDINGS[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.headerBar}>
        <Text style={styles.pageTitle}>Recordings</Text>
      </View>

      <View style={styles.playerWrapper}>
        <View style={styles.playerContainer}>
          <WebView
            key={activeId}
            style={styles.webview}
            originWhitelist={["*"]}
            source={{
              html: buildYouTubeHTML(activeRecording.videoId),
              baseUrl: "https://www.youtube.com",
            }}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            androidLayerType="hardware"
            scrollEnabled={false}
            userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36"
          />
        </View>
      </View>

      <FlatList
        data={RECORDINGS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <RecordingItem
            item={item}
            isActive={item.id === activeId}
            onPress={() => setActiveId(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f0f1a",
    letterSpacing: -0.4,
    fontFamily: "System",
    textAlign: "center",
  },

  playerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  playerContainer: {
    width: "100%",
    height: VIDEO_HEIGHT,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },

  webview: {
    flex: 1,
    backgroundColor: "#000",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },

  separator: {
    height: 1,
    backgroundColor: "#f0f0f5",
    marginLeft: 76,
  },

  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
  },

  recordingItemActive: {
    backgroundColor: "#f3f0ff",
    paddingHorizontal: 10,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#eeeeff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  iconBoxActive: {
    backgroundColor: "#ddd8ff",
  },

  videoIconOuter: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  camBody: {
    width: 20,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#6c5ce7",
    position: "absolute",
    left: 0,
  },

  camLens: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4a3cc7",
    position: "absolute",
    left: 5,
    top: 3,
  },

  camTri: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#6c5ce7",
    position: "absolute",
    right: 0,
  },

  recordingTextWrap: {
    flex: 1,
  },

  recordingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f0f1a",
    marginBottom: 2,
  },

  recordingTitleActive: {
    color: "#6c5ce7",
  },

  recordingSubtitle: {
    fontSize: 13,
    color: "#555577",
    fontWeight: "500",
    marginBottom: 2,
  },

  recordingMeta: {
    fontSize: 12,
    color: "#9999bb",
    fontWeight: "400",
  },

  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6c5ce7",
    marginLeft: 8,
  },
});