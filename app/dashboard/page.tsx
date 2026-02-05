import Tables from "@/components/Tables";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <hr />
      <Tables required={"employees"} />
      <hr />
      <Tables required={"crews"} />
      <hr />
    </div>
  );
}
