import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const BOTTOM_BAR_HEIGHT = 82;

const LESSONS = [
  { id: '1', title: 'Chakkre (part - 1)', lessonId: '1.1', videoId: '-VJWCNwFN60', activityDone: false },
  { id: '2', title: 'Chakkre (part - 2)', lessonId: '1.2', videoId: 'U_hdOu5L50o', activityDone: false },
  { id: '3', title: 'Chakkre (part - 3)', lessonId: '1.3', videoId: 'HnwwynXxnBg', activityDone: false },
  { id: '4', title: 'Chakkre (part - 4)', lessonId: '1.4', videoId: 'wXE8l4pyJ5E', activityDone: false },
  { id: '5', title: 'Chakkre (part - 5)', lessonId: '1.5', videoId: '-VJWCNwFN60', activityDone: false },
];

const getYouTubeThumbnail = (videoId) =>
  videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : 'https://picsum.photos/seed/yt/400/700';

const buildPlayerHTML = (videoId, width, height) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background: #000;
      overflow: hidden;
    }
    #container {
      position: fixed;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    iframe {
      position: absolute;
      top: 0; left: 0;
      width: 100% !important;
      height: 100% !important;
      border: none;
    }
    #yt-player {
      position: absolute;
      top: 0; left: 0;
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
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('yt-player', {
        videoId: '${videoId}',
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: function(e) { e.target.playVideo(); },
          onError: function(e) {
            if (e.data === 150 || e.data === 151 || e.data === 5) {
              loadShortsFallback();
            }
          }
        }
      });
    }

    function loadShortsFallback() {
      var container = document.getElementById('container');
      container.innerHTML =
        '<iframe ' +
          'src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&controls=1&modestbranding=1&rel=0&showinfo=0" ' +
          'allow="autoplay; fullscreen; encrypted-media" ' +
          'allowfullscreen ' +
          'frameborder="0">' +
        '</iframe>';
    }
  </script>
