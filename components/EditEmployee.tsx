"use client";

import { useState } from "react";

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

export default function EditEmployee({employee, crew}: {employee: Employee, crew: number}) {
  const [newEmployee, setNewEmployee] = useState<Employee>(employee);
  const [visibility, setVisibility] = useState(false);

  const cancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNewEmployee(employee);
    setVisibility(false);
  };

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    setNewEmployee((prev) => ({
      ...prev,
      numero: Number(data.numero),
      nombre: data.name as string,
      apellido: data.lastname as string,
      crew: data.crew ? Number(data.crew) : null,
    }));
    setVisibility(false);
  };

  return (
    <form
      onSubmit={save}
      onChange={() => setVisibility(true)}
      className="editform"
    >
      <div>
        Nombre: <input name="name" defaultValue={newEmployee.nombre}></input>
        Apellido: <input name="lastname" defaultValue={newEmployee.apellido}></input>
      </div>
      <div>
      Cuadrilla:
        <select name="crew" defaultValue={crew ?? ""}>
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
          <button type="submit" className="button">Guardar</button>
        </div>
      ) : null}
    </form>
  );
}
