import CrewsTable from "@/components/CrewsTable";
import { createClient } from "@/app/utils/supabase/server";
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
      <h1>Cuadrillas</h1>
      <hr />
      <CrewsTable />
      <hr />
    </div>
  );
}
