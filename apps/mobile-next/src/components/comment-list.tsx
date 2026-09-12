import { Ionicons } from "@expo/vector-icons";
import type { PostKind } from "@jobapp-platform/shared";
import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { type CommentDoc, fullName, useComments, useUsers } from "@/lib/data";
import { Avatar } from "./media";

const MAX_LENGTH = 100;

export function CommentList({ kind, postId }: { kind: PostKind; postId: string }) {
  const { user } = useAuth();
  const { data: comments = [] } = useComments(kind, postId);
  const { byId } = useUsers();
  const me = user ? byId.get(user.uid) : undefined;

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const comment = text.trim();
    if (!comment) return;
    setSending(true);
    try {
      await api.addComment(kind, postId, comment);
      setText("");
    } catch (error) {
      Alert.alert("ส่งความคิดเห็นไม่สำเร็จ", (error as Error).message);
    } finally {
      setSending(false);
    }
  };

  const confirmDelete = (c: CommentDoc) =>
    Alert.alert("ลบความคิดเห็นนี้?", c.comment, [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () =>
          api.deleteComment(kind, c.id).catch((error) => Alert.alert("ลบไม่สำเร็จ", error.message)),
      },
    ]);

  return (
    <View>
      <Text className="mb-3 text-lg font-bold text-primary">ความคิดเห็น ({comments.length})</Text>

      <View className="mb-5 flex-row items-center">
        <Avatar uri={me?.imageUrl} name={fullName(me)} size="sm" />
        <TextInput
          className="mx-3 h-11 flex-1 rounded-full border border-border bg-background px-4 text-base text-text"
          placeholder="แสดงความคิดเห็น..."
          placeholderTextColor="#94A3B8"
          value={text}
          onChangeText={setText}
          maxLength={MAX_LENGTH}
          returnKeyType="send"
          onSubmitEditing={send}
          editable={!sending}
        />
        <TouchableOpacity
          className="h-11 w-11 items-center justify-center rounded-full bg-primary"
          style={{ opacity: text.trim() ? 1 : 0.4 }}
          onPress={send}
          disabled={sending || !text.trim()}
          accessibilityLabel="ส่งความคิดเห็น"
        >
          {sending ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="send" size={18} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>

      {comments.length === 0 ? <Text className="text-text-subtle">ยังไม่มีความคิดเห็น</Text> : null}
      {comments.map((c) => {
        const author = byId.get(c.userId);
        return (
          <View key={c.id} className="mb-4 flex-row">
            <Link href={`/users/${c.userId}`} asChild>
              <TouchableOpacity>
                <Avatar uri={author?.imageUrl} name={fullName(author)} size="sm" />
              </TouchableOpacity>
            </Link>
            <View className="ml-3 flex-1 rounded-2xl bg-background px-4 py-3">
              <View className="flex-row items-start justify-between">
                <Text className="flex-1 font-bold text-text">{fullName(author)}</Text>
                {c.userId === user?.uid ? (
                  <TouchableOpacity onPress={() => confirmDelete(c)} hitSlop={8} accessibilityLabel="ลบความคิดเห็น">
                    <Ionicons name="trash-outline" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>
              <Text className="mt-1 text-text">{c.comment}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
