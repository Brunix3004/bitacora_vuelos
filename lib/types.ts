export interface FlightLog {
  id: string
  user_id: string
  fecha: string
  aeronave_matricula: string
  aeronave_tipo: string
  aeronave_nro_motores: number
  vuelo_de: string
  vuelo_hacia: string
  tiempo_horas: string | null
  tiempo_piloto: string | null
  dm: string | null
  horas_travesia: string | null
  ifr: string | null
  noche: string | null
  created_at: string
  updated_at: string
}

export interface FlightLogInput {
  fecha: string
  aeronave_matricula: string
  aeronave_tipo: string
  aeronave_nro_motores: number
  vuelo_de: string
  vuelo_hacia: string
  tiempo_horas: string
  tiempo_piloto: string
  dm: string
  horas_travesia: string
  ifr: string
  noche: string
}

export interface MonthlyStats {
  month: string
  year: number
  totalHoursThisMonth: number
  totalMinutesThisMonth: number
  totalHoursBefore: number
  totalMinutesBefore: number
  grandTotalHours: number
  grandTotalMinutes: number
}

// Utility functions for time format handling
export function parseTimeFormat(time: string | null): { hours: number; minutes: number } {
  if (!time || time.length !== 4) return { hours: 0, minutes: 0 }
  const hours = parseInt(time.substring(0, 2), 10) || 0
  const minutes = parseInt(time.substring(2, 4), 10) || 0
  return { hours, minutes }
}

export function formatTimeDisplay(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
}

export function addTimes(times: (string | null)[]): { hours: number; minutes: number } {
  let totalMinutes = 0
  for (const time of times) {
    const { hours, minutes } = parseTimeFormat(time)
    totalMinutes += hours * 60 + minutes
  }
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  }
}
