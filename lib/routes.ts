"use server";

import { supabase } from "@/lib/supabaseClient";

interface Employee {
  id?: string;
  numero: number;
  nombre: string;
  apellido: string;
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

export async function postEmployee(values: Employee) {
  const { data, error } = await supabase
    .from("empleados")
    .insert(values)
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

export async function updateEmployee(employeeId: string, newInfo: Employee) {
  const { data, error } = await supabase
    .from("empleados")
    .update({
      "numero": newInfo.numero,
      "nombre": newInfo.nombre,
      "apellido": newInfo.apellido,
    })
    .eq("id", employeeId);

  if (error) {
    console.log("Error: " + error);
    throw new Error(error.message || "Error al actualizar empleado");
  }

  console.log("Empleado actualizado: " + JSON.stringify(data));

  return true;
}
