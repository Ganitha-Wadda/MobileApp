import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CrossWebView             from "../components/CrossWebView";
import { useEnrollmentStatus }  from "../app/features/enrollmentApi";
import { EnrollmentModal }      from "../components/EnrollmentGate";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");
const BOTTOM_BAR_HEIGHT = 82;

// First lesson is always the free demo — mark it clearly
const LESSONS = [
  { id: "1", title: "Chakkre (part - 1) — FREE DEMO", lessonId: "1.1", videoId: "-VJWCNwFN60", activityDone: false, isDemo: true  },
  { id: "2", title: "Chakkre (part - 2)",              lessonId: "1.2", videoId: "U_hdOu5L50o", activityDone: false, isDemo: false },
  { id: "3", title: "Chakkre (part - 3)",              lessonId: "1.3", videoId: "HnwwynXxnBg", activityDone: false, isDemo: false },
  { id: "4", title: "Chakkre (part - 4)",              lessonId: "1.4", videoId: "wXE8l4pyJ5E", activityDone: false, isDemo: false },
  { id: "5", title: "Chakkre (part - 5)",              lessonId: "1.5", videoId: "-VJWCNwFN60", activityDone: false, isDemo: false },
];

function buildYoutubeHtml(videoId = "") {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>
          html, body { margin:0; padding:0; width:100%; height:100%; background:#000; overflow:hidden; }
          .wrap { width:100%; height:100%; background:#000; display:flex; align-items:center; justify-content:center; }
          iframe { width:100%; height:100%; border:0; background:#000; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&controls=1&rel=0&modestbranding=1"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
          ></iframe>
        </div>
      </body>
    </html>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lock overlay — shown on non-demo videos when not approved
// ─────────────────────────────────────────────────────────────────────────────

function LockOverlay({ onEnroll }) {
  return (
    <View style={ls.container}>
      <Text style={ls.lockEmoji}>🔒</Text>
      <Text style={ls.title}>Enrollment Required</Text>
      <Text style={ls.sub}>
        Enroll and get admin approval to unlock all video lessons.
      </Text>
      <TouchableOpacity style={ls.btn} onPress={onEnroll} activeOpacity={0.85}>
        <Text style={ls.btnText}>Enroll Now  ✦</Text>
      </TouchableOpacity>
      <View style={ls.demoHint}>
        <Text style={ls.demoHintText}>
          ↑  Scroll back to watch the FREE DEMO lesson
        </Text>
      </View>
    </View>
  );
}

const ls = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0a3c",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  lockEmoji: { fontSize: 56, marginBottom: 16 },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#EDE9FE",
    marginBottom: 10,
    textAlign: "center",
  },
  sub: {
    fontSize: 13,
    color: "#A78BFA",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600",
    marginBottom: 28,
  },
  btn: {
    backgroundColor: "#7C3AED",
    borderRadius: 50,
    paddingHorizontal: 36,
    paddingVertical: 13,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.55,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 8,
  },
  btnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", letterSpacing: 0.4 },
  demoHint: {
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "rgba(109,40,217,0.25)",
    borderRadius: 14,
  },
  demoHintText: {
    color: "#C4B5FD",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// VideoCard
// ─────────────────────────────────────────────────────────────────────────────

const VideoCard = React.memo(
  ({
    item,
    isActive,
    isApproved,
    onNextVideo,
    onActivity,
    onEnroll,
    activityDone,
    pageHeight,
    screenWidth,
  }) => {
    const videoAreaHeight = pageHeight - BOTTOM_BAR_HEIGHT;
    const isLocked = !item.isDemo && !isApproved;

    return (
      <View style={[vcs.cardContainer, { width: screenWidth, height: pageHeight }]}>
        <View style={[vcs.videoArea, { width: screenWidth, height: videoAreaHeight }]}>

          {/* Video / lock overlay / inactive placeholder */}
          {isLocked ? (
            <LockOverlay onEnroll={onEnroll} />
          ) : isActive ? (
            <CrossWebView
              source={{ html: buildYoutubeHtml(item.videoId) }}
              style={vcs.webview}
            />
          ) : (
            <View style={vcs.blackScreen} />
          )}

          {/* Title bar */}
          {!isLocked && (
            <View pointerEvents="none" style={vcs.titleBar}>
              <Text style={vcs.sparkleDot}>• </Text>
              {item.isDemo && (
                <View style={vcs.demoPill}>
                  <Text style={vcs.demoPillText}>FREE DEMO</Text>
                </View>
              )}
              <Text style={vcs.star}>⭐</Text>
              <Text numberOfLines={1} style={vcs.titleText}>
                {item.title}
              </Text>
              <Text style={vcs.star}>⭐</Text>
              <Text style={vcs.sparkleDot}> •</Text>
            </View>
          )}
        </View>

        {/* Bottom buttons — only shown when not locked */}
        {!isLocked && (
          <View style={vcs.bottomButtons}>
            <TouchableOpacity
              style={vcs.btnNext}
              onPress={onNextVideo}
              activeOpacity={0.85}
            >
              <View style={vcs.btnIconCircle}>
                <View style={vcs.playTriangleSmall} />
              </View>
              <Text style={vcs.btnText}>Next Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[vcs.btnActivity, activityDone && vcs.btnActivityDone]}
              onPress={onActivity}
              activeOpacity={0.85}
            >
              <Text style={vcs.activityIcon}>📖</Text>
              <Text style={vcs.btnText}>{activityDone ? "Done ✓" : "Activity"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Locked bottom strip */}
        {isLocked && (
          <View style={vcs.lockedBottom}>
            <Text style={vcs.lockedBottomText}>🔒  Locked — enroll to access</Text>
          </View>
        )}
      </View>
    );
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

export default function ShortVideoScreen({ navigation }) {
  const flatListRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();

  const [activeIndex, setActiveIndex] = useState(0);
  const [lessons,     setLessons]     = useState(LESSONS);
  const [pageHeight,  setPageHeight]  = useState(WINDOW_HEIGHT);
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);

  const { isApproved } = useEnrollmentStatus();

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  const handleNextVideo = useCallback(
    (currentIndex) => {
      const next = currentIndex + 1;
      if (next < lessons.length) {
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
      }
    },
    [lessons.length]
  );

  const handleActivity = useCallback(
    (item) => {
      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === item.id ? { ...lesson, activityDone: true } : lesson
        )
      );
      navigation.navigate("activitytemplate1", {
        title:    item.title,
        lessonId: item.lessonId,
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <VideoCard
        item={item}
        isActive={index === activeIndex}
        isApproved={isApproved}
        activityDone={item.activityDone}
        pageHeight={pageHeight}
        screenWidth={screenWidth}
        onNextVideo={() => handleNextVideo(index)}
        onActivity={() => handleActivity(item)}
        onEnroll={() => setEnrollModalVisible(true)}
      />
    ),
    [activeIndex, isApproved, pageHeight, screenWidth, handleNextVideo, handleActivity]
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: pageHeight,
      offset: pageHeight * index,
      index,
    }),
    [pageHeight]
  );

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={vcs.safeArea}
      onLayout={(event) => {
        const h = event.nativeEvent.layout.height;
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

      {/* Enrollment modal — opens when locked video's Enroll button is tapped */}
      <EnrollmentModal
        visible={enrollModalVisible}
        onClose={() => setEnrollModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const PURPLE    = "#4d00d1";
const BTN_HEIGHT = 54;

const vcs = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#5e1cce" },

  cardContainer: { backgroundColor: "#5e1cce" },

  videoArea: { backgroundColor: "#5e1cce", overflow: "hidden" },

  webview:     { flex: 1, backgroundColor: "#5e1cce" },
  blackScreen: { flex: 1, backgroundColor: "#5e1cce" },

  titleBar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    paddingHorizontal: 14,
    backgroundColor: "#5e1cce",
  },

  demoPill: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 6,
  },
  demoPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#92400E",
    letterSpacing: 0.4,
  },

  titleText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginHorizontal: 6,
    textAlign: "center",
  },

  star:       { fontSize: 15 },
  sparkleDot: { color: "#b8a8f8", fontSize: 18, fontWeight: "700" },

  bottomButtons: {
    width: "100%",
    height: BOTTOM_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#5e1cce",
    gap: 12,
  },

  lockedBottom: {
    width: "100%",
    height: BOTTOM_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a0a3c",
  },
  lockedBottomText: {
    color: "#A78BFA",
    fontSize: 13,
    fontWeight: "700",
  },

  btnNext: {
    flex: 1, height: BTN_HEIGHT,
    backgroundColor: PURPLE,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  btnActivity: {
    flex: 1, height: BTN_HEIGHT,
    backgroundColor: PURPLE,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  btnActivityDone: { backgroundColor: "#2ecc71" },

  btnIconCircle: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  playTriangleSmall: {
    width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 10,
    borderTopColor: "transparent", borderBottomColor: "transparent",
    borderLeftColor: "#fff",
    marginLeft: 2,
  },

  activityIcon: { fontSize: 18, marginRight: 8 },

  btnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },
});