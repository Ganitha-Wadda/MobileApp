import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { selectAuthToken } from "../app/features/authSlice";
import {
  useEnrollmentStatus,
  useGetAvailableBatchesByGradeQuery,
  useSubmitEnrollmentMutation,
} from "../app/features/enrollmentApi";
import useT from "../app/i18n/useT";

const EMPTY_PROFILE = {};

const getProfile = (state) => {
  const rawProfile =
    state.user?.user ??
    state.user?.profile ??
    state.user?.data ??
    state.auth?.user ??
    EMPTY_PROFILE;

  return rawProfile?.user ?? rawProfile?.profile ?? rawProfile ?? EMPTY_PROFILE;
};

const getGradeNumber = (grade) => {
  if (!grade) return "";

  if (typeof grade === "number") return String(grade);

  if (typeof grade === "string") {
    const match = grade.match(/\d+/);
    return match?.[0] ?? grade;
  }

  if (typeof grade === "object") {
    const value = grade.gradeId ?? grade.grade ?? grade.gradeNumber ?? "";
    return value ? String(value) : "";
  }

  return "";
};

const getBatchNumber = (profile) =>
  String(
    profile?.batchnumber ??
      profile?.batchNumber ??
      profile?.batchYear ??
      profile?.batch ??
      profile?.batch_number ??
      ""
  ).trim();

const gradeOptions = ["3", "4", "5"];

const normalizeBatchValue = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

const sortTextNumber = (a, b) =>
  String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });

const getClassBatchNumber = (item = {}) =>
  normalizeBatchValue(
    item?.batchnumber ??
      item?.batchNumber ??
      item?.batchNo ??
      item?.batch ??
      item?.batch_number ??
      ""
  );

const uniqueSortedBatches = (values = []) =>
  [...new Set(values.map(normalizeBatchValue).filter(Boolean))].sort(
    sortTextNumber
  );

const extractAvailableBatches = (payload = {}, selectedGrade = "") => {
  const gradeKey = String(selectedGrade || "").trim();
  const root = payload?.data ?? payload;

  const directList = Array.isArray(payload)
    ? payload
    : Array.isArray(root)
    ? root
    : null;

  const batchesByGrade =
    root?.batchesByGrade ??
    root?.batchNumbersByGrade ??
    payload?.batchesByGrade ??
    payload?.batchNumbersByGrade ??
    {};

  const possibleLists = [
    directList,
    root?.batches,
    root?.batchnumbers,
    root?.batchNumbers,
    root?.availableBatches,
    root?.data?.batches,
    root?.data?.batchnumbers,
    root?.data?.batchNumbers,
    root?.data?.availableBatches,
    batchesByGrade?.[gradeKey],
    batchesByGrade?.[Number(gradeKey)],
  ];

  for (const list of possibleLists) {
    if (Array.isArray(list) && list.length > 0) {
      return uniqueSortedBatches(list);
    }
  }

  const classes =
    [root?.classes, root?.data?.classes, payload?.classes].find((list) =>
      Array.isArray(list)
    ) ?? [];

  return uniqueSortedBatches(classes.map(getClassBatchNumber));
};

