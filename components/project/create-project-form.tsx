'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Globe, Settings } from 'lucide-react'
import type { Project, CoordinateSystem } from '@/types/geostxr-data'

interface CreateProjectFormProps {
  onProjectCreated: (project: Project) => void
  onCancel: () => void
}

const COORDINATE_SYSTEMS = [
  { value: 'UTM', label: 'UTM (Universal Transverse Mercator)' },
  { value: 'LOCAL', label: 'Sistema Local' },
  { value: 'GEOGRAPHIC', label: 'Geográfico (Lat/Lon)' }
]

const DATUMS = [
  { value: 'WGS84', label: 'WGS84' },
  { value: 'SIRGAS2000', label: 'SIRGAS2000' },
  { value: 'PSAD56', label: 'PSAD56' },
  { value: 'NAD83', label: 'NAD83' },
  { value: 'GDA2020', label: 'GDA2020' },
  { value: 'SAD69', label: 'SAD69' }
]

const UTM_ZONES = Array.from({ length: 60 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `Zona ${i + 1}`
}))

export function CreateProjectForm({ onProjectCreated, onCancel }: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    location: '',
    coordinateSystem: {
      projection: 'UTM' as 'UTM' | 'LOCAL' | 'GEOGRAPHIC',
      datum: 'WGS84' as string,
      utmZone: 19,
      utmHemisphere: 'S' as 'N' | 'S',
      epsgCode: 32719,
      description: 'WGS84 UTM Zone 19S'
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCoordinateSystemChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      coordinateSystem: {
        ...prev.coordinateSystem,
        [field]: value
      }
    }))
  }

  const calculateEPSGCode = () => {
    const { projection, datum, utmZone, utmHemisphere } = formData.coordinateSystem
    
    if (projection === 'UTM' && datum === 'WGS84') {
      // WGS84 UTM zones
      const baseCode = utmHemisphere === 'N' ? 32600 : 32700
      return baseCode + utmZone
    } else if (projection === 'GEOGRAPHIC' && datum === 'WGS84') {
      return 4326 // WGS84 Geographic
    }
    
    return undefined
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proyecto es requerido'
    }

    if (formData.coordinateSystem.projection === 'UTM') {
      if (!formData.coordinateSystem.utmZone || formData.coordinateSystem.utmZone < 1 || formData.coordinateSystem.utmZone > 60) {
        newErrors.utmZone = 'La zona UTM debe estar entre 1 y 60'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const epsgCode = calculateEPSGCode()
    
    const project: Project = {
      id: `project-${Date.now()}`,
      name: formData.name,
      client: formData.client || undefined,
      location: formData.location || undefined,
      coordinateSystem: {
        ...formData.coordinateSystem,
        epsgCode
      },
      drillHoles: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    onProjectCreated(project)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Crear Nuevo Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Información del Proyecto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nombre del Proyecto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Ej: Mina San José"
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client" className="text-white">Cliente</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Ej: Compañía Minera ABC"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Ej: Región de Antofagasta, Chile"
                />
              </div>
            </div>

            {/* Sistema de coordenadas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Sistema de Coordenadas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projection" className="text-white">Proyección</Label>
                  <Select
                    value={formData.coordinateSystem.projection}
                    onValueChange={(value) => handleCoordinateSystemChange('projection', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COORDINATE_SYSTEMS.map((system) => (
                        <SelectItem key={system.value} value={system.value}>
                          {system.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datum" className="text-white">Datum</Label>
                  <Select
                    value={formData.coordinateSystem.datum}
                    onValueChange={(value) => handleCoordinateSystemChange('datum', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATUMS.map((datum) => (
                        <SelectItem key={datum.value} value={datum.value}>
                          {datum.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Configuración UTM */}
              {formData.coordinateSystem.projection === 'UTM' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="utmZone" className="text-white">Zona UTM</Label>
                    <Select
                      value={formData.coordinateSystem.utmZone.toString()}
                      onValueChange={(value) => handleCoordinateSystemChange('utmZone', parseInt(value))}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UTM_ZONES.map((zone) => (
                          <SelectItem key={zone.value} value={zone.value}>
                            {zone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.utmZone && <p className="text-red-400 text-sm">{errors.utmZone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utmHemisphere" className="text-white">Hemisferio</Label>
                    <Select
                      value={formData.coordinateSystem.utmHemisphere}
                      onValueChange={(value) => handleCoordinateSystemChange('utmHemisphere', value)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="N">Norte (N)</SelectItem>
                        <SelectItem value="S">Sur (S)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Información EPSG */}
              {calculateEPSGCode() && (
                <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    <strong>EPSG Code:</strong> {calculateEPSGCode()}
                  </p>
                  <p className="text-blue-300 text-xs mt-1">
                    {formData.coordinateSystem.description}
                  </p>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Crear Proyecto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
