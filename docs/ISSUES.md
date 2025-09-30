# Known Issues - GEOSTXR

## Issue #1: Mask Misalignment on BOH Angle Changes

### Status: 🔴 ACTIVE

### Description:
When BOH line angles are changed via sliders, the entire scene re-renders, causing the camera feed mask to misalign with the virtual cylinder.

### Root Cause:
- `final-aligned-cylinder.tsx` has `[line1Angle, line2Angle]` as dependencies in `useEffect`
- When angles change, the entire scene is disposed and recreated
- This causes the mask calculation to happen again, sometimes with different container dimensions
- The timing of mask application vs. cylinder rendering becomes desynchronized

### Current Behavior:
1. Initial render: ✅ Cylinder and mask perfectly aligned
2. Change BOH angle via slider: ⚠️ Mask shifts position
3. Feed visible outside cylinder boundaries

### Expected Behavior:
1. Mask calculated once on mount
2. BOH lines update smoothly without re-rendering entire scene
3. Mask remains aligned regardless of angle changes

### Solution Approach:

#### Option 1: Continuous Animation Loop (Recommended)
```typescript
// Store persistent references
const sceneRef = useRef<THREE.Scene | null>(null)
const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
const bohLine1Ref = useRef<THREE.Line | null>(null)
const bohLine2Ref = useRef<THREE.Line | null>(null)

// Initialize scene ONCE (no dependencies)
useEffect(() => {
  // Create scene, renderer, camera
  // Calculate mask ONCE
  // Start animation loop
  
  const animate = () => {
    requestAnimationFrame(animate)
    // Update BOH lines based on current angles
    // Render scene
  }
  animate()
  
  return cleanup
}, []) // NO dependencies

// Separate effect for updating BOH lines
useEffect(() => {
  if (!bohLine1Ref.current || !bohLine2Ref.current) return
  
  // Update only BOH line geometry
  updateBOHLineGeometry(bohLine1Ref.current, line1Angle)
  updateBOHLineGeometry(bohLine2Ref.current, line2Angle)
}, [line1Angle, line2Angle])
```

#### Option 2: Memoize Mask Calculation
```typescript
const maskStyle = useMemo(() => {
  // Calculate once based on initial container dimensions
  return calculateMask(containerRef.current)
}, []) // Empty dependencies - calculate only once
```

### Implementation Priority:
🔥 HIGH - Affects core functionality and user experience

### Estimated Fix Time:
30-45 minutes

### Related Files:
- `components/geometry/final-aligned-cylinder.tsx`
- `components/camera/camera-with-cylinder.tsx`

### Testing Checklist:
- [ ] Mask aligned on initial load
- [ ] Mask remains aligned when changing BOH Line 1 angle
- [ ] Mask remains aligned when changing BOH Line 2 angle
- [ ] Mask remains aligned after multiple angle changes
- [ ] Performance: 30+ FPS during angle changes
- [ ] No memory leaks on multiple renders

---

## Issue #2: [Future issues will be documented here]
