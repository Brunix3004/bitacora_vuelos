"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { FlightLog, FlightLogInput } from "@/lib/types"
import { FlightLogTable } from "@/components/flight-log-table"
import { FlightLogForm } from "@/components/flight-log-form"
import { StatisticsPanel } from "@/components/statistics-panel"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Plane, Plus, LogOut, User, Eye } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function HomePage() {
  const [logs, setLogs] = useState<FlightLog[]>([])
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<FlightLog | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  const supabase = createClient()

  const fetchLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from("flight_logs")
      .select("*")
      .order("fecha", { ascending: false })

    if (error) {
      console.error("Error fetching logs:", error)
      toast.error("Error al cargar los registros")
      return
    }

    setLogs(data || [])
  }, [supabase])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    checkUser()
    fetchLogs()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchLogs])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    toast.success("Sesion cerrada")
  }

  const handleSubmit = async (data: FlightLogInput) => {
    if (!user) return

    setIsFormLoading(true)

    try {
      if (editingLog) {
        const { error } = await supabase
          .from("flight_logs")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingLog.id)
          .eq("user_id", user.id)

        if (error) throw error
        toast.success("Registro actualizado")
      } else {
        const { error } = await supabase
          .from("flight_logs")
          .insert({
            ...data,
            user_id: user.id,
          })

        if (error) throw error
        toast.success("Registro creado")
      }

      setShowForm(false)
      setEditingLog(null)
      fetchLogs()
    } catch (error) {
      console.error("Error saving log:", error)
      toast.error("Error al guardar el registro")
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleEdit = (log: FlightLog) => {
    setEditingLog(log)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId || !user) return

    try {
      const { error } = await supabase
        .from("flight_logs")
        .delete()
        .eq("id", deleteId)
        .eq("user_id", user.id)

      if (error) throw error
      toast.success("Registro eliminado")
      fetchLogs()
    } catch (error) {
      console.error("Error deleting log:", error)
      toast.error("Error al eliminar el registro")
    } finally {
      setDeleteId(null)
    }
  }

  const isPilotMode = !!user

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Plane className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Bitacora de Vuelo</h1>
                <p className="text-sm text-muted-foreground">Control de Horas de Piloto</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isPilotMode ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm">
                    <User className="h-4 w-4" />
                    <span>Modo Piloto</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Cerrar Sesion</span>
                  </Button>
                </>
              ) : (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                    <Eye className="h-4 w-4" />
                    <span>Modo Visitante</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowAuthModal(true)}
                    className="gap-2"
                  >
                    <Plane className="h-4 w-4" />
                    <span>Modo Piloto</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Statistics Section */}
        <section className="bg-card rounded-xl p-6 border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground">Panel de Estadisticas</h2>
            <div className="flex items-center gap-2">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <StatisticsPanel 
            logs={logs} 
            selectedMonth={selectedMonth} 
            selectedYear={selectedYear} 
          />
        </section>

        {/* Flight Logs Section */}
        <section className="bg-card rounded-xl p-6 border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Registros de Vuelo</h2>
              <p className="text-sm text-muted-foreground">
                {logs.length} registro{logs.length !== 1 ? 's' : ''} en total
              </p>
            </div>
            {isPilotMode && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Registro
              </Button>
            )}
          </div>
          <FlightLogTable
            logs={logs}
            isPilotMode={isPilotMode}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteId(id)}
          />
        </section>
      </main>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => {
          fetchLogs()
        }}
      />

      {/* Flight Log Form */}
      <FlightLogForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open)
          if (!open) setEditingLog(null)
        }}
        onSubmit={handleSubmit}
        editingLog={editingLog}
        isLoading={isFormLoading}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar registro de vuelo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta seguro de que desea eliminar este registro? Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
