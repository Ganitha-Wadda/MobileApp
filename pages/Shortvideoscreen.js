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
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CrossWebView from "../components/CrossWebView";
import { useEnrollmentStatus } from "../app/features/enrollmentApi";
import { EnrollmentModal } from "../components/EnrollmentGate";
import useT from "../app/i18n/useT";
import {
  useGetShortSubLessonOverviewQuery,
  useMarkShortVideoWatchedMutation,
} from "../app/features/shortcoinscountApi";

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

const getId = (item = {}) => String(item?._id || item?.id || "");

const getLinks = (subLesson = {}) => {
  const links = Array.isArray(subLesson?.links) ? subLesson.links : [];
  const cleanLinks = links.map((link) => String(link || "").trim()).filter(Boolean);
  return cleanLinks.length > 0 ? cleanLinks : [""];
};

const hasWatchedVideo = (progress = {}, videoKey = "", videoIndex = 0) => {
  const keys = Array.isArray(progress?.watchedVideoKeys)
    ? progress.watchedVideoKeys.map(String)
    : [];
  const indexes = Array.isArray(progress?.watchedVideoIndexes)
    ? progress.watchedVideoIndexes.map(Number)
    : [];

  return keys.includes(String(videoKey)) || indexes.includes(Number(videoIndex));
};

function buildUnlockedVideoFeed({ subLessons = [], shortLessonId }) {
  const feed = [];

  if (!Array.isArray(subLessons)) return feed;

  for (let subLessonIndex = 0; subLessonIndex < subLessons.length; subLessonIndex += 1) {
    const subLesson = subLessons[subLessonIndex];
    const subLessonId = getId(subLesson);
    const locked = subLesson?.isLocked || subLesson?.isUnlocked === false;

    if (locked) break;

    const links = getLinks(subLesson);
    const progress = subLesson?.progress || {};
    const subCompleted = Boolean(subLesson?.isCompleted || progress?.isCompleted);
    const lastUnlockedVideoIndex = subCompleted
      ? links.length - 1
      : Math.max(
          0,
          Math.min(
            Number(progress?.lastUnlockedVideoIndex ?? progress?.currentVideoIndex ?? 0),
            links.length - 1
          )
        );

    const includeCount = Math.max(1, Math.min(links.length, lastUnlockedVideoIndex + 1));

    for (let videoIndex = 0; videoIndex < includeCount; videoIndex += 1) {
      const videoKey = `${subLessonId}-video-${videoIndex}`;
      const watched = hasWatchedVideo(progress, videoKey, videoIndex);
      const currentProgressVideoIndex = Number(progress?.currentVideoIndex || 0);
      const needsActivitiesBeforeNext =
        Boolean(progress?.needsActivitiesBeforeNext) && currentProgressVideoIndex === videoIndex;

      feed.push({
        id: videoKey,
        videoKey,
        title:
          links.length > 1
            ? `${subLesson?.title || `Sub Lesson ${subLessonIndex + 1}`} - Video ${videoIndex + 1}`
            : subLesson?.title || `Sub Lesson ${subLessonIndex + 1}`,
        lessonId: `${subLessonIndex + 1}.${videoIndex + 1}`,
        videoSource: links[videoIndex] || "",
        videoIndex,
        subLessonIndex,
        watched,
        activityDone: Boolean(progress?.activitiesCompleted || progress?.isCompleted),
        isSubLessonCompleted: subCompleted,
        needsActivitiesBeforeNext,
        nextLockedReason:
          progress?.nextLockedReason ||
          "Please complete all activities, then you can watch the next video.",
        progress,
        shortLessonId,
        shortSubLessonId: subLessonId,
        subLessonTitle: subLesson?.title || `Sub Lesson ${subLessonIndex + 1}`,
        rawSubLesson: subLesson,
      });
    }
  }

  return feed;
}

function getResumeIndex({ feed = [], routeParams = {} }) {
  if (feed.length === 0) return 0;

  const completedVideoKey = routeParams?.completedVideoId || routeParams?.completedVideoKey || "";

  if (routeParams?.completedActivity && completedVideoKey) {
    const completedIndex = feed.findIndex((item) => item.videoKey === completedVideoKey);
    if (completedIndex >= 0) return Math.min(completedIndex + 1, feed.length - 1);
  }

  const blockedIndex = feed.findIndex((item) => item.needsActivitiesBeforeNext);
  if (blockedIndex >= 0) return blockedIndex;

  const targetSubLessonId = String(routeParams?.shortSubLessonId || routeParams?.subLessonId || "");
  const targetVideoIndex = Number(routeParams?.initialVideoIndex ?? routeParams?.videoIndex ?? 0);

  if (targetSubLessonId) {
    const exactIndex = feed.findIndex(
      (item) =>
        String(item.shortSubLessonId) === targetSubLessonId &&
        Number(item.videoIndex) === targetVideoIndex
    );

    if (exactIndex >= 0) return exactIndex;

    const subIndex = feed.findIndex((item) => String(item.shortSubLessonId) === targetSubLessonId);
    if (subIndex >= 0) return subIndex;
  }

  const firstNotCompletedIndex = feed.findIndex((item) => !item.isSubLessonCompleted);
  return firstNotCompletedIndex >= 0 ? firstNotCompletedIndex : feed.length - 1;
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
      <Text style={vcs.tapPlayText}>{title || "No video link found for this sub lesson"}</Text>
    </View>
  );
}

