"use server";

import { supabase } from "@/lib/supabaseClient";

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

const FILAS_POR_PAGINA = 4;

export async function getEmployees(page: number) {
  const pagina = page || 1;

  const from = (pagina - 1) * FILAS_POR_PAGINA;
  const to = from + FILAS_POR_PAGINA - 1;

  const { data, error, count } = await supabase
    .from("empleados")
    .select("id, numero, nombre, apellido", { count: "exact" })
    .order("nombre", { ascending: true })
    .range(from, to);

  const totalFilas = count ?? 0;
  const pagesTotal = Math.ceil(totalFilas / FILAS_POR_PAGINA);

  if (error) {
    console.error("Error: ", error);
    return { error: error.message, status: 500 };
  }

  console.log("Empleados recibidos: " + JSON.stringify(data));

  return {
    data: data,
    totalFilas: totalFilas || 0,
    pagesTotal: pagesTotal || 0,
    paginaActual: pagina,
  };
}

export async function getCrews(page: number) {
  const pagina = page || 1;

  const from = (pagina - 1) * FILAS_POR_PAGINA;
  const to = from + FILAS_POR_PAGINA - 1;

  const { data, error, count } = await supabase
    .from("cuadrillas")
    .select("id, numero", { count: "exact" })
    .order("numero", { ascending: true })
    .range(from, to);

  const totalFilas = count ?? 0;
  const pagesTotal = Math.ceil(totalFilas / FILAS_POR_PAGINA);

  if (error) {
    console.error("Error: ", error);
    return { error: error.message, status: 500 };
  }

  console.log("Cuadrillas recibidas: " + JSON.stringify(data));

  return {
    data: data,
    totalFilas: totalFilas || 0,
    pagesTotal: pagesTotal || 0,
    paginaActual: pagina,
  };
}

export async function postEmployee(values: Employee) {
  const newEmployee = values;
  const { data, error } = await supabase
    .from("empleados")
    .insert(newEmployee)
    .select()
    .order("nombre", { ascending: true })
    .single();

  if (error) {
    console.log("Error: " + error);
	throw new Error(error.message || "Error al crear empleado");
  }

  console.log("Empleado creado: " + JSON.stringify(data));

  return data;
}

export async function postCrew(values: Crew) {
  const newCrew = values;
  const { data, error } = await supabase
    .from("cuardillas")
    .insert(newCrew)
    .select()
    .order("numero", { ascending: true })
    .single();

  if (error) {
    console.log("Error: " + error);
	throw new Error(error.message || "Error al crear cuadrilla");
  }

  console.log("Cuadrilla creada: " + JSON.stringify(data));

  return data;
}
