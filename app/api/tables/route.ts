import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const selection = searchParams.get("selection") || "";
  const pagina = parseInt(searchParams.get("page") || "1");

  const { data, error } = await supabase.rpc(selection, {
    pagina: pagina,
    filas_por_pagina: 4,
  });

  if (error) {
    console.error("Error: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(
    (selection === "get_empleados_paginados"
      ? "Empleados recibidos: "
      : selection === "get_cuadrillas_paginadas"
        ? "Cuadrillas recibidas: "
        : null) + JSON.stringify(data),
  );

  return NextResponse.json({
    data: data,
    totalFilas: data[0]?.total_filas || 0,
    pagesTotal: data[0]?.total_paginas || 0,
    paginaActual: pagina,
  });
}

export async function POST(request: Request) {
  const info = await request.json();
  const values = info?.data;
  const selection = info?.selection;

  const { data, error } = await supabase.rpc(selection, values);

  if (error) {
    console.log("Error: " + error);
    return NextResponse.json({ error: error }, { status: 500 });
  }

  console.log(
    (selection === "get_empleados_paginados"
      ? "Empleado creado: "
      : selection === "get_cuadrillas_paginadas"
        ? "Cuadrilla creada: "
        : null) + JSON.stringify(data),
  );

  return NextResponse.json(data);
}
