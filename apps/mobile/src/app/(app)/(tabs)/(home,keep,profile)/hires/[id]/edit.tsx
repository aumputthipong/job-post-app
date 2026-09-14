import { postImages } from "@jobapp-platform/shared";
import { router, useLocalSearchParams } from "expo-router";
import { DeletePostButton, HirePostForm } from "@/components/post-form";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useHirePost } from "@/lib/data";

export default function EditHire() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: hire, loading, error } = useHirePost(id);
  const { user } = useAuth();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!hire) return <EmptyState icon="alert-circle-outline" message="ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" />;
  if (hire.postById !== user?.uid) return <EmptyState icon="lock-closed-outline" message="แก้ไขได้เฉพาะประกาศของตัวเอง" />;

  return (
    <HirePostForm
      initial={hire}
      initialImage={postImages(hire)[0]?.url}
      submitLabel="บันทึก"
      onSubmit={async (data) => {
        await api.updatePost("hire", id, data);
        router.back();
      }}
      footer={<DeletePostButton kind="hire" id={id} />}
    />
  );
}
