import React from "react";
import { Platform } from "react-native";

let WebViewComp;

if (Platform.OS === "ios" || Platform.OS === "android") {
  WebViewComp = require("react-native-webview").WebView;
} else {
  WebViewComp = require("react-native-web-webview").WebView;
}

export default function CrossWebView({ style, ...props }) {
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";

  const mobileDefaults = isMobile
    ? {
        javaScriptEnabled: true,
        domStorageEnabled: true,
        originWhitelist: ["*"],
        mixedContentMode: "always",
        allowsFullscreenVideo: true,
        allowsInlineMediaPlayback: true,
        mediaPlaybackRequiresUserAction: false,
        setSupportMultipleWindows: false,
      }
    : {};

  return <WebViewComp {...mobileDefaults} {...props} style={style} />;
}
