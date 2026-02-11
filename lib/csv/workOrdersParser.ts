export type RowStatus = "valid" | "warning" | "error"

export type ValidationIssue = {
  field: string
  message: string
  type: "error" | "warning"
}

export type ParsedRow = {
  rowNumber: number
  raw: Record<string, string>
  parsed: {
    title: string
    description: string | null
    status: number
    cuadrilla: number | null
    created_at: string
    updated_at: string
  } | null
  status: RowStatus
  issues: ValidationIssue[]
  selected: boolean
}

export type ParseResult = {
  rows: ParsedRow[]
  summary: {
    total: number
    valid: number
    warnings: number
    errors: number
  }
}

const STATUS_MAP: Record<string, number> = {
  abierta: 1,
  realizada: 2,
  verificada: 3,
  "1": 1,
  "2": 2,
  "3": 3,
}

const REQUIRED_COLUMNS = ["title", "status"]
const EXPECTED_COLUMNS = [
  "uuid",
  "title",
  "description",
  "status",
  "cuadrilla",
  "created_at",
  "updated_at",
]

function isValidDate(value: string): boolean {
  const date = new Date(value)
  return !isNaN(date.getTime())
}

function normalizeStatus(value: string): number | null {
  const normalized = value.trim().toLowerCase()
  return STATUS_MAP[normalized] ?? null
}

export function validateColumns(headers: string[]): {
  valid: boolean
  missing: string[]
  extra: string[]
} {
  const normalized = headers.map((h) => h.trim().toLowerCase())
  const missing = REQUIRED_COLUMNS.filter((col) => !normalized.includes(col))
  const extra = normalized.filter((col) => !EXPECTED_COLUMNS.includes(col))
  return {
    valid: missing.length === 0,
    missing,
    extra,
  }
}

export function parseCSV(
  csvText: string,
  existingCuadrillas: number[]
): ParseResult {
  const lines = csvText.trim().split("\n")

  if (lines.length < 2) {
    return {
      rows: [],
      summary: { total: 0, valid: 0, warnings: 0, errors: 0 },
    }
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const now = new Date().toISOString()

  const rows: ParsedRow[] = lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line)
    const raw: Record<string, string> = {}
    headers.forEach((header, i) => {
      raw[header] = values[i]?.trim() ?? ""
    })

    const issues: ValidationIssue[] = []

    // Validar title (obligatorio)
    if (!raw.title || raw.title.trim() === "") {
      issues.push({
        field: "title",
        message: "El título es obligatorio",
        type: "error",
      })
    }

    // Validar y normalizar status
    const statusValue = normalizeStatus(raw.status || "")
    if (!statusValue) {
      issues.push({
        field: "status",
        message: `Estado inválido: "${raw.status}". Debe ser 1, 2, 3, Abierta, Realizada o Verificada`,
        type: "error",
      })
    }

    // Validar cuadrilla
    let cuadrillaValue: number | null = null
    if (raw.cuadrilla && raw.cuadrilla.trim() !== "") {
      const cuadrillaNum = parseInt(raw.cuadrilla)

      if (isNaN(cuadrillaNum)) {
        issues.push({
          field: "cuadrilla",
          message: `Cuadrilla inválida: "${raw.cuadrilla}". Debe ser un número`,
          type: "error",
        })
      } else if (!existingCuadrillas.includes(cuadrillaNum)) {
        issues.push({
          field: "cuadrilla",
          message: `La cuadrilla ${cuadrillaNum} no existe. Se importará sin cuadrilla asignada`,
          type: "warning",
        })
        cuadrillaValue = null
      } else {
        cuadrillaValue = cuadrillaNum
      }
    } else {
      issues.push({
        field: "cuadrilla",
        message: "Sin cuadrilla asignada",
        type: "warning",
      })
    }

    // Validar fechas
    let createdAt = now
    if (raw.created_at && raw.created_at.trim() !== "") {
      if (isValidDate(raw.created_at)) {
        createdAt = new Date(raw.created_at).toISOString()
      } else {
        issues.push({
          field: "created_at",
          message: `Fecha inválida: "${raw.created_at}". Se usará la fecha actual`,
          type: "warning",
        })
      }
    }

    let updatedAt = now
    if (raw.updated_at && raw.updated_at.trim() !== "") {
      if (isValidDate(raw.updated_at)) {
        updatedAt = new Date(raw.updated_at).toISOString()
      } else {
        issues.push({
          field: "updated_at",
          message: `Fecha inválida: "${raw.updated_at}". Se usará la fecha actual`,
          type: "warning",
        })
      }
    }

    // Determinar estado de la fila
    const hasErrors = issues.some((i) => i.type === "error")
    const hasWarnings = issues.some((i) => i.type === "warning")
    const rowStatus: RowStatus = hasErrors
      ? "error"
      : hasWarnings
        ? "warning"
        : "valid"

    return {
      rowNumber: index + 2,
      raw,
      parsed: hasErrors
        ? null
        : {
            title: raw.title.trim(),
            description: raw.description?.trim() || null,
            status: statusValue!,
            cuadrilla: cuadrillaValue,
            created_at: createdAt,
            updated_at: updatedAt,
          },
      status: rowStatus,
      issues,
      selected: !hasErrors, // Pre-seleccionar válidas y warnings
    }
  })

  return {
    rows,
    summary: {
      total: rows.length,
      valid: rows.filter((r) => r.status === "valid").length,
      warnings: rows.filter((r) => r.status === "warning").length,
      errors: rows.filter((r) => r.status === "error").length,
    },
  }
}

// Parser que maneja comas dentro de comillas
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}