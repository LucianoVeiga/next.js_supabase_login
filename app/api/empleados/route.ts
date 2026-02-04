import { createClient } from '../../utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const pagina = parseInt(searchParams.get('pagina') || '1')

  // Verificar sesión
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Session:', session)

  const { data, error } = await supabase
    .rpc('get_empleados_paginados', {
      pagina: pagina,
      filas_por_pagina: 4
    })

  if (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    empleados: data || [],
    totalFilas: data[0]?.total_filas || 0,
    totalPaginas: data[0]?.total_paginas || 0,
    paginaActual: pagina
  })
}