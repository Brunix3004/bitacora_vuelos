"use client"

import { FlightLog, parseTimeFormat, formatTimeDisplay } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plane } from "lucide-react"

interface FlightLogTableProps {
  logs: FlightLog[]
  isPilotMode: boolean
  onEdit?: (log: FlightLog) => void
  onDelete?: (id: string) => void
}

export function FlightLogTable({ logs, isPilotMode, onEdit, onDelete }: FlightLogTableProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const getTimeDisplay = (time: string | null) => {
    if (!time) return "-"
    const { hours, minutes } = parseTimeFormat(time)
    return formatTimeDisplay(hours, minutes)
  }

  const getSpecialFieldDisplay = (log: FlightLog) => {
    if (log.dm) return `DM: ${getTimeDisplay(log.dm)}`
    if (log.horas_travesia) return `Travesia: ${getTimeDisplay(log.horas_travesia)}`
    if (log.ifr) return `IFR: ${getTimeDisplay(log.ifr)}`
    if (log.noche) return `Noche: ${getTimeDisplay(log.noche)}`
    return "-"
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Plane className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No hay registros de vuelo</p>
        <p className="text-sm">Los registros de vuelo apareceran aqui</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-foreground">Fecha</TableHead>
            <TableHead className="font-semibold text-foreground">Aeronave</TableHead>
            <TableHead className="font-semibold text-foreground">Vuelo</TableHead>
            <TableHead className="font-semibold text-foreground">Tiempo Total</TableHead>
            <TableHead className="font-semibold text-foreground">Piloto</TableHead>
            <TableHead className="font-semibold text-foreground">Especial</TableHead>
            {isPilotMode && <TableHead className="font-semibold text-foreground w-24">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{formatDate(log.fecha)}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{log.aeronave_matricula}</span>
                  <span className="text-sm text-muted-foreground">
                    {log.aeronave_tipo} - {log.aeronave_nro_motores} motor{log.aeronave_nro_motores > 1 ? 'es' : ''}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{log.vuelo_de}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{log.vuelo_hacia}</span>
                </div>
              </TableCell>
              <TableCell>{getTimeDisplay(log.tiempo_horas)}</TableCell>
              <TableCell>{getTimeDisplay(log.tiempo_piloto)}</TableCell>
              <TableCell>
                <span className="text-sm">{getSpecialFieldDisplay(log)}</span>
              </TableCell>
              {isPilotMode && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(log)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(log.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
