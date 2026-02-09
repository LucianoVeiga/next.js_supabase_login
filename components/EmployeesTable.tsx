"use client";

import { useState, useEffect } from "react";
import { GET, POST } from "@/lib/routes";

interface Employee {
  id: string;
  numero: number;
  nombre: string;
  apellido: string;
  created_at?: string;
}

export default function Tables() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [actualPage, setActualPage] = useState(1);
  const [pagesTotal, setPagesTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState(false);

  async function createRow(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const dataToSend = {
      numero: Number(formData.get("number")),
      nombre: formData.get("name") as string,
      apellido: formData.get("lastname") as string,
    };
    try {
      const response = await POST(dataToSend, "create_new_empleado");
      if (response) {
        const nuevo: Employee = await response;
        setVisibility(false);
        setEmployees([...employees, nuevo]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadEmployees() {
      setLoading(true);

      try {
        const response = await GET(actualPage, "get_empleados_paginados");
        const result = await response;

        if (result) {
          setEmployees(result.data);
          setPagesTotal(result.pagesTotal);
        }
      } catch (error) {
        console.error("Error cargando empleados: " + error);
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, [actualPage]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Número</th>
          </tr>
        </thead>
        <tbody>
          {employees && employees.length > 0 ? (
            employees.map((i) => (
              <tr key={i.id}>
                <td>{i.numero}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No hay empleados</td>
            </tr>
          )}
        </tbody>
      </table>

      <div>
        <button
          onClick={() => setActualPage((p) => Math.max(1, p - 1))}
          disabled={actualPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {actualPage} de {pagesTotal}
        </span>
        <button
          onClick={() => setActualPage((p) => Math.min(pagesTotal, p + 1))}
          disabled={actualPage === pagesTotal}
        >
          Siguiente
        </button>
      </div>
      <button onClick={() => setVisibility(!visibility)}>Crear empleado</button>
      {visibility ? (
        <form onSubmit={createRow}>
          <input name="number" placeholder="numero" />
          <input name="name" placeholder="nombre" />
          <input name="lastname" placeholder="apellido" />
          <button type="submit">Crear</button>
        </form>
      ) : null}
    </div>
  );
}
