import React, { useRef, useState, useCallback } from "react";
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

import CrossWebView from "../components/CrossWebView";
import { useEnrollmentStatus } from "../app/features/enrollmentApi";
import { EnrollmentModal } from "../components/EnrollmentGate";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");
const BOTTOM_BAR_HEIGHT = 82;

const LESSONS = [
  { id: "1", title: "Chakkre (part - 1) — FREE DEMO", lessonId: "1.1", videoId: "-VJWCNwFN60", activityDone: false, isDemo: true },
  { id: "2", title: "Chakkre (part - 2)", lessonId: "1.2", videoId: "U_hdOu5L50o", activityDone: false, isDemo: false },
  { id: "3", title: "Chakkre (part - 3)", lessonId: "1.3", videoId: "HnwwynXxnBg", activityDone: false, isDemo: false },
  { id: "4", title: "Chakkre (part - 4)", lessonId: "1.4", videoId: "wXE8l4pyJ5E", activityDone: false, isDemo: false },
  { id: "5", title: "Chakkre (part - 5)", lessonId: "1.5", videoId: "-VJWCNwFN60", activityDone: false, isDemo: false },
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

function LockOverlay({ onEnroll }) {
  return (
    <View style={ls.container}>
      <Text style={ls.lockEmoji}>🔒</Text>
      <Text style={ls.title}>Enrollment Required</Text>
      <Text style={ls.sub}>
        Enroll and get admin approval to unlock all video lessons.
      </Text>
      <TouchableOpacity style={ls.btn} onPress={onEnroll} activeOpacity={0.85}>
        <Text style={ls.btnText}>Enroll Now ✦</Text>
      </TouchableOpacity>
    </View>
  );
}

function PlayOverlay({ onPlay }) {
  return (
    <TouchableOpacity style={vcs.playOverlay} onPress={onPlay} activeOpacity={0.85}>
      <View style={vcs.bigPlayCircle}>
        <View style={vcs.bigPlayTriangle} />
      </View>
      <Text style={vcs.tapPlayText}>Tap to Play Video</Text>
    </TouchableOpacity>
  );
}

const VideoCard = React.memo(
  ({
    item,
    index,
    isActive,
    isApproved,
    playingIndex,
    onPlay,
    onNextVideo,
    onActivity,
    onEnroll,
    activityDone,
    pageHeight,
    screenWidth,
  }) => {
    const videoAreaHeight = pageHeight - BOTTOM_BAR_HEIGHT;
    const isLocked = !item.isDemo && !isApproved;
    const isPlaying = isActive && playingIndex === index;

    return (
      <View style={[vcs.cardContainer, { width: screenWidth, height: pageHeight }]}>
        <View style={[vcs.videoArea, { width: screenWidth, height: videoAreaHeight }]}>
          {isLocked ? (
            <LockOverlay onEnroll={onEnroll} />
          ) : isPlaying ? (
            <CrossWebView
              key={`video-${item.id}`}
              source={{ html: buildYoutubeHtml(item.videoId) }}
              style={vcs.webview}
            />
          ) : (
            <PlayOverlay onPlay={() => onPlay(index)} />
          )}

          {!isLocked && (
            <View pointerEvents="none" style={vcs.titleBar}>
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
            </View>
          )}
        </View>

        {!isLocked && (
          <View style={vcs.bottomButtons}>
            <TouchableOpacity
              style={vcs.btnNext}
              onPress={() => onNextVideo(index)}
              activeOpacity={0.85}
            >
              <View style={vcs.btnIconCircle}>
                <View style={vcs.playTriangleSmall} />
              </View>
              <Text style={vcs.btnText}>Next Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[vcs.btnActivity, activityDone && vcs.btnActivityDone]}
              onPress={() => onActivity(item)}
              activeOpacity={0.85}
            >
              <Text style={vcs.activityIcon}>📖</Text>
              <Text style={vcs.btnText}>
                {activityDone ? "Done ✓" : "Activity"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isLocked && (
          <View style={vcs.lockedBottom}>
            <Text style={vcs.lockedBottomText}>🔒 Locked — enroll to access</Text>
          </View>
        )}
      </View>
    );
  }
);

export default function ShortVideoScreen({ navigation }) {
  const flatListRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();

  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [lessons, setLessons] = useState(LESSONS);
  const [pageHeight, setPageHeight] = useState(WINDOW_HEIGHT);
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);

  const { isApproved } = useEnrollmentStatus();

  const stopVideo = useCallback(() => {
    setPlayingIndex(null);
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
      setPlayingIndex(null);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const handlePlay = useCallback((index) => {
    setPlayingIndex(index);
  }, []);

  const handleNextVideo = useCallback(
    (currentIndex) => {
      stopVideo();

      const next = currentIndex + 1;
      if (next < lessons.length) {
        setActiveIndex(next);
        flatListRef.current?.scrollToIndex({
          index: next,
          animated: true,
        });
      }
    },
    [lessons.length, stopVideo]
  );

  const handleActivity = useCallback(
    (item) => {
      stopVideo();

      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === item.id
            ? { ...lesson, activityDone: true }
            : lesson
        )
      );

      navigation.navigate("activitytemplate1", {
        title: item.title,
        lessonId: item.lessonId,
      });
    },
    [navigation, stopVideo]
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <VideoCard
        item={item}
        index={index}
        isActive={index === activeIndex}
        isApproved={isApproved}
        playingIndex={playingIndex}
        activityDone={item.activityDone}
        pageHeight={pageHeight}
        screenWidth={screenWidth}
        onPlay={handlePlay}
        onNextVideo={handleNextVideo}
        onActivity={handleActivity}
        onEnroll={() => {
          stopVideo();
          setEnrollModalVisible(true);
        }}
      />
    ),
    [
      activeIndex,
      isApproved,
      playingIndex,
      pageHeight,
      screenWidth,
      handlePlay,
      handleNextVideo,
      handleActivity,
      stopVideo,
    ]
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
      <StatusBar barStyle="light-content" backgroundColor="#5e1cce" />

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

      <EnrollmentModal
        visible={enrollModalVisible}
        onClose={() => {
          stopVideo();
          setEnrollModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const PURPLE = "#4d00d1";
const BTN_HEIGHT = 54;

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
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});

const vcs = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#5e1cce",
  },

  cardContainer: {
    backgroundColor: "#5e1cce",
  },

  videoArea: {
    backgroundColor: "#5e1cce",
    overflow: "hidden",
  },

  webview: {
    flex: 1,
    backgroundColor: "#000",
  },

  playOverlay: {
    flex: 1,
    backgroundColor: "#1a0a3c",
    alignItems: "center",
    justifyContent: "center",
  },

  bigPlayCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  bigPlayTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 16,
    borderBottomWidth: 16,
    borderLeftWidth: 24,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#fff",
    marginLeft: 6,
  },

  tapPlayText: {
    color: "#EDE9FE",
    fontSize: 15,
    fontWeight: "800",
  },

  titleBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
  },

  titleText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 6,
    textAlign: "center",
  },

  star: {
    fontSize: 15,
  },

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
    flex: 1,
    height: BTN_HEIGHT,
    backgroundColor: PURPLE,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  btnActivity: {
    flex: 1,
    height: BTN_HEIGHT,
    backgroundColor: PURPLE,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  btnActivityDone: {
    backgroundColor: "#2ecc71",
  },

  btnIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  playTriangleSmall: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#fff",
    marginLeft: 2,
  },

  activityIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});