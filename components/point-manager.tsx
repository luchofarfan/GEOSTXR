"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, MapPin } from "lucide-react"

interface Point {
  id: string
  x: number
  y: number
  depth: number
  label: string
  timestamp: number
  isCylinder?: boolean
}

interface PointManagerProps {
  points: Point[]
  onRemovePoint: (id: string) => void
}

export function PointManager({ points, onRemovePoint }: PointManagerProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Points ({points.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No measurement points yet</p>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {points.map((point) => (
              <div key={point.id} className={`flex items-center justify-between p-2 rounded-md ${
                point.isCylinder ? 'bg-accent/20 border border-accent/30' : 'bg-muted/50'
              }`}>
                <div className="flex items-center gap-2">
                  <Badge variant={point.isCylinder ? "default" : "secondary"} className="text-xs">
                    {point.label}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    {point.x.toFixed(1)}, {point.y.toFixed(1)}
                  </span>
                  {point.isCylinder && (
                    <Badge variant="outline" className="text-xs text-accent">
                      CYL
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemovePoint(point.id)} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
