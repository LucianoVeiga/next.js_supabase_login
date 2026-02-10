"use client";

import { useState, useEffect, useRef } from "react";
import { getEmployees, postEmployee } from "@/lib/routes";
import EditEmployee from "./EditEmployee";

interface Employee {
  id: string;
  numero: number;
  nombre: string;
  apellido: string;
  created_at?: string;
}

export default function EmployeesTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [actualPage, setActualPage] = useState(1);
  const [pagesTotal, setPagesTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [error, setError] = useState("");
  const [panelVisibility, setPanelVisibility] = useState(-1);

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
      const response = await postEmployee(dataToSend);
      if (response) {
        const nuevo: Employee = await response;
        setEmployees([...employees, nuevo]);
        setVisibility(false);
        setError("");
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Ocurrio un error inesperado";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadEmployees() {
      setLoading(true);

      try {
        const response = await getEmployees(actualPage);
        const result = await response;

        if (result?.data && result?.pagesTotal) {
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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (numero: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPanelVisibility(numero);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setPanelVisibility(-1);
    }, 1000);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Nombre</th>
            <th>Apellido</th>
          </tr>
        </thead>
        <tbody>
          {employees && employees.length > 0 ? (
            employees.map((i) => (
              <tr
                key={i.id}
                onMouseEnter={() => handleMouseEnter(Number(i.numero))}
                onMouseLeave={handleMouseLeave}
              >
                <td>{i.numero}</td>
                <td>{i.nombre}</td>
                <td>{i.apellido}</td>
                {panelVisibility === Number(i.numero) ? (
                  <td
                    onMouseLeave={() => {
                      if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    }}
                  >
                    <EditEmployee employee={i} crew={5} />
                  </td>
                ) : null}
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
        <div>
          <form onSubmit={createRow}>
            <input name="number" placeholder="numero" />
            <input name="name" placeholder="nombre" />
            <input name="lastname" placeholder="apellido" />
            <button type="submit">Crear</button>
          </form>
          {loading ? <div>Cargando...</div> : null}
          <p>{error}</p>
        </div>
      ) : null}
    </div>
  );
}
