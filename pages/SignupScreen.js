// pages/SignupScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useDispatch } from "react-redux";

import Floating from "../pages/Floating.js";
import { useSignupMutation } from "../app/features/authApi.js";
import { setPendingIdentity } from "../app/features/authSlice.js";
import { BASE_URL } from "../app/api/api.js";
import useT from "../app/i18n/useT.js";

const { width, height } = Dimensions.get("window");

const DISTRICT_OPTIONS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MIN_BIRTH_YEAR = 1990;

const formatPartsToYMD = (year, monthIndex, day) => {
  const month = String(monthIndex + 1).padStart(2, "0");
  const cleanDay = String(day).padStart(2, "0");
  return `${year}-${month}-${cleanDay}`;
};

const parseYMDToDate = (value) => {
  if (!value) return null;

  const parts = String(value).split("-");

  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const isFutureDate = (year, monthIndex, day) => {
  const selectedDate = new Date(year, monthIndex, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selectedDate > today;
};

const normalizeText = (value = "") => String(value || "").trim();

const sortTextNumber = (a, b) => {
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

const uniqueSorted = (values = []) => {
  return [
    ...new Set(values.map((value) => normalizeText(value)).filter(Boolean)),
  ].sort(sortTextNumber);
};

const getTranslation = (t, key, fallback) => {
  const value = t(key);
  return !value || value === key ? fallback : value;
};

const getDistrictTranslationKey = (district) => {
  return String(district || "").replace(/\s+/g, "");
};

const getDistrictLabel = (t, district) => {
  const districtMap = t("districts");
  const cleanDistrict = String(district || "");

  if (districtMap && typeof districtMap === "object") {
    return (
      districtMap[getDistrictTranslationKey(cleanDistrict)] ||
      districtMap[cleanDistrict] ||
      cleanDistrict
    );
  }

  return cleanDistrict;
};

const buildClassOptions = (classes = []) => {
  const gradeSet = new Set();
  const batchesByGrade = {};

  for (const item of classes) {
    const grade = normalizeText(item?.grade);
    const batchnumber = normalizeText(item?.batchnumber);

    if (!grade || !batchnumber) continue;

    gradeSet.add(grade);

    if (!batchesByGrade[grade]) {
      batchesByGrade[grade] = [];
    }

    batchesByGrade[grade].push(batchnumber);
  }

  const grades = [...gradeSet].sort((a, b) => Number(a) - Number(b));

  for (const grade of Object.keys(batchesByGrade)) {
    batchesByGrade[grade] = uniqueSorted(batchesByGrade[grade]);
  }

  return { grades, batchesByGrade };
};

export default function SignupScreen({ navigation }) {
  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();
  const { t, sinFont } = useT();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    birthday: "",
    grade: "",
    batchnumber: "",
    district: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [gender, setGender] = useState(null);
  const [error, setError] = useState("");
  const [birthdayVisible, setBirthdayVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [classOptionsLoading, setClassOptionsLoading] = useState(false);
  const [classOptionsError, setClassOptionsError] = useState("");
  const [backendClasses, setBackendClasses] = useState([]);

  const { grades: gradeOptions, batchesByGrade } = useMemo(() => {
    return buildClassOptions(backendClasses);
  }, [backendClasses]);

  const selectedBatchNumberOptions = useMemo(() => {
    if (!form.grade) return [];
    return batchesByGrade[String(form.grade)] || [];
  }, [batchesByGrade, form.grade]);

  const selectedDistrictLabel = useMemo(() => {
    if (!form.district) return "";
    return getDistrictLabel(t, form.district);
  }, [form.district, t]);

  useEffect(() => {
    let mounted = true;

    const loadClasses = async () => {
      try {
        setClassOptionsLoading(true);
        setClassOptionsError("");

        const response = await fetch(`${BASE_URL}/api/class`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load class data");
        }

        const classes = Array.isArray(data?.classes)
          ? data.classes
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];

        if (mounted) {
          setBackendClasses(classes);
        }
      } catch (err) {
        if (mounted) {
          setBackendClasses([]);
          setClassOptionsError(
            err?.message || "Class data failed to load. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setClassOptionsLoading(false);
        }
      }
    };

    loadClasses();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!form.grade || !form.batchnumber) return;

    if (!selectedBatchNumberOptions.includes(form.batchnumber)) {
      setForm((prev) => ({ ...prev, batchnumber: "" }));
    }
  }, [form.grade, form.batchnumber, selectedBatchNumberOptions]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "grade" && prev.grade !== value) {
        next.batchnumber = "";
      }

      return next;
    });
  };

  const openBatchNumberDropdown = () => {
    setError("");

    if (!form.grade) {
      setError(t("errorGrade"));
      return;
    }

    setDropdownVisible("batchnumber");
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.name.trim()) return setError(t("errorName"));
    if (!form.mobile.trim()) return setError(t("errorMobile"));
    if (!form.birthday.trim()) return setError(t("errorBirthday"));
    if (classOptionsError) return setError(classOptionsError);
    if (!form.grade.trim()) return setError(t("errorGrade"));

    if (!form.batchnumber.trim()) {
      return setError(
        getTranslation(t, "errorBatchNumber", "Please select batch number")
      );
    }

    if (!form.district.trim()) return setError(t("errorDistrict"));
    if (!form.address.trim()) return setError(t("errorAddress"));
    if (!gender) return setError(t("errorGender"));
    if (!form.password) return setError(t("errorPassword"));
    if (!form.confirmPassword) return setError(t("errorConfirmPassword"));

    if (form.password !== form.confirmPassword) {
      return setError(t("errorPasswordMatch"));
    }

    try {
      const result = await signup({
        name: form.name.trim(),
        phonenumber: form.mobile.trim(),
        birthday: form.birthday.trim(),
        grade: Number(form.grade),
        batchnumber: form.batchnumber.trim(),
        district: form.district.trim(),
        address: form.address.trim(),
        gender: gender.toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      }).unwrap();

      dispatch(
        setPendingIdentity({
          phone: result?.phonenumber || form.mobile.trim(),
        })
      );

      navigation.navigate("Otp");
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Signup failed. Please try again.";

      setError(message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/a_vertical_pastel_cartoon_illustration_scene_like.png")}
        style={styles.background}
        resizeMode="cover"
      />

      <Floating
        text="2"
        startX={width * 0.05}
        startY={height * 0.25}
        color="#1B7EEF"
        size={width * 0.08}
      />

      <Floating
        text="3"
        startX={width * 0.85}
        startY={height * 0.75}
        color="#FF9500"
        size={width * 0.08}
      />

      <Floating
        text="5"
        startX={width * 0.15}
        startY={height * 0.6}
        color="#34C759"
        size={width * 0.08}
      />

      <Floating
        text="9"
        startX={width * 0.8}
        startY={height * 0.7}
        color="#FF3B30"
        size={width * 0.08}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>
                Sign<Text style={styles.highlight}>Up</Text>
              </Text>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, sinFont()]}>{error}</Text>
              </View>
            )}

            <InputField
              icon="👤"
              placeholder={t("name")}
              value={form.name}
              onChangeText={(v) => updateField("name", v)}
              autoCapitalize="words"
              sinFont={sinFont()}
            />

            <InputField
              icon="📱"
              placeholder={t("mobile")}
              value={form.mobile}
              onChangeText={(v) => updateField("mobile", v)}
              keyboardType="phone-pad"
              sinFont={sinFont()}
            />

            <SelectField
              icon="🎂"
              placeholder={t("selectBirthday")}
              value={form.birthday}
              onPress={() => setBirthdayVisible(true)}
              sinFont={sinFont()}
            />

            <SelectField
              icon="🎓"
              placeholder={
                classOptionsLoading
                  ? getTranslation(t, "loadingGrades", "Loading grades...")
                  : t("selectGrade")
              }
              value={form.grade ? `${t("grade")} ${form.grade}` : ""}
              onPress={() => setDropdownVisible("grade")}
              sinFont={sinFont()}
            />

            <SelectField
              icon="🔢"
              placeholder={
                !form.grade
                  ? getTranslation(t, "selectGradeFirst", "Select grade first")
                  : classOptionsLoading
                    ? getTranslation(
                        t,
                        "loadingBatchNumbers",
                        "Loading batch numbers..."
                      )
                    : getTranslation(
                        t,
                        "selectBatchNumber",
                        "Select Batch Number"
                      )
              }
              value={form.batchnumber}
              onPress={openBatchNumberDropdown}
              sinFont={sinFont()}
            />

            <SelectField
              icon="🏙️"
              placeholder={t("selectDistrict")}
              value={selectedDistrictLabel}
              onPress={() => setDropdownVisible("district")}
              sinFont={sinFont()}
            />

            <InputField
              icon="🏠"
              placeholder={t("address")}
              value={form.address}
              onChangeText={(v) => updateField("address", v)}
              autoCapitalize="sentences"
              sinFont={sinFont()}
            />

            <InputField
              icon="🔒"
              placeholder={t("password")}
              value={form.password}
              onChangeText={(v) => updateField("password", v)}
              secureTextEntry
              sinFont={sinFont()}
            />

            <InputField
              icon="🔐"
              placeholder={t("confirmPassword")}
              value={form.confirmPassword}
              onChangeText={(v) => updateField("confirmPassword", v)}
              secureTextEntry
              sinFont={sinFont()}
            />

            <View style={styles.genderContainer}>
              <GenderOption
                icon="👦"
                label={t("male")}
                selected={gender === "male"}
                onPress={() => setGender("male")}
                sinFont={sinFont()}
              />

              <GenderOption
                icon="👧"
                label={t("female")}
                selected={gender === "female"}
                onPress={() => setGender("female")}
                sinFont={sinFont()}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.submitText, sinFont()]}>
                  {t("submit")}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.signinText}>
              <Text style={sinFont()}>{t("alreadyAccount")}</Text>{" "}
              <Text
                style={[styles.signinLink, sinFont()]}
                onPress={() => navigation.navigate("Signin")}
              >
                {t("signIn")}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BirthdayPickerModal
        visible={birthdayVisible}
        value={form.birthday}
        onClose={() => setBirthdayVisible(false)}
        onConfirm={(dateValue) => {
          updateField("birthday", dateValue);
          setBirthdayVisible(false);
        }}
        t={t}
        sinFont={sinFont()}
      />

      <DropdownModal
        visible={dropdownVisible === "grade"}
        title={t("selectGrade")}
        options={gradeOptions}
        value={form.grade}
        isLoading={classOptionsLoading}
        emptyLabel={getTranslation(
          t,
          "noBackendClasses",
          "No backend classes available"
        )}
        onClose={() => setDropdownVisible(null)}
        onSelect={(value) => {
          updateField("grade", value);
          setDropdownVisible(null);
        }}
        labelPrefix={`${t("grade")} `}
        sinFont={sinFont()}
        closeLabel={t("close")}
      />

      <DropdownModal
        visible={dropdownVisible === "batchnumber"}
        title={getTranslation(t, "selectBatchNumber", "Select Batch Number")}
        options={selectedBatchNumberOptions}
        value={form.batchnumber}
        isLoading={classOptionsLoading}
        emptyLabel={getTranslation(
          t,
          "noBatchNumbersForGrade",
          "No batch numbers available for this grade"
        )}
        onClose={() => setDropdownVisible(null)}
        onSelect={(value) => {
          updateField("batchnumber", value);
          setDropdownVisible(null);
        }}
        sinFont={sinFont()}
        closeLabel={t("close")}
      />

      <DropdownModal
        visible={dropdownVisible === "district"}
        title={t("selectDistrict")}
        options={DISTRICT_OPTIONS}
        value={form.district}
        getOptionLabel={(item) => getDistrictLabel(t, item)}
        onClose={() => setDropdownVisible(null)}
        onSelect={(value) => {
          updateField("district", value);
          setDropdownVisible(null);
        }}
        sinFont={sinFont()}
        closeLabel={t("close")}
      />
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  sinFont = {},
}) => {
  return (
    <View style={styles.inputBox}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <TextInput
        style={[styles.input, sinFont]}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
};

const SelectField = ({ icon, placeholder, value, onPress, sinFont = {} }) => {
  return (
    <TouchableOpacity
      style={styles.inputBox}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text
        style={[styles.selectText, !value && styles.placeholderText, sinFont]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>

      <Text style={styles.dropdownArrow}>▼</Text>
    </TouchableOpacity>
  );
};

const GenderOption = ({ icon, label, selected, onPress, sinFont = {} }) => {
  return (
    <TouchableOpacity
      style={[styles.genderOption, selected && styles.genderSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.genderIconCircle}>
        <Text style={styles.genderIcon}>{icon}</Text>
      </View>

      <Text style={[styles.genderLabel, sinFont]}>{label}</Text>
    </TouchableOpacity>
  );
};

const DropdownModal = ({
  visible,
  title,
  options,
  value,
  onClose,
  onSelect,
  labelPrefix = "",
  getOptionLabel = (item) => item,
  sinFont = {},
  closeLabel = "Close",
  isLoading = false,
  emptyLabel = "No options available",
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.dropdownSheet}>
          <Text style={[styles.modalTitle, sinFont]}>{title}</Text>

          <ScrollView
            style={styles.dropdownList}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.dropdownEmptyBox}>
                <ActivityIndicator color="#1B7EEF" />
              </View>
            ) : options.length === 0 ? (
              <View style={styles.dropdownEmptyBox}>
                <Text style={[styles.dropdownEmptyText, sinFont]}>
                  {emptyLabel}
                </Text>
              </View>
            ) : (
              options.map((item) => {
                const selected = String(value) === String(item);
                const label = getOptionLabel(item);

                return (
                  <TouchableOpacity
                    key={String(item)}
                    style={[
                      styles.dropdownItem,
                      selected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => onSelect(String(item))}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selected && styles.dropdownItemTextSelected,
                        sinFont,
                      ]}
                    >
                      {labelPrefix}
                      {label}
                    </Text>

                    {selected && <Text style={styles.checkText}>✓</Text>}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[styles.closeButtonText, sinFont]}>{closeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const BirthdayPickerModal = ({
  visible,
  value,
  onClose,
  onConfirm,
  t,
  sinFont = {},
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();

  const defaultDate = useMemo(() => {
    const parsed = parseYMDToDate(value);
    if (parsed) return parsed;
    return new Date(currentYear - 10, 0, 1);
  }, [value, currentYear]);

  const [tempDay, setTempDay] = useState(defaultDate.getDate());
  const [tempMonth, setTempMonth] = useState(defaultDate.getMonth());
  const [tempYear, setTempYear] = useState(defaultDate.getFullYear());

  useEffect(() => {
    if (visible) {
      const parsed = parseYMDToDate(value);
      const startDate = parsed || new Date(currentYear - 10, 0, 1);

      setTempDay(startDate.getDate());
      setTempMonth(startDate.getMonth());
      setTempYear(startDate.getFullYear());
    }
  }, [visible, value, currentYear]);

  const maxDay = getDaysInMonth(tempYear, tempMonth);
  const selectedDateValue = formatPartsToYMD(tempYear, tempMonth, tempDay);
  const selectedDateIsFuture = isFutureDate(tempYear, tempMonth, tempDay);

  const changeDay = (amount) => {
    setTempDay((prev) => {
      const nextDay = prev + amount;

      if (nextDay < 1) return 1;
      if (nextDay > maxDay) return maxDay;

      return nextDay;
    });
  };

  const changeMonth = (amount) => {
    setTempMonth((prev) => {
      let nextMonth = prev + amount;
      let nextYear = tempYear;

      if (nextMonth < 0) {
        nextMonth = 11;
        nextYear = tempYear - 1;
      }

      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear = tempYear + 1;
      }

      if (nextYear < MIN_BIRTH_YEAR) {
        nextYear = MIN_BIRTH_YEAR;
        nextMonth = 0;
      }

      if (nextYear > currentYear) {
        nextYear = currentYear;
        nextMonth = today.getMonth();
      }

      const nextMaxDay = getDaysInMonth(nextYear, nextMonth);

      setTempYear(nextYear);
      setTempDay((oldDay) => Math.min(oldDay, nextMaxDay));

      return nextMonth;
    });
  };

  const changeYear = (amount) => {
    setTempYear((prev) => {
      let nextYear = prev + amount;

      if (nextYear < MIN_BIRTH_YEAR) nextYear = MIN_BIRTH_YEAR;
      if (nextYear > currentYear) nextYear = currentYear;

      let nextMonth = tempMonth;

      if (nextYear === currentYear && nextMonth > today.getMonth()) {
        nextMonth = today.getMonth();
        setTempMonth(nextMonth);
      }

      const nextMaxDay = getDaysInMonth(nextYear, nextMonth);

      setTempDay((oldDay) => Math.min(oldDay, nextMaxDay));

      return nextYear;
    });
  };

  const handleConfirm = () => {
    if (selectedDateIsFuture) return;
    onConfirm(selectedDateValue);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.smallBirthdaySheet}>
          <Text style={[styles.modalTitle, sinFont]}>{t("selectBirthday")}</Text>

          <View style={styles.selectedBirthdayBox}>
            <Text style={[styles.selectedBirthdayLabel, sinFont]}>
              {t("birthday")}
            </Text>

            <Text
              style={[
                styles.selectedBirthdayText,
                selectedDateIsFuture && styles.futureDateText,
              ]}
            >
              {selectedDateValue}
            </Text>

            {selectedDateIsFuture && (
              <Text style={[styles.birthdayWarning, sinFont]}>
                {t("futureDateWarning")}
              </Text>
            )}
          </View>

          <View style={styles.compactPickerRow}>
            <DatePartStepper
              label="Day"
              value={String(tempDay).padStart(2, "0")}
              onMinus={() => changeDay(-1)}
              onPlus={() => changeDay(1)}
            />

            <DatePartStepper
              label="Month"
              value={MONTH_NAMES[tempMonth]}
              onMinus={() => changeMonth(-1)}
              onPlus={() => changeMonth(1)}
              wide
            />

            <DatePartStepper
              label="Year"
              value={String(tempYear)}
              onMinus={() => changeYear(-1)}
              onPlus={() => changeYear(1)}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.confirmBirthdayButton,
              selectedDateIsFuture && styles.confirmBirthdayButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={selectedDateIsFuture}
            activeOpacity={0.85}
          >
            <Text style={[styles.confirmBirthdayText, sinFont]}>
              {t("confirmBirthday")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButtonLight}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[styles.closeButtonLightText, sinFont]}>
              {t("close")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const DatePartStepper = ({ label, value, onMinus, onPlus, wide = false }) => {
  return (
    <View style={[styles.datePartBox, wide && styles.datePartBoxWide]}>
      <Text style={styles.datePartLabel}>{label}</Text>

      <TouchableOpacity
        style={styles.datePartButton}
        onPress={onPlus}
        activeOpacity={0.85}
      >
        <Text style={styles.datePartButtonText}>+</Text>
      </TouchableOpacity>

      <View style={styles.datePartValueBox}>
        <Text style={styles.datePartValue} numberOfLines={1}>
          {value}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.datePartButton}
        onPress={onMinus}
        activeOpacity={0.85}
      >
        <Text style={styles.datePartButtonText}>−</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Styles (design unchanged from original) ────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#BFE7FF",
  },

  background: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  formCard: {
    width: "100%",
    maxWidth: 430,
    alignItems: "center",
  },

  titleWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 45,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "#1E40AF",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    textAlign: "center",
  },

  highlight: {
    color: "#FFD600",
    textShadowColor: "#FF6F00",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  errorBox: {
    width: "100%",
    backgroundColor: "rgba(255,59,48,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.4)",
  },

  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginVertical: 6,
    height: 50,
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  icon: {
    fontSize: 18,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E40AF",
    fontWeight: "500",
  },

  selectText: {
    flex: 1,
    fontSize: 16,
    color: "#1E40AF",
    fontWeight: "500",
  },

  placeholderText: {
    color: "#64748B",
  },

  dropdownArrow: {
    fontSize: 14,
    color: "#1E40AF",
    marginLeft: 8,
  },

  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    marginBottom: 8,
    gap: 12,
  },

  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  genderSelected: {
    borderColor: "#1B7EEF",
    backgroundColor: "rgba(27,126,239,0.12)",
  },

  genderIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  genderIcon: {
    fontSize: 18,
  },

  genderLabel: {
    fontSize: 17,
    color: "#1E293B",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  submitButton: {
    backgroundColor: "#1B7EEF",
    paddingVertical: 0,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    height: 52,
  },

  disabledButton: {
    opacity: 0.7,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  signinText: {
    fontSize: 14,
    color: "#334155",
    marginTop: 12,
    marginBottom: 5,
    textAlign: "center",
  },

  signinLink: {
    color: "#1B7EEF",
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  dropdownSheet: {
    width: "100%",
    maxWidth: 430,
    maxHeight: height * 0.75,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },

  smallBirthdaySheet: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1E40AF",
    textAlign: "center",
    marginBottom: 14,
  },

  dropdownList: {
    maxHeight: height * 0.52,
  },

  dropdownEmptyBox: {
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },

  dropdownEmptyText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  dropdownItem: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownItemSelected: {
    backgroundColor: "rgba(27,126,239,0.14)",
    borderWidth: 1,
    borderColor: "#1B7EEF",
  },

  dropdownItemText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },

  dropdownItemTextSelected: {
    color: "#1B7EEF",
    fontWeight: "800",
  },

  checkText: {
    fontSize: 18,
    color: "#1B7EEF",
    fontWeight: "900",
  },

  closeButton: {
    backgroundColor: "#1B7EEF",
    borderRadius: 18,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  selectedBirthdayBox: {
    backgroundColor: "#E0F2FE",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(27,126,239,0.2)",
  },

  selectedBirthdayLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "700",
    marginBottom: 4,
  },

  selectedBirthdayText: {
    fontSize: 22,
    color: "#1B7EEF",
    fontWeight: "900",
  },

  futureDateText: {
    color: "#FF3B30",
  },

  birthdayWarning: {
    marginTop: 4,
    color: "#FF3B30",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  compactPickerRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 8,
  },

  datePartBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  datePartBoxWide: {
    flex: 1.35,
  },

  datePartLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "800",
    marginBottom: 6,
  },

  datePartButton: {
    width: 32,
    height: 28,
    borderRadius: 12,
    backgroundColor: "#1B7EEF",
    alignItems: "center",
    justifyContent: "center",
  },

  datePartButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 22,
  },

  datePartValueBox: {
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  datePartValue: {
    color: "#1E40AF",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },

  confirmBirthdayButton: {
    height: 48,
    backgroundColor: "#1B7EEF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  confirmBirthdayButtonDisabled: {
    backgroundColor: "#94A3B8",
  },

  confirmBirthdayText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  closeButtonLight: {
    height: 44,
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  closeButtonLightText: {
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "800",
  },
});


