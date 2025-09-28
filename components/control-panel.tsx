"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Calculator, Zap, Grid3X3 } from "lucide-react"

interface ControlPanelProps {
  onReset: () => void
  onCalculate: () => void
  activeMode: "measure" | "track" | "calculate"
  isRecording: boolean
}

export function ControlPanel({ onReset, onCalculate, activeMode, isRecording }: ControlPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2 bg-transparent" disabled={isRecording}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={onCalculate} className="gap-2 bg-transparent">
            <Calculator className="h-4 w-4" />
            Calculate
          </Button>
        </div>

        <div className="space-y-2">
          <Button
            variant={activeMode === "measure" ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Point Tracking
          </Button>
          <Button
            variant={activeMode === "calculate" ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2"
          >
            <Zap className="h-4 w-4" />
            Auto Calculate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
