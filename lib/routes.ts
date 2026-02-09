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

export async function getEmployees(page: number) {

  const { data, error } = await supabase.rpc("get_empleados_paginados", {
    pagina: page,
    filas_por_pagina: 4,
  });

  if (error) {
    console.error("Error: ", error);
    return ({ error: error.message, status: 500 });
  }

  console.log(
    "Empleados recibidos: " + JSON.stringify(data),
  );

  return ({
    data: data,
    totalFilas: data[0]?.total_filas || 0,
    pagesTotal: data[0]?.total_paginas || 0,
    paginaActual: page,
  });
}

export async function getCrews(page: number) {

  const { data, error } = await supabase.rpc("get_cuadrillas_paginadas", {
    pagina: page,
    filas_por_pagina: 4,
  });

  if (error) {
    console.error("Error: ", error);
    return ({ error: error.message, status: 500 });
  }

  console.log(
    "Cuadrillas recibidos: " + JSON.stringify(data),
  );

  return ({
    data: data,
    totalFilas: data[0]?.total_filas || 0,
    pagesTotal: data[0]?.total_paginas || 0,
    paginaActual: page,
  });
}

export async function postEmployee(values: Employee) {
  const { data, error } = await supabase.rpc("create_new_employee", values);
  
  if (error) {
    console.log("Error: " + error);
    return ({ error: error, status: 500 });
  }

  console.log(
    "Empleado creado: " + JSON.stringify(data),
  );

  return data;
}

export async function postCrew(values: Crew) {
  const { data, error } = await supabase.rpc("create_new_cuadrilla", values);
  
  if (error) {
    console.log("Error: " + error);
    return ({ error: error, status: 500 });
  }

  console.log(
    "Cuadrilla creada: " + JSON.stringify(data),
  );

  return data;
}
