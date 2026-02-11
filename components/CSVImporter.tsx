"use client"

import { useState, useRef } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { useRouter } from "next/navigation"
import {
  parseCSV,
  validateColumns,
  type ParseResult,
  type ParsedRow,
} from "@/lib/csv/workOrdersParser"

const STATUS_COLORS: Record<string, string> = {
  valid: "#e6ffe6",
  warning: "#fff8e6",
  error: "#ffe6e6",
}

const BADGE_COLORS: Record<string, string> = {
  valid: "#22c55e",
  warning: "#eab308",
  error: "#ef4444",
}

export default function CSVImporter() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [result, setResult] = useState<ParseResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
  } | null>(null)
  const [columnError, setColumnError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setColumnError(null)
    setImportResult(null)

    const text = await file.text()
    const lines = text.trim().split("\n")

    if (lines.length < 1) {
      setColumnError("El archivo está vacío")
      return
    }

    // Validar columnas
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const colValidation = validateColumns(headers)

    if (!colValidation.valid) {
      setColumnError(
        `Columnas faltantes: ${colValidation.missing.join(", ")}. ` +
          `El CSV debe tener al menos: title, status`
      )
      return
    }

    // Obtener cuadrillas existentes de la DB
    const { data: cuadrillas } = await supabase
      .from("cuadrillas")
      .select("numero")

    const existingCuadrillas = cuadrillas?.map((c) => c.numero) ?? []

    // Parsear y validar
    const parsed = parseCSV(text, existingCuadrillas)
    setResult(parsed)
  }

  const toggleRow = (rowNumber: number) => {
    if (!result) return
    setResult({
      ...result,
      rows: result.rows.map((row) =>
        row.rowNumber === rowNumber && row.status !== "error"
          ? { ...row, selected: !row.selected }
          : row
      ),
    })
  }

  const toggleAll = (selected: boolean) => {
    if (!result) return
    setResult({
      ...result,
      rows: result.rows.map((row) =>
        row.status !== "error" ? { ...row, selected } : row
      ),
    })
  }

  const handleImport = async () => {
    if (!result) return

    const selectedRows = result.rows.filter(
      (r) => r.selected && r.parsed !== null
    )

    if (selectedRows.length === 0) return

    setImporting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    let success = 0
    let failed = 0

    // Insertar en lotes de 50
    const batchSize = 50
    for (let i = 0; i < selectedRows.length; i += batchSize) {
      const batch = selectedRows.slice(i, i + batchSize)

      const rows = batch.map((row) => ({
        title: row.parsed!.title,
        description: row.parsed!.description,
        status: row.parsed!.status,
        cuadrilla: row.parsed!.cuadrilla,
        created_by: user?.id,
        updated_by: user?.id,
        created_at: row.parsed!.created_at,
        updated_at: row.parsed!.updated_at,
      }))

      const { data, error } = await supabase.from("work_orders").insert(rows)

      if (error) {
        failed += batch.length
        console.error("Error al importar lote:", error)
      } else {
        success += batch.length
      }
    }

    setImporting(false)
    setImportResult({ success, failed })
  }

  const handleReset = () => {
    setResult(null)
    setImportResult(null)
    setColumnError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const selectedCount = result?.rows.filter((r) => r.selected).length ?? 0

  return (
    <div>
      <h2>Importar órdenes de trabajo</h2>

      {/* Upload */}
      {!result && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
          <p style={{ fontSize: "0.875rem", color: "#666" }}>
            Columnas esperadas: title, description, status, cuadrilla,
            created_at, updated_at
          </p>
          {columnError && <p style={{ color: "red" }}>{columnError}</p>}
        </div>
      )}

      {/* Preview */}
      {result && !importResult && (
        <div>
          {/* Resumen */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <SummaryBadge
              label="Válidas"
              count={result.summary.valid}
              color="#22c55e"
            />
            <SummaryBadge
              label="Con advertencias"
              count={result.summary.warnings}
              color="#eab308"
            />
            <SummaryBadge
              label="Con errores"
              count={result.summary.errors}
              color="#ef4444"
            />
            <SummaryBadge
              label="Total"
              count={result.summary.total}
              color="#6b7280"
            />
          </div>

          {/* Controles */}
          <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
            <button onClick={() => toggleAll(true)}>Seleccionar todas</button>
            <button onClick={() => toggleAll(false)}>
              Deseleccionar todas
            </button>
            <button onClick={handleReset}>Cancelar</button>
          </div>

          {/* Tabla preview */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Sel.</th>
                  <th style={thStyle}>Fila</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Título</th>
                  <th style={thStyle}>Descripción</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Cuadrilla</th>
                  <th style={thStyle}>Fecha creación</th>
                  <th style={thStyle}>Problemas</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    style={{
                      backgroundColor: STATUS_COLORS[row.status],
                    }}
                  >
                    <td style={tdStyle}>
                      <input
                        type="checkbox"
                        checked={row.selected}
                        disabled={row.status === "error"}
                        onChange={() => toggleRow(row.rowNumber)}
                      />
                    </td>
                    <td style={tdStyle}>{row.rowNumber}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          color: "white",
                          backgroundColor: BADGE_COLORS[row.status],
                        }}
                      >
                        {row.status === "valid"
                          ? "OK"
                          : row.status === "warning"
                            ? "Advertencia"
                            : "Error"}
                      </span>
                    </td>
                    <td style={tdStyle}>{row.raw.title || "-"}</td>
                    <td style={tdStyle}>
                      {row.raw.description?.substring(0, 40) || "-"}
                    </td>
                    <td style={tdStyle}>{row.raw.status || "-"}</td>
                    <td style={tdStyle}>{row.raw.cuadrilla || "-"}</td>
                    <td style={tdStyle}>
                      {row.raw.created_at
                        ? new Date(row.raw.created_at).toLocaleDateString(
                            "es-AR"
                          )
                        : "Auto"}
                    </td>
                    <td style={tdStyle}>
                      {row.issues.length > 0 ? (
                        <ul
                          style={{
                            margin: 0,
                            paddingLeft: "1rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.issues.map((issue, i) => (
                            <li
                              key={i}
                              style={{
                                color:
                                  issue.type === "error"
                                    ? "#dc2626"
                                    : "#ca8a04",
                              }}
                            >
                              <strong>{issue.field}:</strong> {issue.message}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "✓"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botón importar */}
          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={handleImport}
              disabled={importing || selectedCount === 0}
              style={{
                padding: "0.5rem 1.5rem",
                backgroundColor: selectedCount > 0 ? "#22c55e" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: selectedCount > 0 ? "pointer" : "not-allowed",
              }}
            >
              {importing
                ? "Importando..."
                : `Importar ${selectedCount} fila${selectedCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}

      {/* Resultado de importación */}
      {importResult && (
        <div>
          <h3>Importación completada</h3>
          <p style={{ color: "#22c55e" }}>
            ✓ {importResult.success} filas importadas correctamente
          </p>
          {importResult.failed > 0 && (
            <p style={{ color: "#ef4444" }}>
              ✗ {importResult.failed} filas fallaron al importar
            </p>
          )}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button onClick={handleReset}>Importar otro CSV</button>
            <button onClick={() => router.push("/work_orders")}>
              Ver órdenes de trabajo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryBadge({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: string
}) {
  return (
    <div
      style={{
        padding: "0.5rem 1rem",
        border: `2px solid ${color}`,
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0, color }}>
        {count}
      </p>
      <p style={{ fontSize: "0.75rem", margin: 0, color: "#666" }}>{label}</p>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "2px solid #ddd",
  textAlign: "left",
  fontSize: "0.875rem",
  whiteSpace: "nowrap",
}

const tdStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid #eee",
  fontSize: "0.875rem",
  verticalAlign: "top",
}