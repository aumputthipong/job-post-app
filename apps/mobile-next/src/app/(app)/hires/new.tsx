import { router } from "expo-router";
import { HirePostForm } from "@/components/post-form";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function NewHire() {
  const { user } = useAuth();

  return (
    <HirePostForm
      initial={{ email: user?.email ?? "" }}
      submitLabel="ลงประกาศ"
      onSubmit={async (data) => {
        const { id } = await api.createPost("hire", data);
        router.replace(`/hires/${id}`);
      }}
    />
  );
}
