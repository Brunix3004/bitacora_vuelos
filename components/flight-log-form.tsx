"use client"

import { useState, useEffect } from "react"
import { FlightLog, FlightLogInput } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface FlightLogFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FlightLogInput) => void
  editingLog?: FlightLog | null
  isLoading?: boolean
}

const initialFormData: FlightLogInput = {
  fecha: new Date().toISOString().split('T')[0],
  aeronave_matricula: "",
  aeronave_tipo: "",
  aeronave_nro_motores: 1,
  vuelo_de: "",
  vuelo_hacia: "",
  tiempo_horas: "",
  tiempo_piloto: "",
  dm: "",
  horas_travesia: "",
  ifr: "",
  noche: "",
}

type SpecialField = "dm" | "horas_travesia" | "ifr" | "noche" | "none"

export function FlightLogForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  editingLog,
  isLoading 
}: FlightLogFormProps) {
  const [formData, setFormData] = useState<FlightLogInput>(initialFormData)
  const [specialField, setSpecialField] = useState<SpecialField>("none")
  const [specialValue, setSpecialValue] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingLog) {
      setFormData({
        fecha: editingLog.fecha,
        aeronave_matricula: editingLog.aeronave_matricula,
        aeronave_tipo: editingLog.aeronave_tipo,
        aeronave_nro_motores: editingLog.aeronave_nro_motores,
        vuelo_de: editingLog.vuelo_de,
        vuelo_hacia: editingLog.vuelo_hacia,
        tiempo_horas: editingLog.tiempo_horas || "",
        tiempo_piloto: editingLog.tiempo_piloto || "",
        dm: editingLog.dm || "",
        horas_travesia: editingLog.horas_travesia || "",
        ifr: editingLog.ifr || "",
        noche: editingLog.noche || "",
      })
      
      if (editingLog.dm) {
        setSpecialField("dm")
        setSpecialValue(editingLog.dm)
      } else if (editingLog.horas_travesia) {
        setSpecialField("horas_travesia")
        setSpecialValue(editingLog.horas_travesia)
      } else if (editingLog.ifr) {
        setSpecialField("ifr")
        setSpecialValue(editingLog.ifr)
      } else if (editingLog.noche) {
        setSpecialField("noche")
        setSpecialValue(editingLog.noche)
      } else {
        setSpecialField("none")
        setSpecialValue("")
      }
    } else {
      setFormData(initialFormData)
      setSpecialField("none")
      setSpecialValue("")
    }
    setErrors({})
  }, [editingLog, open])

  const validateTimeFormat = (value: string): boolean => {
    if (!value) return true
    if (value.length !== 4) return false
    const hours = parseInt(value.substring(0, 2), 10)
    const minutes = parseInt(value.substring(2, 4), 10)
    return !isNaN(hours) && !isNaN(minutes) && hours >= 0 && minutes >= 0 && minutes < 60
  }

  const handleTimeInput = (value: string, field: keyof FlightLogInput) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4)
    setFormData(prev => ({ ...prev, [field]: numericValue }))
  }

  const handleSpecialTimeInput = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4)
    setSpecialValue(numericValue)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fecha) newErrors.fecha = "La fecha es obligatoria"
    if (!formData.aeronave_matricula) newErrors.aeronave_matricula = "La matricula es obligatoria"
    if (!formData.aeronave_tipo) newErrors.aeronave_tipo = "El tipo de avion es obligatorio"
    if (!formData.aeronave_nro_motores || formData.aeronave_nro_motores < 1) {
      newErrors.aeronave_nro_motores = "Debe tener al menos 1 motor"
    }
    if (!formData.vuelo_de) newErrors.vuelo_de = "El origen es obligatorio"
    if (!formData.vuelo_hacia) newErrors.vuelo_hacia = "El destino es obligatorio"

    if (!formData.tiempo_horas && !formData.tiempo_piloto) {
      newErrors.tiempo = "Debe ingresar al menos Tiempo Horas o Piloto"
    }

    if (formData.tiempo_horas && !validateTimeFormat(formData.tiempo_horas)) {
      newErrors.tiempo_horas = "Formato invalido (HHMM)"
    }
    if (formData.tiempo_piloto && !validateTimeFormat(formData.tiempo_piloto)) {
      newErrors.tiempo_piloto = "Formato invalido (HHMM)"
    }

    if (specialField !== "none" && specialValue) {
      if (!validateTimeFormat(specialValue)) {
        newErrors.special = "Formato invalido (HHMM)"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    const submitData: FlightLogInput = {
      ...formData,
      dm: "",
      horas_travesia: "",
      ifr: "",
      noche: "",
    }

    if (specialField !== "none" && specialValue) {
      submitData[specialField] = specialValue
    }

    onSubmit(submitData)
  }

  const formatTimeDisplay = (value: string) => {
    if (!value) return ""
    if (value.length <= 2) return value
    return `${value.substring(0, 2)}:${value.substring(2)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingLog ? "Editar Registro de Vuelo" : "Nuevo Registro de Vuelo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha" className="font-medium">
              Fecha <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
              className={errors.fecha ? "border-destructive" : ""}
            />
            {errors.fecha && <p className="text-sm text-destructive">{errors.fecha}</p>}
          </div>

          {/* Aeronave */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground border-b pb-2">Aeronave</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricula">
                  Matricula <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="matricula"
                  placeholder="OB-1234"
                  value={formData.aeronave_matricula}
                  onChange={(e) => setFormData(prev => ({ ...prev, aeronave_matricula: e.target.value.toUpperCase() }))}
                  className={errors.aeronave_matricula ? "border-destructive" : ""}
                />
                {errors.aeronave_matricula && <p className="text-sm text-destructive">{errors.aeronave_matricula}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">
                  Tipo de Avion <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tipo"
                  placeholder="Cessna 172"
                  value={formData.aeronave_tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, aeronave_tipo: e.target.value }))}
                  className={errors.aeronave_tipo ? "border-destructive" : ""}
                />
                {errors.aeronave_tipo && <p className="text-sm text-destructive">{errors.aeronave_tipo}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="motores">
                  Nro. Motores <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="motores"
                  type="number"
                  min={1}
                  value={formData.aeronave_nro_motores}
                  onChange={(e) => setFormData(prev => ({ ...prev, aeronave_nro_motores: parseInt(e.target.value) || 1 }))}
                  className={errors.aeronave_nro_motores ? "border-destructive" : ""}
                />
                {errors.aeronave_nro_motores && <p className="text-sm text-destructive">{errors.aeronave_nro_motores}</p>}
              </div>
            </div>
          </div>

          {/* Vuelo */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground border-b pb-2">Vuelo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="de">
                  De (Origen) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="de"
                  placeholder="SPJC"
                  value={formData.vuelo_de}
                  onChange={(e) => setFormData(prev => ({ ...prev, vuelo_de: e.target.value.toUpperCase() }))}
                  className={errors.vuelo_de ? "border-destructive" : ""}
                />
                {errors.vuelo_de && <p className="text-sm text-destructive">{errors.vuelo_de}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hacia">
                  Hacia (Destino) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="hacia"
                  placeholder="SPIM"
                  value={formData.vuelo_hacia}
                  onChange={(e) => setFormData(prev => ({ ...prev, vuelo_hacia: e.target.value.toUpperCase() }))}
                  className={errors.vuelo_hacia ? "border-destructive" : ""}
                />
                {errors.vuelo_hacia && <p className="text-sm text-destructive">{errors.vuelo_hacia}</p>}
              </div>
            </div>
          </div>

          {/* Tiempo Total */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground border-b pb-2">
              Tiempo Total <span className="text-sm text-muted-foreground">(al menos uno requerido)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tiempo_horas">Horas (formato HHMM)</Label>
                <Input
                  id="tiempo_horas"
                  placeholder="0130"
                  value={formData.tiempo_horas}
                  onChange={(e) => handleTimeInput(e.target.value, 'tiempo_horas')}
                  maxLength={4}
                  className={errors.tiempo_horas || errors.tiempo ? "border-destructive" : ""}
                />
                {formData.tiempo_horas && (
                  <p className="text-sm text-muted-foreground">
                    {formatTimeDisplay(formData.tiempo_horas)}
                  </p>
                )}
                {errors.tiempo_horas && <p className="text-sm text-destructive">{errors.tiempo_horas}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiempo_piloto">Piloto (formato HHMM)</Label>
                <Input
                  id="tiempo_piloto"
                  placeholder="0130"
                  value={formData.tiempo_piloto}
                  onChange={(e) => handleTimeInput(e.target.value, 'tiempo_piloto')}
                  maxLength={4}
                  className={errors.tiempo_piloto || errors.tiempo ? "border-destructive" : ""}
                />
                {formData.tiempo_piloto && (
                  <p className="text-sm text-muted-foreground">
                    {formatTimeDisplay(formData.tiempo_piloto)}
                  </p>
                )}
                {errors.tiempo_piloto && <p className="text-sm text-destructive">{errors.tiempo_piloto}</p>}
              </div>
            </div>
            {errors.tiempo && <p className="text-sm text-destructive">{errors.tiempo}</p>}
          </div>

          {/* Campos Especiales */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground border-b pb-2">
              Tipo de Vuelo <span className="text-sm text-muted-foreground">(solo uno opcional)</span>
            </h3>
            <RadioGroup
              value={specialField}
              onValueChange={(value) => {
                setSpecialField(value as SpecialField)
                if (value === "none") setSpecialValue("")
              }}
              className="grid grid-cols-2 md:grid-cols-5 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="cursor-pointer">Ninguno</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dm" id="dm" />
                <Label htmlFor="dm" className="cursor-pointer">DM</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="horas_travesia" id="horas_travesia" />
                <Label htmlFor="horas_travesia" className="cursor-pointer">Travesia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ifr" id="ifr" />
                <Label htmlFor="ifr" className="cursor-pointer">IFR</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="noche" id="noche" />
                <Label htmlFor="noche" className="cursor-pointer">Noche</Label>
              </div>
            </RadioGroup>

            {specialField !== "none" && (
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="specialValue">
                  Horas de {specialField === "horas_travesia" ? "Travesia" : specialField.toUpperCase()} (HHMM)
                </Label>
                <Input
                  id="specialValue"
                  placeholder="0100"
                  value={specialValue}
                  onChange={(e) => handleSpecialTimeInput(e.target.value)}
                  maxLength={4}
                  className={errors.special ? "border-destructive" : ""}
                />
                {specialValue && (
                  <p className="text-sm text-muted-foreground">
                    {formatTimeDisplay(specialValue)}
                  </p>
                )}
                {errors.special && <p className="text-sm text-destructive">{errors.special}</p>}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : editingLog ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
