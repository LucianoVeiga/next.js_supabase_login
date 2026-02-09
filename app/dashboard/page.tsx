import Tables from "@/components/Tables";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <hr />
      <Tables required={"empleados"} />
      <hr />
      <Tables required={"cuadrillas"} />
      <hr />
    </div>
  );
}
