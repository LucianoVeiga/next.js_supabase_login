import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import LoginForm from "@/components/LoginForm";

export default async function Login() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
