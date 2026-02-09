"use client";
import { useState, useEffect } from "react";

interface Employee {
  id: string;
  numero: number;
  nombre: string;
  apellido: string;
  created_at?: string;
}
interface Crew {
  id: string;
  numero: number;
  created_at?: string;
}

export default function Tables({ required }: { required: string }) {
  const [array, setArray] = useState<Employee[] | Crew[]>([]);
  const [actualPage, setActualPage] = useState(1);
  const [pagesTotal, setPagesTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState(false);

  async function createRow(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    let dataToSend;
    if (required === "empleados") {
      dataToSend = {
        number: Number(formData.get("number")),
        name: formData.get("name") as string,
        lastname: formData.get("lastname") as string,
      };
    } else if (required === "cuadrillas") {
      dataToSend = {
        number: Number(formData.get("number")),
        name: formData.get("name") as string,
      };
    } else {
      return;
    }
    try {
      const response = await fetch(`/api/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          data: dataToSend,
          selection:
            required === "empleados"
              ? "create_new_empleado"
              : required === "cuadrillas"
                ? "create_new_cuadrilla"
                : "",
        }),
      });
      if (response.ok) {
        const nuevo: Employee | Crew = await response.json();
        setVisibility(false);
        setArray([...array, nuevo]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadArray() {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/tables?page=${actualPage}&selection=${
            required === "empleados"
              ? "get_empleados_paginados"
              : required === "cuadrillas"
                ? "get_cuadrillas_paginadas"
                : ""
          }`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const result = await response.json();

        if (result && result.data) {
          setArray(result.data);
          setPagesTotal(result.pagesTotal);
        }
      } catch (error) {
        console.error(
          required === "empleados"
            ? "Error cargando empleados:"
            : required === "cuadrillas"
              ? "Error cargando cuadrillas:"
              : null,
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadArray();
  }, [actualPage, required]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
        <tbody>
      {array.length > 0 ? (
        array.map((i) => (
          <tr key={i.id}>
            {required === "empleados" ? (
              <>
                <td>{(i as Employee).numero}</td>
                <td>{(i as Employee).nombre}</td>
                <td>{(i as Employee).apellido}</td>
              </>
            ) : required === "cuadrillas" ? (
              <>
                <td>{(i as Crew).numero}</td>
                <td>-</td>
                <td>-</td>
              </>
            ) : null}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={3}>
            {required === "empleados"
              ? "No hay empleados"
              : required === "cuadrillas"
                ? "No hay cuadrillas"
                : null}
          </td>
        </tr>
      )}
  </tbody>

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
      <button onClick={() => setVisibility(!visibility)}>
        {required === "empleados"
          ? "Crear empleado"
          : required === "cuadrillas"
            ? "Crear cuadrilla"
            : null}
      </button>
      {visibility ? (
        <form onSubmit={createRow}>
          <input name="number" placeholder="numero"></input>
          <input name="name" placeholder="nombre" />
          <input name="lastname" placeholder="apellido" />{" "}
          <button type="submit">Crear</button>
        </form>
      ) : null}
    </div>
  );
}
