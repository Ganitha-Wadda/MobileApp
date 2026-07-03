import Avatar from "../infastructure/schemas/avatar.js";

// Server-side copy of the allowed avatar options. Must stay in sync with
// frontend utils/avatarBuilder.js — the client can never persist a value
// outside these lists, even from a tampered app.
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

const sanitizeConfig = (incoming = {}) => {
  const source = incoming && typeof incoming === "object" ? incoming : {};
  const cleaned = { ...DEFAULT_AVATAR_CONFIG };

  Object.keys(AVATAR_CATEGORIES).forEach((key) => {
    const value = source[key];
    if (typeof value === "string" && AVATAR_CATEGORIES[key].includes(value)) {
      cleaned[key] = value;
    }
  });

  if (typeof source.seed === "string" && source.seed.length <= 80) {
    cleaned.seed = source.seed;
  }

  return cleaned;
};

export const getMyAvatar = async (req, res, next) => {
  try {
    const avatar = await Avatar.findOne({ userId: req.user.id }).lean();
    return res.json({ avatar: avatar || null });
  } catch (error) {
    next(error);
  }
};

export const saveMyAvatar = async (req, res, next) => {
  try {
    const config = sanitizeConfig(req.body?.config);

    const avatar = await Avatar.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: { config },
        $setOnInsert: { userId: req.user.id },
      },
      { new: true, upsert: true }
    ).lean();

    return res.json({ avatar });
  } catch (error) {
    next(error);
  }
};
