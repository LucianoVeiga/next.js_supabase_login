'use client'
import { useState, useEffect } from 'react'

interface Empleado {
  id: string
  numero: number
  nombre: string
  apellido: string
  created_at?: string
}

export default function TablaEmpleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [loading, setLoading] = useState(true) // Cambiar a true inicialmente

  useEffect(() => {
    async function cargarEmpleados() {
      setLoading(true)
      try {
        const response = await fetch(`/api/empleados?pagina=${paginaActual}`)
        const resultado = await response.json()
        
        if (resultado && resultado.empleados) {
          setEmpleados(resultado.empleados)
          setTotalPaginas(resultado.totalPaginas)
        }
      } catch (error) {
        console.error('Error cargando empleados:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarEmpleados()
  }, [paginaActual])

  if (loading) {
    return <div>Cargando empleados...</div>
  }

  return (
    <div>
      <h1>Tabla de Empleados</h1>
      
      <table border={1}>
        <thead>
          <tr>
            <th>Número</th>
            <th>Nombre</th>
            <th>Apellido</th>
          </tr>
        </thead>
        <tbody>
          {empleados.length > 0 ? (
            empleados.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.numero}</td>
                <td>{emp.nombre}</td>
                <td>{emp.apellido}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No hay empleados</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
          disabled={paginaActual === 1}
        >
          Anterior
        </button>
        <span style={{ margin: '0 15px' }}>
          Página {paginaActual} de {totalPaginas}
        </span>
        <button 
          onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}