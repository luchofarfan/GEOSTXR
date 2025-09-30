# BOH Interactive Controls - Implementation Specification

## Overview
Implement touch/drag interaction for BOH lines to allow manual angular displacement within ±20° range (70° to 110°).

## Current State (✅ Completed)
- ✅ Virtual cylinder rendering with perfect mask alignment
- ✅ BOH lines static rendering at 90°
- ✅ `use-boh-lines` hook with angle management
- ✅ BOH controls UI component structure

## Implementation Plan

### 1. Update `final-aligned-cylinder.tsx` (Main Changes)

#### 1.1. Convert to Continuous Rendering
- **Current**: Single render after mount
- **Target**: Animation loop with `requestAnimationFrame`
- **Reason**: Need to update BOH lines in real-time during interaction

```typescript
// Add animation loop
let animationId: number
const animate = () => {
  animationId = requestAnimationFrame(animate)
  // Update BOH lines based on current angles
  updateBOHLines(line1Angle, line2Angle)
  renderer.render(scene, camera)
}
animate()
```

#### 1.2. Add BOH Lines State Management
- **Add state**: `line1Angle`, `line2Angle` (using `useBOHLines` hook)
- **Add ref**: Store BOH line meshes for updates
- **Update function**: Recreate BOH lines when angles change

```typescript
const { state, actions } = useBOHLines()
const bohLine1Ref = useRef<THREE.Line | null>(null)
const bohLine2Ref = useRef<THREE.Line | null>(null)
```

#### 1.3. Implement Touch/Mouse Event Handlers
- **Events**: `onPointerDown`, `onPointerMove`, `onPointerUp`
- **Detection**: Raycasting to detect which BOH line is being touched
- **Calculation**: Convert screen coordinates to angular displacement

```typescript
const handlePointerDown = (event: React.PointerEvent) => {
  // 1. Get canvas coordinates
  // 2. Raycast to detect BOH line intersection
  // 3. Set active BOH line
  // 4. Store initial angle
}

const handlePointerMove = (event: React.PointerEvent) => {
  // 1. Calculate delta from initial position
  // 2. Convert delta to angular displacement
  // 3. Update active BOH line angle (clamped 70°-110°)
}

const handlePointerUp = () => {
  // 1. Clear active BOH line
  // 2. Finalize angle
}
```

#### 1.4. Update BOH Lines Geometry
- **Function**: `updateBOHLines(line1Angle, line2Angle)`
- **Action**: Recalculate line positions based on angles
- **Formula**: Convert angle to cylindrical coordinates

```typescript
const updateBOHLines = (angle1: number, angle2: number) => {
  const angleRad1 = (angle1 * Math.PI) / 180
  const angleRad2 = (angle2 * Math.PI) / 180
  
  // Line 1: bottom to center
  const x1 = radius * Math.cos(angleRad1)
  const y1 = radius * Math.sin(angleRad1)
  
  // Update geometry...
}
```

### 2. Update `boh-controls.tsx` (UI Enhancements)

#### 2.1. Display Current Angles
```typescript
<div className="flex items-center justify-between">
  <span>BOH Line 1:</span>
  <span className="font-mono">{line1Angle.toFixed(1)}°</span>
</div>
```

#### 2.2. Add Visual Indicators
- **Color coding**: Green (90°), Yellow (75-89° or 91-105°), Red (70-74° or 106-110°)
- **Progress bar**: Visual representation of displacement

#### 2.3. Reset Button
```typescript
<button onClick={actions.resetAngles}>
  Reset to 90°
</button>
```

### 3. Add Visual Feedback During Interaction

#### 3.1. Highlight Active BOH Line
- **Glow effect**: Increase line width and add emissive material
- **Color change**: Brighter red during interaction

#### 3.2. Show Angle Label
- **Sprite/Text**: Display current angle near the BOH line
- **Position**: Follow the line during drag

### 4. Optional Enhancements

#### 4.1. Angle Snapping
- **Snap to**: 5° increments (70°, 75°, 80°, ..., 110°)
- **Toggle**: Enable/disable snapping

#### 4.2. Haptic Feedback
- **Vibration**: On snap points (if supported)

#### 4.3. Undo/Redo
- **History**: Store angle changes
- **Buttons**: Undo/Redo last changes

## Technical Considerations

### Performance
- **Rendering**: Optimize to maintain 30+ FPS
- **Event throttling**: Debounce pointer move events if needed

### Accessibility
- **Keyboard controls**: Arrow keys to adjust angles
- **Screen readers**: Announce angle changes

### Testing
- **Touch devices**: Test on mobile/tablet
- **Mouse devices**: Test on desktop
- **Edge cases**: Test at min/max angles (70°, 110°)

## Success Criteria
- ✅ BOH lines can be dragged smoothly with touch/mouse
- ✅ Angles are constrained to 70°-110° range
- ✅ Visual feedback during interaction (highlight, glow)
- ✅ Current angles displayed in UI
- ✅ Reset button restores 90° angles
- ✅ Performance remains smooth (30+ FPS)

## Estimated Time
- **Core functionality**: 1.5 hours
- **Visual feedback**: 0.5 hours
- **Testing & refinement**: 0.5 hours
- **Total**: 2.5 hours

## Next Steps (Priority Order)
1. Convert `final-aligned-cylinder.tsx` to continuous rendering
2. Add pointer event handlers and raycasting
3. Implement `updateBOHLines` function
4. Add visual feedback (highlight, glow)
5. Update `boh-controls.tsx` to display angles
6. Add reset button functionality
7. Test on different devices
8. Add optional enhancements if time permits