</body>
</html>
`;

// ─────────────────────────────────────────────
// VideoCard
// ─────────────────────────────────────────────
const VideoCard = React.memo(({
  item,
  isActive,
  onNextVideo,
  onActivity,
  activityDone,
  pageHeight,
  screenWidth,
}) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const webViewRef = useRef(null);

  const videoAreaHeight = pageHeight - BOTTOM_BAR_HEIGHT;
  const thumbnail = getYouTubeThumbnail(item.videoId);

  useEffect(() => {
    if (!isActive) setShowPlayer(false);
  }, [isActive]);

  const htmlContent = buildPlayerHTML(item.videoId, screenWidth, videoAreaHeight);

  return (
    <View style={[styles.cardContainer, { height: pageHeight, width: screenWidth }]}>
      {/* ── Full-bleed video area ── */}
      <View style={{ width: screenWidth, height: videoAreaHeight, backgroundColor: '#000', overflow: 'hidden' }}>
        {isActive && showPlayer ? (
          <WebView
            ref={webViewRef}
            style={styles.webview}
            originWhitelist={['*']}
            source={{ html: htmlContent, baseUrl: 'https://www.youtube.com' }}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            androidLayerType="hardware"
            androidHardwareAccelerationDisabled={false}
            scrollEnabled={false}
            userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36"
          />
        ) : (
          <ImageBackground
            source={{ uri: thumbnail }}
            style={styles.thumbnailFill}
            resizeMode="cover"
          >
            <View style={styles.thumbnailDark} />
            <TouchableOpacity style={styles.playOverlay} onPress={() => setShowPlayer(true)} activeOpacity={0.9}>
              <View style={styles.playCircle}>
                <View style={styles.playTriangle} />
              </View>
              <Text style={styles.tapToWatch}>Tap to watch</Text>
            </TouchableOpacity>
            <View pointerEvents="none" style={styles.topGradient} />
            <View pointerEvents="none" style={styles.titleBar}>
              <Text style={styles.sparkleDot}>• </Text>
              <Text style={styles.star}>⭐</Text>
              <Text numberOfLines={1} style={styles.titleText}>{item.title}</Text>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.sparkleDot}> •</Text>
            </View>
          </ImageBackground>
        )}
      </View>

      {/* ── Bottom buttons ── */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.btnNext} onPress={onNextVideo} activeOpacity={0.85}>
          <View style={styles.btnIconCircle}>
            <View style={styles.playTriangleSmall} />
          </View>
          <Text style={styles.btnText}>Next Video</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnActivity, activityDone && styles.btnActivityDone]}
          onPress={onActivity}
          activeOpacity={0.85}
        >
          <Text style={styles.activityIcon}>📖</Text>
          <Text style={styles.btnText}>{activityDone ? 'Done ✓' : 'Activity'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
export default function ShortVideoScreen({ navigation }) {
  const flatListRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();

  const [activeIndex, setActiveIndex] = useState(0);
  const [lessons, setLessons] = useState(LESSONS);
  const [pageHeight, setPageHeight] = useState(WINDOW_HEIGHT);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const handleNextVideo = useCallback((currentIndex) => {
    const next = currentIndex + 1;
    if (next < lessons.length) {
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    }
  }, [lessons.length]);

  // ✅ Navigate to ActivityTemplate1 when Activity button is tapped
  const handleActivity = useCallback((item) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, activityDone: true } : l))
    );
    navigation.navigate('activitytemplate1', {
      title: item.title,
      lessonId: item.lessonId,
    });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item, index }) => (
      <VideoCard
        item={item}
        isActive={index === activeIndex}
        activityDone={item.activityDone}
        pageHeight={pageHeight}
        screenWidth={screenWidth}
        onNextVideo={() => handleNextVideo(index)}
        onActivity={() => handleActivity(item)}
      />
    ),
    [activeIndex, pageHeight, screenWidth, handleNextVideo, handleActivity]
  );

  const getItemLayout = useCallback(
    (_, index) => ({ length: pageHeight, offset: pageHeight * index, index }),
    [pageHeight]
  );

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={styles.safeArea}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && h !== pageHeight) setPageHeight(h);
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <FlatList
        ref={flatListRef}
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={pageHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        removeClippedSubviews={false}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
      />
    </SafeAreaView>
  );
}

const PURPLE = '#5B4CE8';
const BTN_HEIGHT = 54;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  cardContainer: { backgroundColor: '#000', flexDirection: 'column' },
  webview: { flex: 1, backgroundColor: '#000' },

  thumbnailFill: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#111',
  },
  thumbnailDark: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 95,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  titleBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingHorizontal: 14,
  },
  titleText: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginHorizontal: 6,
    textAlign: 'center',
  },
  star: { fontSize: 15 },
  sparkleDot: { color: '#b8a8f8', fontSize: 18, fontWeight: '700' },

  playOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: PURPLE,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
    marginBottom: 14,
  },
  playTriangle: {
    width: 0, height: 0,
    borderTopWidth: 14, borderBottomWidth: 14, borderLeftWidth: 24,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderLeftColor: '#fff',
    marginLeft: 6,
  },
  tapToWatch: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13, fontWeight: '600', letterSpacing: 0.5,
  },

  bottomButtons: {
    width: '100%',
    height: BOTTOM_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#0d0d0d',
    gap: 12,
  },
  btnNext: {
    flex: 1, height: BTN_HEIGHT,
    backgroundColor: PURPLE, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  btnActivity: {
    flex: 1, height: BTN_HEIGHT,
    backgroundColor: PURPLE, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  btnActivityDone: { backgroundColor: '#2ecc71' },
  btnIconCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  playTriangleSmall: {
    width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 10,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderLeftColor: '#fff',
    marginLeft: 2,
  },
  activityIcon: { fontSize: 18, marginRight: 8 },
  btnText: {
    color: '#FFFFFF', fontSize: 15,
    fontWeight: '700', letterSpacing: 0.2,
  },
});