function PlayOverlay({ onPlay, isDisabled, message }) {
  return (
    <TouchableOpacity
      style={vcs.playOverlay}
      onPress={onPlay}
      activeOpacity={isDisabled ? 1 : 0.85}
      disabled={isDisabled}
    >
      <View style={[vcs.bigPlayCircle, isDisabled && vcs.bigPlayCircleDisabled]}>
        <View style={vcs.bigPlayTriangle} />
      </View>
      <Text style={vcs.tapPlayText}>{message || "Tap to Play Video"}</Text>
    </TouchableOpacity>
  );
}

function ActivityRequiredBanner({ message }) {
  return (
    <View pointerEvents="none" style={vcs.activityRequiredBanner}>
      <Text style={vcs.activityRequiredText}>
        {message || "Please complete all activities, then you can watch the next video."}
      </Text>
    </View>
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
    pageHeight,
    screenWidth,
    t,
  }) => {
    const videoAreaHeight = pageHeight - BOTTOM_BAR_HEIGHT;
    const isEnrollmentLocked = !isApproved;
    const isPlaying = isActive && playingIndex === index;
    const showActivityRequired = item?.needsActivitiesBeforeNext && item?.watched;
    const nextDisabled = !item?.watched || showActivityRequired;

    return (
      <View style={[vcs.cardContainer, { width: screenWidth, height: pageHeight }]}> 
        <View style={[vcs.videoArea, { width: screenWidth, height: videoAreaHeight }]}> 
          {isEnrollmentLocked ? (
            <LockOverlay onEnroll={onEnroll} t={t} />
          ) : !item?.videoSource ? (
            <EmptyVideoOverlay title="No video link found for this sub lesson" />
          ) : isPlaying ? (
            <CrossWebView
              key={`video-${item.id}`}
              source={{ html: buildVideoHtml(item.videoSource) }}
              style={vcs.webview}
            />
          ) : (
            <PlayOverlay
              onPlay={() => onPlay(index)}
              message={showActivityRequired ? item.nextLockedReason : "Tap to Play Video"}
            />
          )}

          {!isEnrollmentLocked && (
            <View pointerEvents="none" style={vcs.titleBar}>
              {item.watched && (
                <View style={vcs.demoPill}>
                  <Text style={vcs.demoPillText}>WATCHED</Text>
                </View>
              )}
              <Text style={vcs.star}>⭐</Text>
              <Text numberOfLines={1} style={vcs.titleText}>{item.title}</Text>
              <Text style={vcs.star}>⭐</Text>
            </View>
          )}

          {showActivityRequired && <ActivityRequiredBanner message={item.nextLockedReason} />}
        </View>

        {!isEnrollmentLocked && (
          <View style={vcs.bottomButtons}>
            <TouchableOpacity
              style={[vcs.btnNext, nextDisabled && vcs.btnDisabled]}
              onPress={() => onNextVideo(index)}
              activeOpacity={nextDisabled ? 1 : 0.85}
            >
              <View style={vcs.btnIconCircle}>
                <View style={vcs.playTriangleSmall} />
              </View>
              <Text style={vcs.btnText}>{t("nextVideo")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[vcs.btnActivity, item.activityDone && vcs.btnActivityDone, !item.watched && vcs.btnDisabled]}
              onPress={() => onActivity(item, index)}
              activeOpacity={item.watched ? 0.85 : 1}
            >
              <Text style={vcs.activityIcon}>📖</Text>
              <Text style={vcs.btnText}>
                {item.activityDone ? t("done") : item.watched ? t("activity") : "Watch first"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isEnrollmentLocked && (
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

  const shortLessonId = route?.params?.shortLessonId || route?.params?.lessonId;

  const {
    data: freshSubLessons = [],
    isLoading: loadingFreshSubLessons,
    isFetching: fetchingFreshSubLessons,
    refetch,
  } = useGetShortSubLessonOverviewQuery(shortLessonId, {
    skip: !shortLessonId,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const routeSubLessons = Array.isArray(route?.params?.allSubLessons)
    ? route.params.allSubLessons
    : [];

  const sourceSubLessons = freshSubLessons.length > 0 ? freshSubLessons : routeSubLessons;

  const feed = useMemo(
    () => buildUnlockedVideoFeed({ subLessons: sourceSubLessons, shortLessonId }),
    [sourceSubLessons, shortLessonId]
  );

  const feedSignature = useMemo(
    () =>
      feed
        .map((item) =>
          [
            item.videoKey,
            item.watched ? "w" : "nw",
            item.activityDone ? "a" : "na",
            item.needsActivitiesBeforeNext ? "b" : "nb",
          ].join(":")
        )
        .join("|"),
    [feed]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [pageHeight, setPageHeight] = useState(WINDOW_HEIGHT);
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);

  const [markShortVideoWatched] = useMarkShortVideoWatchedMutation();
  const { isApproved } = useEnrollmentStatus();

  useEffect(() => {
    const unsubscribe = navigation.addListener?.("focus", () => {
      if (shortLessonId) refetch?.();
    });

    return unsubscribe;
  }, [navigation, refetch, shortLessonId]);

  useEffect(() => {
    if (route?.params?.completedActivity && shortLessonId) {
      refetch?.();
    }
  }, [route?.params?.completedActivity, route?.params?.completedAt, refetch, shortLessonId]);

  useEffect(() => {
    setLessons(feed);
    setPlayingIndex(null);

    const targetIndex = getResumeIndex({ feed, routeParams: route?.params || {} });
    setActiveIndex(targetIndex);

    if (feed.length > 0) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({ index: targetIndex, animated: false });
      });
    }
  }, [feedSignature, pageHeight]);

  const stopVideo = useCallback(() => {
    setPlayingIndex(null);
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
      setPlayingIndex(null);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  const handlePlay = useCallback(
    async (index) => {
      const item = lessons[index];
      if (!item) return;

      setPlayingIndex(index);
      setLessons((prev) =>
        prev.map((lesson, lessonIndex) =>
          lessonIndex === index ? { ...lesson, watched: true, needsActivitiesBeforeNext: !lesson.activityDone } : lesson
        )
      );

      try {
        const response = await markShortVideoWatched({
          shortLessonId: item.shortLessonId,
          shortSubLessonId: item.shortSubLessonId,
          videoId: item.videoKey,
          videoIndex: item.videoIndex,
        }).unwrap();

        const progress = response?.progress || {};
        setLessons((prev) =>
          prev.map((lesson, lessonIndex) =>
            lessonIndex === index
              ? {
                  ...lesson,
                  watched: true,
                  activityDone: Boolean(progress?.activitiesCompleted || progress?.isCompleted),
                  needsActivitiesBeforeNext: Boolean(progress?.needsActivitiesBeforeNext),
                  nextLockedReason:
                    progress?.nextLockedReason ||
                    "Please complete all activities, then you can watch the next video.",
                  progress,
                }
              : lesson
          )
        );
      } catch (error) {
        Alert.alert(
          "Locked",
          error?.data?.message ||
            error?.message ||
            "Please complete all activities, then you can watch the next video."
        );
        refetch?.();
      }
    },
    [lessons, markShortVideoWatched, refetch]
  );

  const handleNextVideo = useCallback(
    (currentIndex) => {
      const currentItem = lessons[currentIndex];

      if (!currentItem?.watched) {
        Alert.alert("Watch Video First", "Please watch/play this video before going to the next video.");
        return;
      }

      if (currentItem?.needsActivitiesBeforeNext) {
        Alert.alert(
          "Activity Required",
          currentItem?.nextLockedReason ||
            "Please complete all activities, then you can watch the next video."
        );
        return;
      }

      stopVideo();
      const next = currentIndex + 1;

      if (next < lessons.length) {
        setActiveIndex(next);
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return;
      }

      Alert.alert(
        "Locked",
        "Please complete all activities, then you can watch the next video."
      );
    },
    [lessons, stopVideo]
  );

  const handleActivity = useCallback(
    (item, index) => {
      if (!item?.watched) {
        Alert.alert("Watch Video First", "Please watch/play this video before starting the activity.");
        return;
      }

      stopVideo();

      const nextItem = lessons[index + 1];

      navigation.navigate("ActivityFlow", {
        shortLessonId: item.shortLessonId,
        shortSubLessonId: item.shortSubLessonId,
        title: item.title,
        subLessonTitle: item.subLessonTitle,
        videoIndex: item.videoIndex,
        completedVideoIndex: item.videoIndex,
        nextVideoIndex: nextItem ? nextItem.videoIndex : item.videoIndex,
        hasNextVideo: Boolean(nextItem),
        completedVideoId: item.videoKey,
        completedVideoKey: item.videoKey,
        returnToVideoParams: {
          shortLessonId: item.shortLessonId,
          lessonId: item.shortLessonId,
          lessonTitle: route?.params?.lessonTitle,
          lessonNumber: route?.params?.lessonNumber,
          shortSubLessonId: item.shortSubLessonId,
          subLessonId: item.shortSubLessonId,
          subLessonTitle: item.subLessonTitle,
          allSubLessons: sourceSubLessons,
          currentSubLessonIndex: item.subLessonIndex,
          initialVideoIndex: item.videoIndex,
        },
      });
    },
    [navigation, route?.params, lessons, sourceSubLessons, stopVideo]
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <VideoCard
        item={item}
        index={index}
        isActive={index === activeIndex}
        isApproved={isApproved}
        playingIndex={playingIndex}
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
    (_, index) => ({ length: pageHeight, offset: pageHeight * index, index }),
    [pageHeight]
  );

  const isLoading = (loadingFreshSubLessons || fetchingFreshSubLessons) && lessons.length === 0;

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

      {isLoading ? (
        <View style={[vcs.cardContainer, { width: screenWidth, height: pageHeight }]}> 
          <View style={[vcs.playOverlay, { width: screenWidth, height: pageHeight }]}> 
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={[vcs.tapPlayText, { marginTop: 12 }]}>Loading videos...</Text>
          </View>
        </View>
      ) : lessons.length === 0 ? (
        <View style={[vcs.cardContainer, { width: screenWidth, height: pageHeight }]}> 
          <View style={[vcs.videoArea, { width: screenWidth, height: pageHeight - BOTTOM_BAR_HEIGHT }]}> 
            <EmptyVideoOverlay />
          </View>

          <View style={vcs.lockedBottom}>
            <Text style={vcs.lockedBottomText}>No unlocked videos</Text>
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
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: Math.min(index, Math.max(lessons.length - 1, 0)),
                animated: false,
              });
            }, 150);
          }}
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
  container: { flex: 1, backgroundColor: "#1a0a3c", alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  lockEmoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "900", color: "#EDE9FE", marginBottom: 10, textAlign: "center" },
  sub: { fontSize: 13, color: "#A78BFA", textAlign: "center", lineHeight: 20, fontWeight: "600", marginBottom: 28 },
  btn: { backgroundColor: "#7C3AED", borderRadius: 50, paddingHorizontal: 36, paddingVertical: 13 },
  btnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});

const vcs = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#5e1cce" },
  cardContainer: { backgroundColor: "#5e1cce" },
  videoArea: { backgroundColor: "#5e1cce", overflow: "hidden" },
  webview: { flex: 1, backgroundColor: "#000" },
  playOverlay: { flex: 1, backgroundColor: "#1a0a3c", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  bigPlayCircle: { width: 78, height: 78, borderRadius: 39, backgroundColor: "#7C3AED", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  bigPlayCircleDisabled: { opacity: 0.45 },
  bigPlayTriangle: { width: 0, height: 0, borderTopWidth: 16, borderBottomWidth: 16, borderLeftWidth: 24, borderTopColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "#fff", marginLeft: 6 },
  tapPlayText: { color: "#EDE9FE", fontSize: 15, fontWeight: "800", textAlign: "center" },
  titleBar: { position: "absolute", top: 0, left: 0, right: 0, minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 12, paddingHorizontal: 14, backgroundColor: "#5e1cce" },
  demoPill: { backgroundColor: "#FEF3C7", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, marginRight: 6 },
  demoPillText: { fontSize: 9, fontWeight: "900", color: "#92400E" },
  titleText: { flexShrink: 1, color: "#FFFFFF", fontSize: 16, fontWeight: "700", marginHorizontal: 6, textAlign: "center" },
  star: { fontSize: 15 },
  activityRequiredBanner: { position: "absolute", left: 16, right: 16, bottom: 16, backgroundColor: "rgba(26,10,60,0.9)", borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  activityRequiredText: { color: "#FDE68A", fontSize: 13, lineHeight: 18, fontWeight: "900", textAlign: "center" },
  bottomButtons: { width: "100%", height: BOTTOM_BAR_HEIGHT, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, backgroundColor: "#5e1cce", gap: 12 },
  lockedBottom: { width: "100%", height: BOTTOM_BAR_HEIGHT, alignItems: "center", justifyContent: "center", backgroundColor: "#1a0a3c" },
  lockedBottomText: { color: "#A78BFA", fontSize: 13, fontWeight: "700" },
  btnNext: { flex: 1, height: BTN_HEIGHT, backgroundColor: PURPLE, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  btnActivity: { flex: 1, height: BTN_HEIGHT, backgroundColor: PURPLE, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  btnDisabled: { opacity: 0.45 },
  btnActivityDone: { backgroundColor: "#2ecc71" },
  btnIconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", marginRight: 8 },
  playTriangleSmall: { width: 0, height: 0, borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 10, borderTopColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "#fff", marginLeft: 2 },
  activityIcon: { fontSize: 18, marginRight: 8 },
  btnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
