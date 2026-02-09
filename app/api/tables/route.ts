import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

const FILAS_POR_PAGINA = 4;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const selection = searchParams.get("selection");
  const pagina = parseInt(searchParams.get("page") || "1", 10);

  if (!selection) {
    return NextResponse.json(
      { error: "selection es requerido" },
      { status: 400 }
    );
  }

  // mapear selection → tabla
  const table =
    selection === "get_empleados_paginados"
      ? "empleados"
      : selection === "get_cuadrillas_paginadas"
        ? "cuadrillas"
        : null;

  if (!table) {
    return NextResponse.json(
      { error: "selection inválido" },
      { status: 400 }
    );
  }

  const from = (pagina - 1) * FILAS_POR_PAGINA;
  const to = from + FILAS_POR_PAGINA - 1;

  const { data, error, count } = await supabase
  .from(table)
  .select("id, numero, nombre, apellido", { count: "exact" })
  .range(from, to);


  if (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalFilas = count ?? 0;
  const pagesTotal = Math.ceil(totalFilas / FILAS_POR_PAGINA);

  console.log(
    `${table} recibidos: ${JSON.stringify(data)}`
  );

  return NextResponse.json({
    data,
    totalFilas,
    pagesTotal,
    paginaActual: pagina,
  });
}

