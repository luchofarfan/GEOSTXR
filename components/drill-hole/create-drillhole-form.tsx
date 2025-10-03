'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { MapPin, Target, Compass } from 'lucide-react'
import type { DrillHole, DrillHoleInfo, CoordinateSystem, Project } from '@/types/geostxr-data'

interface CreateDrillHoleFormProps {
  project: Project
  onDrillHoleCreated: (drillHole: DrillHole) => void
  onCancel: () => void
}

export function CreateDrillHoleForm({ project, onDrillHoleCreated, onCancel }: CreateDrillHoleFormProps) {
  const [useProjectCoordinates, setUseProjectCoordinates] = useState(true)
  const [formData, setFormData] = useState({
    holeName: '',
    azimuth: 0,
    dip: -60,
    totalDepth: 50,
    collar: {
      utmEast: 0,
      utmNorth: 0,
      elevation: 0
    },
    coordinateSystem: project.coordinateSystem || {
      projection: 'UTM' as 'UTM' | 'LOCAL' | 'GEOGRAPHIC',
      datum: 'WGS84',
      utmZone: 19,
      utmHemisphere: 'S' as 'N' | 'S',
      epsgCode: 32719,
      description: 'WGS84 UTM Zone 19S'
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCollarChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      collar: {
        ...prev.collar,
        [field]: value
      }
    }))
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.holeName.trim()) {
      newErrors.holeName = 'El nombre del sondaje es requerido'
    }

    if (formData.azimuth < 0 || formData.azimuth >= 360) {
      newErrors.azimuth = 'El azimut debe estar entre 0° y 360°'
    }

    if (formData.dip < -90 || formData.dip > 90) {
      newErrors.dip = 'El dip debe estar entre -90° y 90°'
    }

    if (formData.totalDepth <= 0) {
      newErrors.totalDepth = 'La profundidad total debe ser mayor a 0'
    }

    if (!useProjectCoordinates) {
      if (formData.collar.utmEast === 0 && formData.collar.utmNorth === 0) {
        newErrors.collar = 'Las coordenadas del collar son requeridas'
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

    const drillHoleInfo: DrillHoleInfo = {
      holeName: formData.holeName,
      azimuth: formData.azimuth,
      dip: formData.dip,
      utmEast: formData.collar.utmEast,
      utmNorth: formData.collar.utmNorth,
      elevation: formData.collar.elevation,
      coordinateSystem: useProjectCoordinates ? project.coordinateSystem : formData.coordinateSystem
    }

    const drillHole: DrillHole = {
      id: `dh-${Date.now()}`,
      name: formData.holeName,
      info: drillHoleInfo,
      totalDepth: formData.totalDepth,
      scenes: [],
      createdAt: new Date()
    }

    onDrillHoleCreated(drillHole)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Crear Nuevo Sondaje
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Proyecto: <span className="font-semibold">{project.name}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Información del Sondaje
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="holeName" className="text-white">Nombre del Sondaje *</Label>
                <Input
                  id="holeName"
                  value={formData.holeName}
                  onChange={(e) => handleInputChange('holeName', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Ej: DDH-001"
                />
                {errors.holeName && <p className="text-red-400 text-sm">{errors.holeName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="azimuth" className="text-white flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    Azimut (°)
                  </Label>
                  <Input
                    id="azimuth"
                    type="number"
                    min="0"
                    max="359.99"
                    step="0.01"
                    value={formData.azimuth}
                    onChange={(e) => handleInputChange('azimuth', parseFloat(e.target.value) || 0)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  {errors.azimuth && <p className="text-red-400 text-sm">{errors.azimuth}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dip" className="text-white">Dip (°)</Label>
                  <Input
                    id="dip"
                    type="number"
                    min="-90"
                    max="90"
                    step="0.01"
                    value={formData.dip}
                    onChange={(e) => handleInputChange('dip', parseFloat(e.target.value) || 0)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  {errors.dip && <p className="text-red-400 text-sm">{errors.dip}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalDepth" className="text-white">Profundidad Total (m)</Label>
                  <Input
                    id="totalDepth"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.totalDepth}
                    onChange={(e) => handleInputChange('totalDepth', parseFloat(e.target.value) || 0)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  {errors.totalDepth && <p className="text-red-400 text-sm">{errors.totalDepth}</p>}
                </div>
              </div>
            </div>

            {/* Coordenadas del collar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Coordenadas del Collar
                </h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-project-coords"
                    checked={useProjectCoordinates}
                    onCheckedChange={setUseProjectCoordinates}
                  />
                  <Label htmlFor="use-project-coords" className="text-white text-sm">
                    Usar sistema del proyecto
                  </Label>
                </div>
              </div>

              {useProjectCoordinates ? (
                <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    <strong>Sistema del proyecto:</strong> {project.coordinateSystem?.description || 'No configurado'}
                  </p>
                  <p className="text-blue-300 text-xs mt-1">
                    EPSG: {project.coordinateSystem?.epsgCode || 'N/A'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sistema de coordenadas personalizado */}
                  <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      ⚠️ Sistema de coordenadas personalizado - diferente al proyecto
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="utmEast" className="text-white">Este (m)</Label>
                      <Input
                        id="utmEast"
                        type="number"
                        step="0.01"
                        value={formData.collar.utmEast}
                        onChange={(e) => handleCollarChange('utmEast', parseFloat(e.target.value) || 0)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="utmNorth" className="text-white">Norte (m)</Label>
                      <Input
                        id="utmNorth"
                        type="number"
                        step="0.01"
                        value={formData.collar.utmNorth}
                        onChange={(e) => handleCollarChange('utmNorth', parseFloat(e.target.value) || 0)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="elevation" className="text-white">Elevación (m)</Label>
                      <Input
                        id="elevation"
                        type="number"
                        step="0.01"
                        value={formData.collar.elevation}
                        onChange={(e) => handleCollarChange('elevation', parseFloat(e.target.value) || 0)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  {errors.collar && <p className="text-red-400 text-sm">{errors.collar}</p>}
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Crear Sondaje
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
