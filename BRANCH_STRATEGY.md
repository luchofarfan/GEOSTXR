# 🌿 GEOSTXR Branch Strategy

## Branch Structure Overview

### Main Branches
- **`main`** - Production-ready code
- **`develop`** - Integration branch for features

### Feature Branches (by Development Phase)

#### Phase 1: Foundation (4 hours)
- **`feature/foundation-setup`** - Project setup, Tailwind CSS, basic structure
- **`feature/ui-framework`** - Main layout, basic components, styling

#### Phase 2: Camera & AR Core (9 hours)
- **`feature/camera-system`** - Camera access, permissions, controls
- **`feature/ar-visualization`** - AR overlays, point visualization, BOHs
- **`feature/virtual-geometry`** - Virtual cylinder (HQ=6.35cm, height=15cm, Z-axis aligned)
- **`feature/boh-lines`** - BOH lines (z=0→15, z=15→30, 90° positioning, ±20° displacement)

#### Phase 3: Measurement Engine (16 hours)
- **`feature/point-management`** - Point detection, trio organization, persistence
- **`feature/calculation-engine`** - Angle calculations, depth measurements
- **`feature/point-trios`** - Point trio selection on cylinder surface
- **`feature/manual-depth`** - Manual depth input for first trio
- **`feature/auto-depth-calculation`** - Automatic depth calculation for subsequent trios
- **`feature/plane-generation`** - Plane generation from trio points
- **`feature/ellipse-intersection`** - Ellipse intersection between cylinder and planes
- **`feature/alpha-beta-angles`** - Alpha and beta angle measurements (dynamic)

#### Phase 4: Control Panel (3 hours)
- **`feature/control-panel`** - Camera controls, points management, data controls

#### Phase 5: Reporting (2 hours)
- **`feature/measurement-display`** - Measurement reports, real-time updates
- **`feature/ac-report`** - AC (Angle de Calce) report system

### Support Branches
- **`hotfix/urgent-fixes`** - Critical bug fixes
- **`docs/documentation`** - Documentation updates
- **`refactor/code-cleanup`** - Code improvements

## Development Workflow

### 1. Feature Development
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Work on feature...
git add .
git commit -m "feat: implement your feature"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Integration Process
```bash
# Merge feature to develop
git checkout develop
git merge feature/your-feature-name
git push origin develop
```

### 3. Release Process
```bash
# Merge develop to main for release
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

## Branch Protection Rules (Recommended)

### Main Branch
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to main

### Develop Branch
- Require pull request reviews
- Allow force pushes (for rebasing)
- Require status checks to pass

## Feature Branch Naming Convention

- `feature/phase-description` - New features
- `hotfix/issue-description` - Critical fixes
- `docs/update-description` - Documentation
- `refactor/component-name` - Code improvements

## Merge Strategy

- **Feature → Develop**: Squash and merge
- **Develop → Main**: Merge commit
- **Hotfix → Main**: Direct merge, then back to develop

## Timeline Integration

Each feature branch corresponds to a specific phase in the 20-hour development timeline:

1. **Foundation** (4h) → `feature/foundation-setup` + `feature/ui-framework`
2. **Camera & AR** (9h) → `feature/camera-system` + `feature/ar-visualization` + `feature/virtual-geometry` + `feature/boh-lines`
3. **Measurement Engine** (16h) → `feature/point-management` + `feature/calculation-engine` + `feature/point-trios` + `feature/manual-depth` + `feature/auto-depth-calculation` + `feature/plane-generation` + `feature/ellipse-intersection` + `feature/alpha-beta-angles`
4. **Control Panel** (3h) → `feature/control-panel`
5. **Reporting** (2h) → `feature/measurement-display` + `feature/ac-report`

## Virtual Geometry Specifications

### Core Virtual Cylinder
- **Diameter (HQ)**: 6.35 cm
- **Height**: 15 cm
- **Axis Alignment**: Z-axis (vertical)
- **Position**: Centered in camera feed
- **Purpose**: Reference geometry for measurements and BOHs positioning

### BOH Lines System
- **Line 1**: z=0 → z=15 (bottom to center)
- **Line 2**: z=15 → z=30 (center to top)
- **Position**: 90° on cylinder surface (adjustable)
- **Displacement Range**: ±20° around Z-axis
- **Interaction**: Smooth manual displacement via touch/drag
- **Color**: Red (#FF0000)
- **Thickness**: 0.1 cm
- **Purpose**: Reference lines for BOHs positioning and measurements

### Point Trio Selection System
- **Surface Selection**: Points selected on visible cylinder surface
- **Trio Organization**: 3 points per trio (minimum requirement)
- **Maximum Capacity**: Up to 100 trios per measurement scene
- **Visual Feedback**: Colored points by trio (Trio 1: Blue, Trio 2: Green, Trio 3: Yellow)
- **Interaction**: Touch/click to select points
- **Validation**: Ensure points form valid triangle on cylinder surface
- **Memory Management**: Optimized for handling 100 trios efficiently

### Manual Depth Input System
- **First Trio**: Requires manual depth input for calibration
- **Input Interface**: Numeric input field for depth value
- **Depth Range**: 0.1cm to 100cm (configurable)
- **Validation**: Ensure depth value is within valid range
- **Purpose**: Establish measurement scale and reference
- **Units**: Centimeters (cm) as primary unit

### Automatic Depth Calculation System
- **Subsequent Trios**: Automatic depth calculation using cylinder diameter
- **Cylinder Diameter**: 6.35 cm (HQ) as known reference
- **Z-Axis Intersection**: Plane position assigned to Z-axis intersection point
- **Mathematical Formula**: depth = f(cylinder_diameter, z_intersection_point, relative_angle)
- **Precision**: High accuracy using geometric calculations
- **Purpose**: Eliminate manual input for subsequent measurements
- **Scalability**: Efficient calculation for up to 100 trios

### Alpha and Beta Angle Measurement System
- **Alpha Angle**: Measurement relative to Z-axis for each plane
- **Beta Angle**: Measurement relative to corresponding BOH line
- **Dynamic Beta**: Beta responds to BOH line displacement
- **Relative Position**: Beta calculated based on plane's relative position
- **Real-time Updates**: Measurements update dynamically with BOH movement
- **Precision**: High accuracy angle calculations for all 100 planes
- **Performance**: Optimized calculation for large datasets

### AC (Angle de Calce) Report System
- **AC Calculation**: Angle between both BOH lines
- **BOH Relative Position**: Position of each BOH line in the report
- **Angle Between BOHs**: Dynamic calculation of angle between BOH lines
- **Report Integration**: AC included in measurement report
- **Real-time Updates**: AC updates with BOH displacement
- **Visualization**: AC displayed in measurement report panel

### Plane Generation System
- **Per Trio**: Each trio generates a unique plane
- **Plane Definition**: Plane defined by 3 points of the trio
- **Maximum Capacity**: Up to 100 planes per measurement scene
- **Z-Axis Intersection**: Plane position assigned to Z-axis intersection point
- **Visualization**: Semi-transparent planes with different colors
- **Mathematical**: Plane equation: ax + by + cz + d = 0
- **Position Reference**: Z-coordinate of intersection point as plane position
- **Purpose**: Base for geometric calculations and measurements
- **Performance**: Optimized rendering for 100 planes

## Next Steps

1. Start with `feature/foundation-setup`
2. Complete Phase 1 features before moving to Phase 2
3. Use feature branches for parallel development when possible
4. Regular integration through `develop` branch
5. Release to `main` when MVP is complete
