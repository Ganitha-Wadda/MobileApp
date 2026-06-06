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

import CrossWebView from "../components/CrossWebView";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

const BOTTOM_BAR_HEIGHT = 82;

const LESSONS = [
  {
    id: "1",
    title: "Chakkre (part - 1)",
    lessonId: "1.1",
    videoId: "-VJWCNwFN60",
    activityDone: false,
  },
  {
    id: "2",
    title: "Chakkre (part - 2)",
    lessonId: "1.2",
    videoId: "U_hdOu5L50o",
    activityDone: false,
  },
  {
    id: "3",
    title: "Chakkre (part - 3)",
    lessonId: "1.3",
    videoId: "HnwwynXxnBg",
    activityDone: false,
  },
  {
    id: "4",
    title: "Chakkre (part - 4)",
    lessonId: "1.4",
    videoId: "wXE8l4pyJ5E",
    activityDone: false,
  },
  {
    id: "5",
    title: "Chakkre (part - 5)",
    lessonId: "1.5",
    videoId: "-VJWCNwFN60",
    activityDone: false,
  },
];

function buildYoutubeHtml(videoId = "") {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #000;
            overflow: hidden;
          }

          .wrap {
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          iframe {
            width: 100%;
            height: 100%;
            border: 0;
            background: #000;
          }
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

const VideoCard = React.memo(
  ({
    item,
    isActive,
    onNextVideo,
    onActivity,
    activityDone,
    pageHeight,
    screenWidth,
  }) => {
    const videoAreaHeight = pageHeight - BOTTOM_BAR_HEIGHT;

    return (
      <View
        style={[
          styles.cardContainer,
          {
            width: screenWidth,
            height: pageHeight,
          },
        ]}
      >
        <View
          style={[
            styles.videoArea,
            {
              width: screenWidth,
              height: videoAreaHeight,
            },
          ]}
        >
          {isActive ? (
            <CrossWebView
              source={{ html: buildYoutubeHtml(item.videoId) }}
              style={styles.webview}
            />
          ) : (
            <View style={styles.blackScreen} />
          )}

          <View pointerEvents="none" style={styles.titleBar}>
            <Text style={styles.sparkleDot}>• </Text>
            <Text style={styles.star}>⭐</Text>
            <Text numberOfLines={1} style={styles.titleText}>
              {item.title}
            </Text>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.sparkleDot}> •</Text>
          </View>
        </View>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.btnNext}
            onPress={onNextVideo}
            activeOpacity={0.85}
          >
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
            <Text style={styles.btnText}>
              {activityDone ? "Done ✓" : "Activity"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

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

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const handleNextVideo = useCallback(
    (currentIndex) => {
      const next = currentIndex + 1;

      if (next < lessons.length) {
        flatListRef.current?.scrollToIndex({
          index: next,
          animated: true,
        });
      }
    },
    [lessons.length]
  );

  const handleActivity = useCallback(
    (item) => {
      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === item.id
            ? {
                ...lesson,
                activityDone: true,
              }
            : lesson
        )
      );

      navigation.navigate("activitytemplate1", {
        title: item.title,
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
        activityDone={item.activityDone}
        pageHeight={pageHeight}
        screenWidth={screenWidth}
        onNextVideo={() => handleNextVideo(index)}
        onActivity={() => handleActivity(item)}
      />
    ),
    [
      activeIndex,
      pageHeight,
      screenWidth,
      handleNextVideo,
      handleActivity,
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
      style={styles.safeArea}
      onLayout={(event) => {
        const height = event.nativeEvent.layout.height;
        if (height > 0 && height !== pageHeight) {
          setPageHeight(height);
        }
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

const PURPLE = "#5B4CE8";
const BTN_HEIGHT = 54;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#5c49ee",
  },

  cardContainer: {
    backgroundColor: "#5c49ee",
  },

  videoArea: {
    backgroundColor: "#5c49ee",
    overflow: "hidden",
  },

  webview: {
    flex: 1,
    backgroundColor: "#5c49ee",
  },

  blackScreen: {
    flex: 1,
    backgroundColor: "#5c49ee",
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
    backgroundColor: "#5c49ee",
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

  star: {
    fontSize: 15,
  },

  sparkleDot: {
    color: "#b8a8f8",
    fontSize: 18,
    fontWeight: "700",
  },

  bottomButtons: {
    width: "100%",
    height: BOTTOM_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#6b5ce4",
    gap: 12,
  },

  btnNext: {
    flex: 1,
    height: BTN_HEIGHT,
    backgroundColor: PURPLE,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PURPLE,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  btnActivity: {
    flex: 1,
    height: BTN_HEIGHT,
    backgroundColor: PURPLE,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PURPLE,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
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
    letterSpacing: 0.2,
  },
});