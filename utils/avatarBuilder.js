const DEFAULT_AVATAR_CONFIG = {
  style: "avataaars",
  seed: "math-genius",
  skinColor: "Light",
  top: "ShortHairShortFlat",
  hairColor: "BrownDark",
  facialHair: "Blank",
  accessories: "Blank",
  eyes: "Happy",
  eyebrows: "RaisedExcited",
  mouth: "Smile",
  clothing: "Hoodie",
  clothingColor: "Blue02",
  backgroundColor: "dbeafe",
  faceShape: "Round",
  bodyType: "Regular",
  personality: "Energetic",
  eyeColor: "Brown",
  gadget: "Blank",
  scene: "Studio",
};

const AVATAR_CATEGORIES = {
  top: [
    "ShortHairShortFlat",
    "ShortHairDreads01",
    "ShortHairFrizzle",
    "LongHairStraight",
    "LongHairCurvy",
    "LongHairBun",
    "LongHairBraids",
    "PigTails",
    "Hat",
    "Turban",
    "Hijab",
  ],
  skinColor: ["Light", "Tanned", "Yellow", "Brown", "DarkBrown", "Black"],
  hairColor: [
    "Black",
    "Brown",
    "BrownDark",
    "Auburn",
    "Blonde",
    "BlondeGolden",
    "PastelPink",
  ],
  facialHair: ["Blank", "BeardMedium", "BeardLight", "MoustacheFancy"],
  eyes: ["Default", "Happy", "Wink", "Squint", "Surprised", "Cry"],
  eyebrows: [
    "Default",
    "RaisedExcited",
    "SadConcerned",
    "UnibrowNatural",
    "UpDown",
  ],
  mouth: ["Smile", "Twinkle", "Serious", "Tongue", "Eating", "Concerned"],
  clothing: [
    "Hoodie",
    "ShirtCrewNeck",
    "ShirtVNeck",
    "BlazerShirt",
    "BlazerSweater",
    "Overall",
  ],
  clothingColor: [
    "Black",
    "Blue01",
    "Blue02",
    "Heather",
    "PastelBlue",
    "PastelGreen",
    "Red",
  ],
  accessories: ["Blank", "Prescription01", "Round", "Sunglasses", "Wayfarers"],
  backgroundColor: ["dbeafe", "fde68a", "fecdd3", "bbf7d0", "ddd6fe", "f5d0fe"],
  faceShape: ["Round", "Oval", "Square"],
  bodyType: ["Slim", "Regular", "Sturdy"],
  personality: ["Energetic", "Chill", "Curious", "Champion"],
  eyeColor: ["Brown", "Black", "Blue", "Green", "Amber", "Gray"],
  gadget: ["Blank", "Watch", "Headphones", "Backpack", "Medal", "Crown"],
  scene: ["Studio", "FantasyGarden", "NightSky", "Space", "Meadow"],
};

// Shared hex palettes used by both the 2D fallback viewer and the 3D engine.
const AVATAR_COLORS = {
  skinColor: {
    Light: "#f5d0b5",
    Tanned: "#e6b78f",
    Yellow: "#f2cf97",
    Brown: "#c78f66",
    DarkBrown: "#8d5a3a",
    Black: "#5a3c2a",
  },
  hairColor: {
    Black: "#111827",
    Brown: "#6b442d",
    BrownDark: "#3f2a1d",
    Auburn: "#8a3d2b",
    Blonde: "#d8b45a",
    BlondeGolden: "#f2c14d",
    PastelPink: "#d88eb2",
  },
  clothingColor: {
    Black: "#111827",
    Blue01: "#1d4ed8",
    Blue02: "#1e3a8a",
    Heather: "#6b7280",
    PastelBlue: "#93c5fd",
    PastelGreen: "#86efac",
    Red: "#dc2626",
  },
  backgroundColor: {
    dbeafe: "#dbeafe",
    fde68a: "#fde68a",
    fecdd3: "#fecdd3",
    bbf7d0: "#bbf7d0",
    ddd6fe: "#ddd6fe",
    f5d0fe: "#f5d0fe",
  },
  eyeColor: {
    Brown: "#6b4423",
    Black: "#1c1917",
    Blue: "#2563eb",
    Green: "#15803d",
    Amber: "#b45309",
    Gray: "#64748b",
  },
};

const getAvatarColor = (mapName, key, fallback) =>
  AVATAR_COLORS[mapName]?.[key] || fallback;

