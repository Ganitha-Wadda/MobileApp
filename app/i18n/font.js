// app/i18n/font.js

export const SIN_FONT_REGULAR = "FMEmaneex";
export const SIN_FONT_BOLD    = "FMEmaneex";

export const getSinhalaFont = (lang, weight = "regular") => {
  if (lang !== "si") return {};

  return {
    fontFamily:         weight === "bold" ? SIN_FONT_BOLD : SIN_FONT_REGULAR,
    fontWeight:         "normal",   // Android: must be "normal" when using custom fontFamily
    fontStyle:          "normal",
    includeFontPadding: false,      // Android Sinhala text height fix
  };
};

export const getNavSinhalaFont = (lang, weight = "regular") => {
  if (lang !== "si") return {};

  return {
    fontFamily:         weight === "bold" ? SIN_FONT_BOLD : SIN_FONT_REGULAR,
    fontWeight:         "normal",
    fontStyle:          "normal",
    includeFontPadding: false,
  };
};