function SelectBox({
  label,
  placeholder,
  value,
  options,
  onSelect,
  disabled = false,
  loading = false,
  emptyText = "No options available",
  sinFont = {},
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.selectWrap}>
      {!!label && <Text style={[styles.inputLabel, sinFont]}>{label}</Text>}

      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
        activeOpacity={0.85}
        disabled={disabled}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text style={[styles.selectButtonText, !value && styles.placeholderText, sinFont]}>
          {value || placeholder}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#7C3AED" />
        ) : (
          <Text style={styles.selectArrow}>{open ? "▲" : "▼"}</Text>
        )}
      </TouchableOpacity>

      {open && !disabled && (
        <View style={styles.dropdownBox}>
          {options.length > 0 ? (
            <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
              {options.map((item) => (
                <TouchableOpacity
                  key={String(item)}
                  style={[
                    styles.dropdownItem,
                    String(item) === String(value) && styles.dropdownItemActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    onSelect(String(item));
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      String(item) === String(value) &&
                        styles.dropdownItemTextActive,
                      sinFont,
                    ]}
                  >
                    {String(item)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={[styles.dropdownEmpty, sinFont]}>{emptyText}</Text>
          )}
        </View>
      )}
    </View>
  );
}

export function EnrollmentModal({ visible, onClose }) {
  const authToken = useSelector(selectAuthToken);
  const profile = useSelector(getProfile);
  const { t, sinFont } = useT();

  const defaults = useMemo(
    () => ({
      name: String(profile?.name ?? ""),
      phone: String(profile?.phonenumber ?? profile?.phone ?? ""),
      grade: getGradeNumber(profile?.grade),
      batchnumber: getBatchNumber(profile),
    }),
    [profile]
  );

  const [name, setName] = useState(defaults.name);
  const [phone, setPhone] = useState(defaults.phone);
  const [grade, setGrade] = useState(defaults.grade);
  const [batchnumber, setBatchnumber] = useState(defaults.batchnumber);
  const [message, setMessage] = useState("");

  const {
    data: batchesData,
    isLoading: isBatchesLoading,
    isFetching: isBatchesFetching,
    isError: isBatchesError,
    error: batchesError,
    refetch: refetchBatches,
  } = useGetAvailableBatchesByGradeQuery(grade, {
    skip: !grade || !authToken,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const availableBatches = useMemo(
    () => extractAvailableBatches(batchesData, grade),
    [batchesData, grade]
  );

  const [submitEnrollment, { isLoading }] = useSubmitEnrollmentMutation();

  useEffect(() => {
    if (visible) {
      setName(defaults.name);
      setPhone(defaults.phone);
      setGrade(defaults.grade);
      setBatchnumber(defaults.batchnumber);
      setMessage("");
    }
  }, [visible, defaults.name, defaults.phone, defaults.grade, defaults.batchnumber]);

  useEffect(() => {
    if (!grade) {
      setBatchnumber("");
      return;
    }

    if (availableBatches.length > 0 && !availableBatches.includes(batchnumber)) {
      setBatchnumber("");
    }
  }, [grade, availableBatches, batchnumber]);

  const handleGradeSelect = (selectedGrade) => {
    setGrade(selectedGrade);
    setBatchnumber("");
    setMessage("");
  };

  const handleSubmit = async () => {
    setMessage("");

    if (!authToken) {
      setMessage(t("enrollmentUnauthorized"));
      return;
    }

    if (!name.trim() || !phone.trim() || !grade || !batchnumber.trim()) {
      setMessage(t("enrollmentFormError"));
      return;
    }

    try {
      const res = await submitEnrollment({
        name: name.trim(),
        phone: phone.trim(),
        grade: Number(grade),
        batchnumber: batchnumber.trim(),
      }).unwrap();

      setMessage(res?.message || t("enrollmentSubmitSuccess"));
    } catch (err) {
      setMessage(
        err?.data?.message ||
          err?.error ||
          t("submissionFailed")
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={[styles.modalTitle, sinFont()]}>{t("enrollmentRequired")}</Text>
          <Text style={[styles.modalSub, sinFont()]}>
            {t("enrollmentGateSub")}
          </Text>

          <TextInput
            style={[styles.input, sinFont()]}
            placeholder={t("fullName")}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, sinFont()]}
            placeholder={t("phoneNumber")}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <SelectBox
            label={t("grade")}
            placeholder={t("selectGrade")}
            value={grade}
            options={gradeOptions}
            onSelect={handleGradeSelect}
            sinFont={sinFont()}
          />

          <SelectBox
            label={t("batchNumber")}
            placeholder={grade ? t("selectBatchNumber") : t("selectGradeFirst")}
            value={batchnumber}
            options={availableBatches}
            onSelect={(value) => {
              setBatchnumber(value);
              setMessage("");
            }}
            disabled={!grade}
            loading={isBatchesLoading || isBatchesFetching}
            emptyText={
              isBatchesError
                ? batchesError?.data?.message ||
                  batchesError?.error ||
                  t("failedToLoadBatchesRefresh")
                : grade
                ? t("noBatchesAvailableForGrade")
                : t("selectGradeFirst")
            }
            sinFont={sinFont()}
          />

          {!!grade && !!authToken && (
            <TouchableOpacity
              style={styles.refreshBatchesBtn}
              activeOpacity={0.85}
              onPress={() => {
                if (refetchBatches) refetchBatches();
              }}
            >
              <Text style={[styles.refreshBatchesText, sinFont()]}>{t("refreshBatches")}</Text>
            </TouchableOpacity>
          )}

          {!!message && <Text style={[styles.message, sinFont()]}>{message}</Text>}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.primaryBtnText, sinFont()]}>{t("submitEnrollment")}</Text>}
          </TouchableOpacity>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={[styles.closeBtnText, sinFont()]}>{t("close")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function EnrollmentGate({ children, allowWhenNotEnrolled = false }) {
  const { isLoading, isFetching, isApproved, isPending, isRejected, isNotEnrolled, refetch } =
    useEnrollmentStatus();
  const { t, sinFont } = useT();

  const [modalVisible, setModalVisible] = useState(false);

  if (isLoading || isFetching) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={[styles.loadingText, sinFont()]}>{t("checkingEnrollment")}</Text>
      </View>
    );
  }

  if (isApproved || (allowWhenNotEnrolled && isNotEnrolled)) return children;

  return (
    <View style={styles.centerScreen}>
      <Text style={styles.lockEmoji}>🔒</Text>
      <Text style={[styles.title, sinFont()]}>{t("enrollmentRequired")}</Text>
      {isPending ? (
        <Text style={[styles.sub, sinFont()]}>{t("enrollmentPendingGateSub")}</Text>
      ) : isRejected ? (
        <Text style={[styles.sub, sinFont()]}>{t("enrollmentRejectedGateSub")}</Text>
      ) : isNotEnrolled ? (
        <Text style={[styles.sub, sinFont()]}>{t("enrollmentNotEnrolledGateSub")}</Text>
      ) : (
        <Text style={[styles.sub, sinFont()]}>{t("enrollmentSubmitToContinue")}</Text>
      )}

      <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)}>
        <Text style={[styles.primaryBtnText, sinFont()]}>{isPending ? t("viewRequest") : t("enrollNowPlain")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={refetch}>
        <Text style={[styles.secondaryBtnText, sinFont()]}>{t("refreshStatus")}</Text>
      </TouchableOpacity>

      <EnrollmentModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  centerScreen: {
    flex: 1,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, color: "#6D28D9", fontWeight: "700" },
  lockEmoji: { fontSize: 58, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: "900", color: "#2E1065", marginBottom: 8 },
  sub: { fontSize: 14, lineHeight: 21, color: "#6D28D9", textAlign: "center", marginBottom: 20 },
  primaryBtn: {
    minHeight: 48,
    minWidth: 180,
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  secondaryBtn: { padding: 14 },
  secondaryBtnText: { color: "#6D28D9", fontSize: 13, fontWeight: "800" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: 21, fontWeight: "900", color: "#2E1065", marginBottom: 8 },
  modalSub: { color: "#6D28D9", lineHeight: 20, marginBottom: 14, fontWeight: "600" },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    color: "#2E1065",
    fontWeight: "700",
  },
  inputLabel: {
    fontSize: 12,
    color: "#4C1D95",
    fontWeight: "900",
    marginBottom: 6,
  },
  selectWrap: {
    marginBottom: 10,
  },
  selectButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  selectButtonDisabled: {
    backgroundColor: "#F5F3FF",
    opacity: 0.75,
  },
  selectButtonText: {
    color: "#2E1065",
    fontWeight: "800",
    flex: 1,
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  selectArrow: {
    color: "#7C3AED",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 10,
  },
  dropdownBox: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownItem: {
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F3FF",
  },
  dropdownItemActive: {
    backgroundColor: "#EDE9FE",
  },
  dropdownItemText: {
    color: "#2E1065",
    fontWeight: "800",
  },
  dropdownItemTextActive: {
    color: "#6D28D9",
    fontWeight: "900",
  },
  dropdownEmpty: {
    padding: 14,
    color: "#6D28D9",
    fontWeight: "700",
    textAlign: "center",
  },
  refreshBatchesBtn: {
    alignSelf: "flex-end",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  refreshBatchesText: {
    color: "#6D28D9",
    fontSize: 12,
    fontWeight: "900",
  },
  message: { color: "#4C1D95", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  closeBtn: { alignItems: "center", padding: 12 },
  closeBtnText: { color: "#6D28D9", fontWeight: "800" },
});