const AVATAR_PRESETS = [
  {
    id: "astro-kid",
    name: "Astro Kid",
    config: {
      top: "ShortHairDreads01",
      hairColor: "Black",
      eyes: "Wink",
      mouth: "Twinkle",
      clothing: "Hoodie",
      clothingColor: "Blue02",
      accessories: "Round",
      backgroundColor: "ddd6fe",
      gadget: "Headphones",
      personality: "Curious",
      eyeColor: "Brown",
      scene: "Space",
    },
  },
  {
    id: "class-topper",
    name: "Class Topper",
    config: {
      top: "LongHairBraids",
      hairColor: "Brown",
      eyes: "Happy",
      mouth: "Smile",
      clothing: "Overall",
      clothingColor: "Blue01",
      accessories: "Round",
      backgroundColor: "dbeafe",
      gadget: "Medal",
      personality: "Champion",
      eyeColor: "Blue",
      scene: "Meadow",
    },
  },
  {
    id: "street-pro",
    name: "Street Pro",
    config: {
      top: "Hat",
      hairColor: "Auburn",
      facialHair: "MoustacheFancy",
      eyes: "Squint",
      mouth: "Serious",
      clothing: "ShirtVNeck",
      clothingColor: "Red",
      accessories: "Sunglasses",
      backgroundColor: "fecdd3",
      gadget: "Watch",
      personality: "Chill",
      eyeColor: "Black",
    },
  },
  {
    id: "study-ninja",
    name: "Study Ninja",
    config: {
      top: "Turban",
      hairColor: "Black",
      facialHair: "Blank",
      eyes: "Default",
      mouth: "Smile",
      clothing: "Overall",
      clothingColor: "Heather",
      accessories: "Blank",
      backgroundColor: "bbf7d0",
      gadget: "Backpack",
      personality: "Energetic",
      eyeColor: "Green",
    },
  },
  {
    id: "quiz-royal",
    name: "Quiz Royal",
    config: {
      top: "LongHairBun",
      hairColor: "BlondeGolden",
      eyes: "Happy",
      mouth: "Twinkle",
      clothing: "BlazerSweater",
      clothingColor: "Black",
      accessories: "Blank",
      backgroundColor: "fde68a",
      gadget: "Crown",
      personality: "Champion",
      eyeColor: "Blue",
      scene: "FantasyGarden",
    },
  },
  {
    id: "chill-coder",
    name: "Chill Coder",
    config: {
      top: "PigTails",
      hairColor: "PastelPink",
      eyes: "Default",
      mouth: "Smile",
      clothing: "Hoodie",
      clothingColor: "PastelGreen",
      accessories: "Wayfarers",
      backgroundColor: "f5d0fe",
      gadget: "Headphones",
      personality: "Chill",
      eyeColor: "Gray",
    },
  },
];

// Order used for the deterministic 2D thumbnail seed. Intentionally excludes
// the 3D-only keys so existing users' DiceBear thumbnails stay stable.
const AVATAR_ORDER = [
  "top",
  "skinColor",
  "hairColor",
  "facialHair",
  "eyes",
  "eyebrows",
  "mouth",
  "clothing",
  "clothingColor",
  "accessories",
  "backgroundColor",
];

// Full key list validated during normalization (2D keys + 3D-only keys).
const AVATAR_KEYS = [
  ...AVATAR_ORDER,
  "faceShape",
  "bodyType",
  "personality",
  "eyeColor",
  "gadget",
  "scene",
];

export const normalizeAvatarConfig = (incomingConfig = {}) => {
  const merged = { ...DEFAULT_AVATAR_CONFIG, ...(incomingConfig || {}) };

  const cleaned = { ...merged };
  AVATAR_KEYS.forEach((key) => {
    const options = AVATAR_CATEGORIES[key];
    if (options && !options.includes(cleaned[key])) {
      cleaned[key] = DEFAULT_AVATAR_CONFIG[key];
    }
  });

  if (!cleaned.seed || typeof cleaned.seed !== "string") {
    cleaned.seed = DEFAULT_AVATAR_CONFIG.seed;
  }

  return cleaned;
};

export const getDefaultAvatarConfig = () => ({ ...DEFAULT_AVATAR_CONFIG });

export const randomizeAvatarConfig = (baseConfig = {}) => {
  const next = normalizeAvatarConfig(baseConfig);
  AVATAR_KEYS.forEach((key) => {
    const options = AVATAR_CATEGORIES[key];
    if (options?.length) {
      const nextIndex = Math.floor(Math.random() * options.length);
      next[key] = options[nextIndex];
    }
  });

  return next;
};

export const buildAvatarUrl = (incomingConfig = {}) => {
  const config = normalizeAvatarConfig(incomingConfig);
  const style = config.style || "adventurer";

  // Keep generation robust by encoding all options into one deterministic seed.
  // This avoids style-specific validation errors from unsupported query params.
  const signature = AVATAR_ORDER.map((key) => `${key}:${config[key]}`).join("|");
  const seed = encodeURIComponent(`${config.seed || "student"}::${signature}`);

  return `https://api.dicebear.com/9.x/${style}/png?seed=${seed}&size=256&radius=50`;
};

export { AVATAR_CATEGORIES, AVATAR_PRESETS, AVATAR_COLORS, getAvatarColor };
