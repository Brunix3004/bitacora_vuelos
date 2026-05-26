"use client"

import { useMemo } from "react"
import { FlightLog, parseTimeFormat, formatTimeDisplay, addTimes } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, TrendingUp, Plane } from "lucide-react"

interface StatisticsPanelProps {
  logs: FlightLog[]
  selectedMonth: number
  selectedYear: number
}

export function StatisticsPanel({ logs, selectedMonth, selectedYear }: StatisticsPanelProps) {
  const stats = useMemo(() => {
    const logsThisMonth = logs.filter(log => {
      const date = new Date(log.fecha)
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    })

    const logsBefore = logs.filter(log => {
      const date = new Date(log.fecha)
      const logDate = new Date(date.getFullYear(), date.getMonth())
      const selectedDate = new Date(selectedYear, selectedMonth)
      return logDate < selectedDate
    })

    // Calcular horas de este mes
    const thisMonthTimes = logsThisMonth.flatMap(log => [log.tiempo_horas, log.tiempo_piloto].filter(Boolean))
    const thisMonth = addTimes(thisMonthTimes)

    // Calcular horas antes de este mes
    const beforeTimes = logsBefore.flatMap(log => [log.tiempo_horas, log.tiempo_piloto].filter(Boolean))
    const before = addTimes(beforeTimes)

    // Total
    const totalMinutes = (thisMonth.hours * 60 + thisMonth.minutes) + (before.hours * 60 + before.minutes)
    const total = {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    }

    // Estadisticas especiales de este mes
    const dmTimes = logsThisMonth.map(log => log.dm).filter(Boolean)
    const travesiaTimes = logsThisMonth.map(log => log.horas_travesia).filter(Boolean)
    const ifrTimes = logsThisMonth.map(log => log.ifr).filter(Boolean)
    const nocheTimes = logsThisMonth.map(log => log.noche).filter(Boolean)

    return {
      thisMonth,
      before,
      total,
      flightsThisMonth: logsThisMonth.length,
      flightsTotal: logs.length,
      specialStats: {
        dm: addTimes(dmTimes),
        travesia: addTimes(travesiaTimes),
        ifr: addTimes(ifrTimes),
        noche: addTimes(nocheTimes),
      }
    }
  }, [logs, selectedMonth, selectedYear])

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Estadisticas - {monthNames[selectedMonth]} {selectedYear}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Horas Este Mes */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Horas Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatTimeDisplay(stats.thisMonth.hours, stats.thisMonth.minutes)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.flightsThisMonth} vuelo{stats.flightsThisMonth !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Horas Anteriores */}
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Acumuladas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatTimeDisplay(stats.before.hours, stats.before.minutes)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Hasta {monthNames[selectedMonth > 0 ? selectedMonth - 1 : 11]} {selectedMonth > 0 ? selectedYear : selectedYear - 1}
            </p>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="border-l-4 border-l-chart-3 bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Total Acumulado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatTimeDisplay(stats.total.hours, stats.total.minutes)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.flightsTotal} vuelos en total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadisticas Especiales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Desglose por Tipo de Vuelo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">DM</p>
              <p className="text-lg font-semibold">
                {formatTimeDisplay(stats.specialStats.dm.hours, stats.specialStats.dm.minutes)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Travesia</p>
              <p className="text-lg font-semibold">
                {formatTimeDisplay(stats.specialStats.travesia.hours, stats.specialStats.travesia.minutes)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">IFR</p>
              <p className="text-lg font-semibold">
                {formatTimeDisplay(stats.specialStats.ifr.hours, stats.specialStats.ifr.minutes)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Noche</p>
              <p className="text-lg font-semibold">
                {formatTimeDisplay(stats.specialStats.noche.hours, stats.specialStats.noche.minutes)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
