import { postImages } from "@jobapp-platform/shared";
import { router, useLocalSearchParams } from "expo-router";
import { DeletePostButton, JobPostForm } from "@/components/post-form";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useJobPost } from "@/lib/data";

export default function EditJob() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, loading, error } = useJobPost(id);
  const { user } = useAuth();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!job) return <EmptyState icon="alert-circle-outline" message="ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" />;
  if (job.postById !== user?.uid) return <EmptyState icon="lock-closed-outline" message="แก้ไขได้เฉพาะประกาศของตัวเอง" />;

  return (
    <JobPostForm
      initial={job}
      initialImage={postImages(job)[0]?.url}
      submitLabel="บันทึก"
      onSubmit={async (data) => {
        await api.updatePost("find", id, data);
        router.back();
      }}
      footer={<DeletePostButton kind="find" id={id} />}
    />
  );
}
