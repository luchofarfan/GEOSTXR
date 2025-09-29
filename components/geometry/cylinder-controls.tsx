'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVirtualCylinder } from '@/hooks/geometry/use-virtual-cylinder'

export const CylinderControls: React.FC = () => {
  const [cylinderState, cylinderControls] = useVirtualCylinder()

  return (
    <Card className="w-80 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Cilindro Virtual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Visibilidad
          </label>
          <Switch
            checked={cylinderState.isVisible}
            onCheckedChange={cylinderControls.toggleVisibility}
          />
        </div>

        {/* Opacity Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Opacidad: {Math.round(cylinderState.opacity * 100)}%
          </label>
          <Slider
            value={[cylinderState.opacity]}
            onValueChange={([value]) => cylinderControls.setOpacity(value)}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Position Controls */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Posición X: {cylinderState.position.x.toFixed(2)}
          </label>
          <Slider
            value={[cylinderState.position.x]}
            onValueChange={([value]) => 
              cylinderControls.setPosition(value, cylinderState.position.y, cylinderState.position.z)
            }
            min={-5}
            max={5}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Posición Y: {cylinderState.position.y.toFixed(2)}
          </label>
          <Slider
            value={[cylinderState.position.y]}
            onValueChange={([value]) => 
              cylinderControls.setPosition(cylinderState.position.x, value, cylinderState.position.z)
            }
            min={-5}
            max={5}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Posición Z: {cylinderState.position.z.toFixed(2)}
          </label>
          <Slider
            value={[cylinderState.position.z]}
            onValueChange={([value]) => 
              cylinderControls.setPosition(cylinderState.position.x, cylinderState.position.y, value)
            }
            min={-5}
            max={5}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Rotation Controls */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Rotación X: {Math.round(cylinderState.rotation.x * 180 / Math.PI)}°
          </label>
          <Slider
            value={[cylinderState.rotation.x]}
            onValueChange={([value]) => 
              cylinderControls.setRotation(value, cylinderState.rotation.y, cylinderState.rotation.z)
            }
            min={-Math.PI}
            max={Math.PI}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Rotación Y: {Math.round(cylinderState.rotation.y * 180 / Math.PI)}°
          </label>
          <Slider
            value={[cylinderState.rotation.y]}
            onValueChange={([value]) => 
              cylinderControls.setRotation(cylinderState.rotation.x, value, cylinderState.rotation.z)
            }
            min={-Math.PI}
            max={Math.PI}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Rotación Z: {Math.round(cylinderState.rotation.z * 180 / Math.PI)}°
          </label>
          <Slider
            value={[cylinderState.rotation.z]}
            onValueChange={([value]) => 
              cylinderControls.setRotation(cylinderState.rotation.x, cylinderState.rotation.y, value)
            }
            min={-Math.PI}
            max={Math.PI}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Scale Controls */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Escala: {cylinderState.scale.x.toFixed(2)}
          </label>
          <Slider
            value={[cylinderState.scale.x]}
            onValueChange={([value]) => 
              cylinderControls.setScale(value, value, value)
            }
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Reset Button */}
        <Button
          onClick={cylinderControls.resetToDefault}
          variant="outline"
          className="w-full"
        >
          Resetear a Valores por Defecto
        </Button>
      </CardContent>
    </Card>
  )
}

export default CylinderControls
