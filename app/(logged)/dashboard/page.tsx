import { createClient } from "@/app/utils/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <hr />
      <p>Bienvenido, {user.email}</p>
      <LogoutButton />
    </div>
  );
}