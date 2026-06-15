// app/i18n/useT.js

import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { translations } from "./translations";
import { getSinhalaFont, getNavSinhalaFont } from "./font";

export default function useT() {
  const lang = useSelector((s) => s?.languageSelection?.language || "si");

  const dict = useMemo(
    () => translations[lang] || translations.si,
    [lang]
  );

  // Stable reference — won't cause unnecessary re-renders in child components
  const t = useCallback(
    (key) => dict?.[key] ?? translations.si?.[key] ?? key,
    [dict]
  );

  const sinFont = useCallback(
    (weight = "regular") => getSinhalaFont(lang, weight),
    [lang]
  );

  const navFont = useCallback(
    (weight = "regular") => getNavSinhalaFont(lang, weight),
    [lang]
  );

  // isSi — true when Sinhala is active.
  // Use this to conditionally strip fontWeight from style arrays,
  // because Android breaks custom fontFamily when fontWeight is also set.
  const isSi = lang === "si";

  return { t, lang, sinFont, navFont, isSi };
}