"use client";

import { updateEmployee } from "@/lib/routes";
import { Dispatch, SetStateAction, useState } from "react";

interface Employee {
  id: string;
  numero: number;
  nombre: string;
  apellido: string;
  created_at?: string;
}

// const employee = {
//   numero: 44,
//   nombre: "Lautaro",
//   apellido: "Boffi",
//   crew: null,
// };

const crews = [
  { id: 1, nombre: "avengers" },
  { id: 2, nombre: "suicidesquad" },
  { id: 3, nombre: "virgins" },
];

export default function EditEmployee({
  employee,
  setEmployees,
  handleClose,
}: {
  employee: Employee;
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  handleClose: () => void;
}) {
  const [newEmployee, setNewEmployee] = useState<Employee>(employee);
  const [visibility, setVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const cancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNewEmployee(employee);
    setVisibility(false);
  };

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await updateEmployee(employee.id as string, {
        numero: Number(employee.numero),
        nombre: data.name as string,
        apellido: data.lastname as string,
      });
      if (res) {
        setNewEmployee((prev) => ({
          ...prev,
          nombre: data.name as string,
          apellido: data.lastname as string,
          crew: data.crew ? Number(data.crew) : null,
        }));
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === employee.id ? { ...e, ...newEmployee } : e,
          ),
        );
        setVisibility(false);
        setMessage("");
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Ocurrio un error inesperado";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="overlay" onClick={handleClose}></div>
      <form
        onSubmit={save}
        onChange={() => setVisibility(true)}
        className="editform"
      >
        <button onClick={handleClose}>x</button>
        <div>
          Nombre:{" "}
          <input
            name="name"
            value={newEmployee.nombre}
            onChange={(e) =>
              setNewEmployee((prev) => ({ ...prev, nombre: e.target.value }))
            }
          ></input>
          Apellido:
          <input
            name="lastname"
            value={newEmployee.apellido}
            onChange={(e) =>
              setNewEmployee((prev) => ({ ...prev, apellido: e.target.value }))
            }
          ></input>
        </div>
        <div>
          Cuadrilla:
          <select
            name="crew"
            defaultValue={5}
            onChange={(e) =>
              setNewEmployee((prev) => ({ ...prev, crew: e.target.value }))
            }
          >
            <option value="">Sin cuadrilla</option>
            {crews && crews.length > 0
              ? crews.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre}
                  </option>
                ))
              : null}
          </select>
        </div>
        {visibility ? (
          <div>
            <button type="button" onClick={cancel} className="button">
              Cancelar
            </button>
            <button type="submit" className="button">
              Guardar
            </button>
          </div>
        ) : null}
        {loading ? <div>Cargando...</div> : null}
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
