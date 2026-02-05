// components/Register.js
import RegisterForm from "@/components/RegisterForm";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";

export default async function Register() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div>
      <h2>Registrarse</h2>
      <RegisterForm />
    </div>
  );
}
