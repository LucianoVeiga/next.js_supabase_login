"use client";

import { useState, useEffect } from "react";
import { GET, POST } from "@/lib/routes";

interface Crew {
  id: string;
  numero: number;
  created_at?: string;
}

export default function CrewsTable() {
  const [crews, setCrews] = useState<Crew[]>([]);
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
	};
	try {
	  const response = await POST(dataToSend, "create_new_cuadrilla");
	  if (response) {
		const nuevo: Crew = await response;
		setVisibility(false);
		setCrews([...crews, nuevo]);
	  }
	} catch (error) {
	} finally {
	  setLoading(false);
	}
  }

  useEffect(() => {
	async function loadCrews() {
	  setLoading(true);

	  try {
		const response = await GET(actualPage, "get_cuadrillas_paginadas");
		const result = await response;

		if (result) {
		  setCrews(result.data);
		  setPagesTotal(result.pagesTotal);
		}
	  } catch (error) {
		console.error("Error cargando cuardillas: " + error);
	  } finally {
		setLoading(false);
	  }
	}

	loadCrews();
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
		  {crews && crews.length > 0 ? (
			crews.map((i) => (
			  <tr key={i.id}>
				<td>{i.numero}</td>
			  </tr>
			))
		  ) : (
			<tr>
			  <td colSpan={3}>No hay cuadrillas</td>
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
	  <button onClick={() => setVisibility(!visibility)}>Crear cuadrilla</button>
	  {visibility ? (
		<form onSubmit={createRow}>
		  <input name="number" placeholder="numero" />
		  <button type="submit">Crear</button>
		</form>
	  ) : null}
	</div>
  );
}
