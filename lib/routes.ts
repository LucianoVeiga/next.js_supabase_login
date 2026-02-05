"use server";

import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface Employee {
  id?: string;
  numero: number;
  nombre: string;
  apellido: string;
  created_at?: string;
}

interface Crew {
  id?: string;
  numero: number;
  created_at?: string;
}

export async function GET(page: number, selection: string) {

  const { data, error } = await supabase.rpc(selection, {
    pagina: page,
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
    paginaActual: page,
  });
}

export async function POST(values: Employee | Crew, selection: string) {
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
