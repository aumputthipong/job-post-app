import { Ionicons } from "@expo/vector-icons";
import { isPdf, type UserProfile } from "@jobapp-platform/shared";
import * as DocumentPicker from "expo-document-picker";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { api } from "@/lib/api";
import { ImageViewer } from "./image-carousel";
import { colors } from "@/lib/colors";

type Resume = NonNullable<UserProfile["resume"]>;

/** Opens the résumé: a PDF in the in-app browser, an image full screen. */
export function ResumeButton({ resume }: { resume: Resume }) {
  const [viewing, setViewing] = useState(false);
  const pdf = isPdf(resume.url);

  const open = () => {
    if (pdf) WebBrowser.openBrowserAsync(resume.url);
    else setViewing(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={open}
        activeOpacity={0.8}
        className="flex-row items-center rounded-xl border border-border bg-background p-4"
      >
        <Ionicons name={pdf ? "document-text-outline" : "image-outline"} size={28} color={colors.primary.DEFAULT} />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-text" numberOfLines={1}>
            {resume.name || (pdf ? "เรซูเม่.pdf" : "เรซูเม่")}
          </Text>
          <Text className="text-sm text-text-subtle">แตะเพื่อเปิด</Text>
        </View>
        <Ionicons name="open-outline" size={20} color={colors.placeholder} />
      </TouchableOpacity>
      {pdf ? null : (
        <ImageViewer images={[{ url: resume.url }]} start={viewing ? 0 : undefined} onClose={() => setViewing(false)} />
      )}
    </>
  );
}

/** The owner's view: upload, replace or remove. Saves as soon as a file is picked. */
export function ResumeEditor({ resume }: { resume?: Resume | null }) {
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      // Expo Go can't read the picker's cache copy ("Missing 'READ' permission");
      // the original content:// uri reads fine.
      copyToCacheDirectory: false,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    setBusy(true);
    try {
      const { url, publicId } = await api.uploadImage(file.uri, "resumes");
      await api.updateMe({ resume: { url, publicId, name: file.name } });
    } catch (e) {
      Alert.alert("อัปโหลดเรซูเม่ไม่สำเร็จ", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = () =>
    Alert.alert("ลบเรซูเม่?", undefined, [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await api.updateMe({ resume: null });
          } catch (e) {
            Alert.alert("ลบไม่สำเร็จ", (e as Error).message);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  if (busy) {
    return (
      <View className="h-20 flex-row items-center justify-center rounded-xl bg-background">
        <ActivityIndicator color={colors.primary.DEFAULT} />
        <Text className="ml-3 text-text-subtle">กำลังบันทึก...</Text>
      </View>
    );
  }

  if (!resume) {
    return (
      <TouchableOpacity
        onPress={pick}
        activeOpacity={0.8}
        className="h-20 flex-row items-center justify-center rounded-xl border border-dashed border-border bg-background"
      >
        <Ionicons name="cloud-upload-outline" size={24} color={colors.placeholder} />
        <Text className="ml-2 text-text-subtle">อัปโหลดเรซูเม่ (PDF หรือรูปภาพ)</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <ResumeButton resume={resume} />
      <View className="mt-3 flex-row">
        <TouchableOpacity onPress={pick} className="mr-5 flex-row items-center py-1" hitSlop={8}>
          <Ionicons name="swap-horizontal-outline" size={18} color={colors.primary.DEFAULT} />
          <Text className="ml-1 font-semibold text-primary-dark">เปลี่ยนไฟล์</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={remove} className="flex-row items-center py-1" hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.danger.DEFAULT} />
          <Text className="ml-1 font-semibold text-danger">ลบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
