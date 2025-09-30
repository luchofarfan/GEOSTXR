# Known Issues - GEOSTXR

## Issue #1: Mask-Cylinder Alignment Varies with Viewport Size

### Status: 🔴 ACTIVE - HIGH PRIORITY

### Description:
Camera feed mask and virtual cylinder alignment varies significantly depending on viewport dimensions. The mask position/size that works for one viewport size (e.g., 1284×827) does not work for another (e.g., 931×827 or 1359×1103).

### Root Cause:
**Primary Issue: Three.js Projection Failure**
- Using `vector.project(camera)` to calculate mask coordinates
- Projection produces NDC values outside valid range (e.g., Y: -119% to 219%)
- This suggests fundamental incompatibility between Three.js projection and CSS coordinate systems
- Container dimensions change on every refresh/resize, causing different projections

**Current Architecture Limitation:**
- Video element and Three.js canvas are separate overlays
- Mask applied via CSS clipPath on video element
- Cylinder rendered on separate transparent canvas
- No guaranteed synchronization between the two coordinate systems

**Attempted Solutions (All Failed):**
1. ✗ Dynamic projection-based mask calculation
2. ✗ Fixed mask values (only work for specific viewport sizes)
3. ✗ Aspect-ratio adaptive mask values
4. ✗ Camera distance adjustments (1.5x, 2.0x, fixed 25, 30, 39.1)
5. ✗ Manual margin adjustments (+1%, +0.3%, etc.)

### Current Behavior:
1. Initial render with specific viewport size: ✅ Can achieve good alignment
2. Viewport resize/different device: ⚠️ Alignment breaks completely
3. Fixed mask values only work for narrow range of viewport sizes
4. BOH controls work perfectly: ✅ Sliders update angles smoothly
5. Animation loop works: ✅ No scene re-creation on angle changes

### Expected Behavior:
1. Mask-cylinder alignment perfect across ALL viewport sizes
2. Alignment maintained during viewport resize
3. Alignment maintained when BOH angles change
4. No manual adjustment needed for different devices

### Recommended Solution for Next Session:

#### Unified WebGL Rendering (Complete Architecture Change)

**Concept**: Instead of separate video + canvas overlays, render everything in a single WebGL context.

```typescript
// 1. Create a plane geometry that fills the viewport
const planeGeometry = new THREE.PlaneGeometry(viewportWidth, viewportHeight)

// 2. Use video as texture on the plane
const videoTexture = new THREE.VideoTexture(videoElement)
const planeMaterial = new THREE.MeshBasicMaterial({ map: videoTexture })
const videoPlane = new THREE.Mesh(planeGeometry, planeMaterial)

// 3. Create cylinder geometry with hole (or use shader for masking)
// 4. Render cylinder on top with proper depth/stencil buffer
// 5. Everything in same 3D space = guaranteed alignment

// Result: Video feed only visible "through" the cylinder
// No CSS masking needed - all handled in WebGL
```

**Advantages**:
- Perfect alignment guaranteed (single coordinate system)
- Responsive to any viewport size
- No CSS clipPath issues
- Better performance (single render pass)
- Easier to add 3D effects later

**Implementation Time**: 2-3 hours

### Implementation Priority:
🔥 HIGH - Affects core functionality and user experience

### Estimated Fix Time:
2-3 hours (complete architecture change recommended)

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
