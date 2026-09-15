import { router } from "expo-router";
import { JOB_DEFAULTS, JobPostForm } from "@/components/post-form";
import { Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useUser } from "@/lib/data";

export default function NewJob() {
  const { user } = useAuth();
  // Waits for the profile: the form reads its starting values once.
  const { data: profile, loading } = useUser(user?.uid);
  if (loading) return <Loading />;

  const company = {
    name: profile?.companyName ?? "",
    location: profile?.companyLocation ?? "",
    email: profile?.companyEmail || profile?.email || user?.email || "",
    phone: profile?.companyPhone || profile?.phone || "",
  };

  return (
    <JobPostForm
      initial={{ ...JOB_DEFAULTS, agency: company.name, location: company.location, email: company.email, phone: company.phone }}
      company={company}
      submitLabel="ลงประกาศ"
      onSubmit={async (data) => {
        const { id } = await api.createPost("find", data);
        router.replace(`/jobs/${id}`);
      }}
    />
  );
}
