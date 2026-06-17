import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
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
import useT from "../app/i18n/useT";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");
const BOTTOM_BAR_HEIGHT = 82;

function extractYoutubeVideoId(input = "") {
  const value = String(input || "").trim();

  if (!value) return "";

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*&v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

function isDirectVideoUrl(input = "") {
  const value = String(input || "").toLowerCase().split("?")[0];

  return (
    value.endsWith(".mp4") ||
    value.endsWith(".mov") ||
    value.endsWith(".m4v") ||
    value.endsWith(".webm") ||
    value.endsWith(".ogg")
  );
}

function escapeHtml(value = "") {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildVideoHtml(source = "") {
  const cleanSource = String(source || "").trim();
  const youtubeId = extractYoutubeVideoId(cleanSource);

  if (youtubeId) {
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
              src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&controls=1&rel=0&modestbranding=1"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowfullscreen
            ></iframe>
          </div>
        </body>
      </html>
    `;
  }

  if (isDirectVideoUrl(cleanSource)) {
    const safeSource = escapeHtml(cleanSource);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <style>
            html, body { margin:0; padding:0; width:100%; height:100%; background:#000; overflow:hidden; }
            .wrap { width:100%; height:100%; background:#000; display:flex; align-items:center; justify-content:center; }
            video { width:100%; height:100%; background:#000; object-fit:contain; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <video src="${safeSource}" controls autoplay playsinline></video>
          </div>
        </body>
      </html>
    `;
  }

  const safeSource = escapeHtml(cleanSource);

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
            src="${safeSource}"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
          ></iframe>
        </div>
      </body>
    </html>
  `;
}

function normalizeLessonsFromRoute(routeParams = {}) {
  const links = Array.isArray(routeParams?.links)
    ? routeParams.links.filter((link) => String(link || "").trim())
    : [];

  const shortLessonId = routeParams?.shortLessonId || routeParams?.lessonId || "";
  const subLessonTitle = routeParams?.subLessonTitle || "Short Sub Lesson";
  const subLessonId =
    routeParams?.shortSubLessonId || routeParams?.subLessonId || "short-sub-lesson";
  const lessonNumber = routeParams?.lessonNumber || 1;

  if (links.length === 0) {
    return [];
  }

  return links.map((link, index) => ({
    id: `${subLessonId}-${index + 1}`,
    title:
      links.length === 1
        ? subLessonTitle
        : `${subLessonTitle} - Video ${index + 1}`,
    lessonId: `${lessonNumber}.${index + 1}`,
    videoSource: String(link || "").trim(),
    videoIndex: index,
    activityDone: false,
    isDemo: index === 0,
    shortLessonId,
    shortSubLessonId: subLessonId,
  }));
}

function LockOverlay({ onEnroll, t }) {
  return (
    <View style={ls.container}>
      <Text style={ls.lockEmoji}>🔒</Text>
      <Text style={ls.title}>{t("enrollmentRequired")}</Text>
      <Text style={ls.sub}>{t("enrollUnlockVideos")}</Text>
      <TouchableOpacity style={ls.btn} onPress={onEnroll} activeOpacity={0.85}>
        <Text style={ls.btnText}>{t("enrollNow")}</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyVideoOverlay({ title }) {
  return (
    <View style={vcs.playOverlay}>
      <Text style={vcs.tapPlayText}>
        {title || "No video link found for this sub lesson"}
      </Text>
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
    t,
  }) => {
    const videoAreaHeight = pageHeight - BOTTOM_BAR_HEIGHT;
    const isLocked = !item.isDemo && !isApproved;
    const isPlaying = isActive && playingIndex === index;

    return (
      <View style={[vcs.cardContainer, { width: screenWidth, height: pageHeight }]}>
        <View style={[vcs.videoArea, { width: screenWidth, height: videoAreaHeight }]}>
          {isLocked ? (
            <LockOverlay onEnroll={onEnroll} t={t} />
          ) : isPlaying ? (
            <CrossWebView
              key={`video-${item.id}`}
              source={{ html: buildVideoHtml(item.videoSource) }}
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
              <Text style={vcs.btnText}>{t("nextVideo")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[vcs.btnActivity, activityDone && vcs.btnActivityDone]}
              onPress={() => onActivity(item, index)}
              activeOpacity={0.85}
            >
              <Text style={vcs.activityIcon}>📖</Text>
              <Text style={vcs.btnText}>
                {activityDone ? t("done") : t("activity")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isLocked && (
          <View style={vcs.lockedBottom}>
            <Text style={vcs.lockedBottomText}>{t("locked")}</Text>
          </View>
        )}
      </View>
    );
  }
);

export default function ShortVideoScreen({ navigation, route }) {
  const { t } = useT();
  const flatListRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();

  const routeKey = useMemo(
    () =>
      JSON.stringify({
        shortLessonId: route?.params?.shortLessonId || route?.params?.lessonId || "",
        shortSubLessonId: route?.params?.shortSubLessonId || route?.params?.subLessonId || "",
        links: route?.params?.links || [],
      }),
    [
      route?.params?.shortLessonId,
      route?.params?.lessonId,
      route?.params?.shortSubLessonId,
      route?.params?.subLessonId,
      route?.params?.links,
    ]
  );

  const routeLessons = useMemo(
    () => normalizeLessonsFromRoute(route?.params || {}),
    [routeKey]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [lessons, setLessons] = useState(routeLessons);
  const [pageHeight, setPageHeight] = useState(WINDOW_HEIGHT);
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);

  const { isApproved } = useEnrollmentStatus();

  useEffect(() => {
    setLessons(routeLessons);
    setActiveIndex(0);
    setPlayingIndex(null);
  }, [routeLessons]);

  useEffect(() => {
    const completedVideoId = route?.params?.completedVideoId;

    if (!completedVideoId) return;

    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === completedVideoId ? { ...lesson, activityDone: true } : lesson
      )
    );
  }, [route?.params?.completedVideoId]);

  useEffect(() => {
    const targetIndex = Number(route?.params?.initialVideoIndex);

    if (!Number.isInteger(targetIndex) || targetIndex < 0 || lessons.length === 0) {
      return;
    }

    const safeIndex = Math.min(targetIndex, lessons.length - 1);

    setActiveIndex(safeIndex);
    setPlayingIndex(null);

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({
        index: safeIndex,
        animated: true,
      });
    });
  }, [route?.params?.initialVideoIndex, lessons.length, pageHeight]);

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
    (item, index) => {
      stopVideo();

      const shortLessonId = route?.params?.shortLessonId || route?.params?.lessonId;
      const shortSubLessonId =
        route?.params?.shortSubLessonId || route?.params?.subLessonId;
      const nextVideoIndex = Math.min(index + 1, Math.max(lessons.length - 1, 0));
      const hasNextVideo = index + 1 < lessons.length;

      navigation.navigate("ActivityFlow", {
        shortLessonId,
        shortSubLessonId,
        title: item.title,
        subLessonTitle: route?.params?.subLessonTitle || item.title,
        videoIndex: index,
        nextVideoIndex,
        hasNextVideo,
        completedVideoId: item.id,
        returnToVideoParams: {
          subLessonId: route?.params?.subLessonId,
          shortSubLessonId,
          shortLessonId,
          lessonId: route?.params?.lessonId,
          lessonTitle: route?.params?.lessonTitle,
          subLessonTitle: route?.params?.subLessonTitle,
          lessonNumber: route?.params?.lessonNumber,
          links: route?.params?.links || [],
          shortSubLesson: route?.params?.shortSubLesson,
        },
      });
    },
    [navigation, route?.params, lessons.length, stopVideo]
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
        t={t}
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
      t,
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

      {lessons.length === 0 ? (
        <View style={[vcs.cardContainer, { width: screenWidth, height: pageHeight }]}>
          <View
            style={[
              vcs.videoArea,
              {
                width: screenWidth,
                height: pageHeight - BOTTOM_BAR_HEIGHT,
              },
            ]}
          >
            <EmptyVideoOverlay />
          </View>

          <View style={vcs.lockedBottom}>
            <Text style={vcs.lockedBottomText}>No videos</Text>
          </View>
        </View>
      ) : (
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
      )}

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
    paddingHorizontal: 24,
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
    textAlign: "center",
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
