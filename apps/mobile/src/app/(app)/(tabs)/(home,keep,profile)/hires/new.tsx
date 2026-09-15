import { router } from "expo-router";
import { HirePostForm } from "@/components/post-form";
import { Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useUser } from "@/lib/data";

export default function NewHire() {
  const { user } = useAuth();
  // Waits for the profile: the form reads its starting values once.
  const { data: profile, loading } = useUser(user?.uid);
  if (loading) return <Loading />;

  const contact = { email: profile?.email || user?.email || "", phone: profile?.phone ?? "" };

  return (
    <HirePostForm
      initial={contact}
      contact={contact}
      submitLabel="ลงประกาศ"
      onSubmit={async (data) => {
        const { id } = await api.createPost("hire", data);
        router.replace(`/hires/${id}`);
      }}
    />
  );
}
