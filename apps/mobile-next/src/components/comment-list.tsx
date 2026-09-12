import type { PostKind } from "@jobapp-platform/shared";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { fullName, useComments, useUsers } from "@/lib/data";
import { Avatar } from "./media";

export function CommentList({ kind, postId }: { kind: PostKind; postId: string }) {
  const { data: comments = [] } = useComments(kind, postId);
  const { byId } = useUsers();

  return (
    <View>
      <Text className="mb-3 text-lg font-bold text-primary">ความคิดเห็น ({comments.length})</Text>
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
              <Text className="font-bold text-text">{fullName(author)}</Text>
              <Text className="mt-1 text-text">{c.comment}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
