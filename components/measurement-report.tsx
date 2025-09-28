"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Ruler, Triangle } from "lucide-react"

interface Point {
  id: string
  x: number
  y: number
  depth: number
  label: string
  timestamp: number
  isCylinder?: boolean
}

interface MeasurementReportProps {
  points: Point[]
  currentAngle: number | null
}

export function MeasurementReport({ points, currentAngle }: MeasurementReportProps) {
  const calculateDistance = (p1: Point, p2: Point) => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  const totalDistance =
    points.length > 1
      ? points.slice(1).reduce((total, point, index) => {
          return total + calculateDistance(points[index], point)
        }, 0)
      : 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Measurement Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <div className="text-lg font-bold text-primary">{points.length}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <div className="text-lg font-bold text-accent">{points.filter(p => p.isCylinder).length}</div>
            <div className="text-xs text-muted-foreground">Cylinders</div>
          </div>
        </div>

        {/* Current Angle */}
        {currentAngle !== null && (
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Triangle className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Current Angle</span>
            </div>
            <div className="text-xl font-bold text-accent">{currentAngle.toFixed(2)}°</div>
          </div>
        )}

        {/* Cylinder Detection Status */}
        {points.filter(p => p.isCylinder).length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Triangle className="h-4 w-4 text-accent" />
              Detected Cylinders
            </h4>
            <div className="space-y-2">
              {points.filter(p => p.isCylinder).map((point, index) => (
                <div key={point.id} className="flex items-center justify-between text-xs p-2 bg-accent/10 rounded">
                  <span className="text-accent font-medium">{point.label}</span>
                  <Badge variant="outline" className="text-xs text-accent">
                    Auto-captured
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOHs (Reference Points) */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            BOHs Reference
          </h4>
          {points.length >= 3 ? (
            <div className="space-y-2">
              {points.slice(0, 3).map((point, index) => (
                <div key={point.id} className="flex items-center justify-between text-xs">
                  <span>BOH {index + 1}</span>
                  <Badge variant="outline" className="text-xs">
                    D: {point.depth.toFixed(2)}m
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Need 3+ points for BOH calculation</p>
          )}
        </div>

        {/* Depth Measurements */}
        {points.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Depth Analysis</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Average:</span>
                <span className="font-mono">
                  {(points.reduce((sum, p) => sum + p.depth, 0) / points.length).toFixed(2)}m
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Max:</span>
                <span className="font-mono">{Math.max(...points.map((p) => p.depth)).toFixed(2)}m</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Min:</span>
                <span className="font-mono">{Math.min(...points.map((p) => p.depth)).toFixed(2)}m</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
