import { createClient } from '../../utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const pagina = parseInt(searchParams.get('pagina') || '1')
  const filasPorPagina = 4
  const inicio = (pagina - 1) * filasPorPagina
  const fin = inicio + filasPorPagina - 1

  // Verificar sesión
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Session:', session)

  const { data: empleados, error, count } = await supabase
    .from('empleados')
    .select('*', { count: 'exact' })
    .order('numero', { ascending: true })
    .range(inicio, fin)

  console.log('Data:', empleados)
  console.log('Error:', error)

  if (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    empleados: empleados || [],
    totalFilas: count || 0,
    totalPaginas: Math.ceil((count || 0) / filasPorPagina),
    paginaActual: pagina
  })
}