// pages/index.js
import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

export default async function Home() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = !!session;
  if (!isLoggedIn) {
    redirect("/login");
  }
}
