import { router } from "expo-router";
import { JobPostForm } from "@/components/post-form";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function NewJob() {
  const { user } = useAuth();

  return (
    <JobPostForm
      initial={{ email: user?.email ?? "" }}
      submitLabel="ลงประกาศ"
      onSubmit={async (data) => {
        const { id } = await api.createPost("find", data);
        router.replace(`/jobs/${id}`);
      }}
    />
  );
}
