# 🎯 Virtual Geometry Specifications - GEOSTXR

## Core Virtual Cylinder

### Physical Specifications
- **Diameter (HQ)**: 6.35 cm
- **Height**: 15 cm (z=0 to z=15)
- **Volume**: ~475.5 cm³
- **Surface Area**: ~350.2 cm²

### BOH (Bottom Of Hole) Lines
- **Position**: On cylinder surface at 90° angle (adjustable)
- **Line 1**: z=0 → z=15 (bottom to center)
- **Line 2**: z=15 → z=30 (center to top)
- **Orientation**: Vertical, parallel to Z-axis
- **Displacement Range**: ±20° around Z-axis
- **Interaction**: Smooth manual displacement via touch/drag
- **Purpose**: Reference lines for measurements and BOHs positioning

### Coordinate System Alignment
- **Primary Axis**: Z-axis (vertical)
- **Position**: Centered in camera feed
- **Orientation**: Vertical alignment with world coordinates
- **Origin**: Camera feed center point

### Technical Implementation

#### 3D Geometry Parameters
```typescript
interface VirtualCylinder {
  diameter: number;    // 6.35 cm
  height: number;      // 15 cm
  radius: number;      // 3.175 cm
  position: Vector3;   // [0, 0, 0] - centered
  rotation: Vector3;   // [0, 0, 0] - Z-axis aligned
  material: {
    opacity: number;   // 0.3 - semi-transparent
    color: string;     // "#00BFFF" - blue
    wireframe: boolean; // true for development
  };
  bohLines: {
    line1: {
      start: Vector3;  // [0, 0, 0] - bottom
      end: Vector3;    // [0, 0, 15] - center
      color: string;   // "#FF0000" - red
      thickness: number; // 0.1 cm
      angle: number;    // 90° (default), adjustable ±20°
      interactive: boolean; // true for touch/drag
    };
    line2: {
      start: Vector3;  // [0, 0, 15] - center
      end: Vector3;    // [0, 0, 30] - top
      color: string;   // "#FF0000" - red
      thickness: number; // 0.1 cm
      angle: number;    // 90° (default), adjustable ±20°
      interactive: boolean; // true for touch/drag
    };
    displacement: {
      minAngle: number; // 70° (90° - 20°)
      maxAngle: number; // 110° (90° + 20°)
      smoothness: number; // 0.1 - smoothness factor
      sensitivity: number; // 1.0 - touch sensitivity
    };
  };
}
```

#### AR Overlay Requirements
- **Rendering**: Real-time 3D overlay on camera feed
- **Interaction**: Touch/drag for positioning
- **BOH Lines Interaction**: Smooth manual displacement ±20° around Z-axis
- **Scaling**: Maintain real-world dimensions
- **Visibility**: Toggle on/off
- **Transparency**: Adjustable opacity (0.1 - 0.8)
- **Smooth Movement**: Interpolated displacement for natural feel

### Integration with Measurement System

#### BOHs (Reference Points) Positioning
- **Bottom Point**: Z = 0 cm (cylinder bottom)
- **Center Point**: Z = 15 cm (cylinder center)
- **Top Point**: Z = 30 cm (cylinder top)
- **BOH Line 1**: Z = 0 to 15 cm (bottom to center)
- **BOH Line 2**: Z = 15 to 30 cm (center to top)
- **Radius Points**: 3.175 cm from center axis

#### Point Trio Selection System
- **Surface Selection**: Points selected on visible cylinder surface
- **Trio Organization**: 3 points per trio (minimum requirement)
- **Maximum Capacity**: Up to 100 trios per measurement scene
- **Visual Feedback**: Colored points by trio (e.g., Trio 1: Blue, Trio 2: Green, Trio 3: Yellow)
- **Interaction**: Touch/click to select points
- **Validation**: Ensure points form valid triangle on cylinder surface
- **Memory Management**: Optimized for handling 100 trios efficiently

#### Manual Depth Input System
- **First Trio**: Requires manual depth input for calibration
- **Input Interface**: Numeric input field for depth value
- **Depth Range**: Configurable range (e.g., 0.1cm to 100cm)
- **Validation**: Ensure depth value is within valid range
- **Purpose**: Establish measurement scale and reference
- **Units**: Centimeters (cm) as primary unit

#### Automatic Depth Calculation System
- **Subsequent Trios**: Automatic depth calculation using cylinder diameter
- **Cylinder Diameter**: 6.35 cm (HQ) as known reference
- **Plane Position**: Assigned to Z-axis intersection point of cylinder
- **Z-Axis Intersection**: Point where plane intersects cylinder's vertical axis
- **Mathematical Formula**: depth = f(cylinder_diameter, z_intersection_point, relative_angle)
- **Precision**: High accuracy using geometric calculations
- **Purpose**: Eliminate manual input for subsequent measurements

#### Plane Generation System
- **Per Trio**: Each trio generates a unique plane
- **Plane Definition**: Plane defined by 3 points of the trio
- **Maximum Capacity**: Up to 100 planes per measurement scene
- **Z-Axis Intersection**: Plane position assigned to Z-axis intersection point
- **Visualization**: Semi-transparent planes with different colors
- **Mathematical**: Plane equation: ax + by + cz + d = 0
- **Position Reference**: Z-coordinate of intersection point as plane position
- **Purpose**: Base for geometric calculations and measurements
- **Performance**: Optimized rendering for 100 planes

#### Ellipse Intersection System
- **Cylinder-Plane Intersection**: Ellipse drawn at intersection of cylinder and each plane
- **Maximum Capacity**: Up to 100 ellipses per measurement scene
- **Visualization**: Semi-transparent ellipse on each plane
- **Mathematical Definition**: Ellipse defined by cylinder-plane intersection
- **Color Coding**: Different colors for each plane's ellipse
- **Real-time Updates**: Ellipse updates as planes are repositioned
- **Purpose**: Clear visualization of intersection and precise calculations
- **Performance**: Optimized rendering for 100 ellipses

#### Measurement Calculations
- **Angular Measurements**: Relative to cylinder axis and BOH lines
- **Depth Measurements**: Along Z-axis within cylinder bounds
- **Distance Calculations**: From cylinder surface to detected points
- **Plane Intersections**: Between generated planes and cylinder
- **Angle Between Planes**: Calculated from trio-generated planes
- **Trio Validation**: Ensure points form valid geometric triangles

#### Alpha and Beta Angle Measurements
- **Alpha Angle**: Measurement relative to Z-axis for each plane
- **Beta Angle**: Measurement relative to corresponding BOH line
- **Dynamic Beta**: Beta responds to BOH line displacement
- **Relative Position**: Beta calculated based on plane's relative position
- **Real-time Updates**: Measurements update dynamically with BOH movement
- **Precision**: High accuracy angle calculations for all 100 planes

#### AC (Angle de Calce) Report System
- **AC Calculation**: Angle between both BOH lines
- **BOH Relative Position**: Position of each BOH line in the report
- **Angle Between BOHs**: Dynamic calculation of angle between BOH lines
- **Report Integration**: AC included in measurement report
- **Real-time Updates**: AC updates with BOH displacement
- **Visualization**: AC displayed in measurement report panel

### Development Phases

#### Phase 1: Basic Geometry (1 hour)
- [ ] Create cylinder 3D model
- [ ] Implement BOH lines (z=0→15, z=15→30)
- [ ] Add Z-axis alignment
- [ ] Test coordinate system integration

#### Phase 2: AR Integration (1 hour)
- [ ] Overlay on camera feed
- [ ] Real-time positioning
- [ ] Touch interaction
- [ ] Visibility controls
- [ ] BOH lines rendering and interaction
- [ ] Smooth BOH lines displacement (±20° range)
- [ ] Touch/drag interaction for BOH lines positioning

#### Phase 3: Point Trio System (1 hour)
- [ ] Point selection on cylinder surface
- [ ] Trio organization (3 points per trio)
- [ ] Visual feedback with colors
- [ ] Point validation and constraints
- [ ] Trio management (add/remove/clear)
- [ ] Manual depth input for first trio
- [ ] Depth validation and range checking
- [ ] Support for up to 100 trios per scene
- [ ] Memory optimization for large datasets

#### Phase 4: Plane Generation (1 hour)
- [ ] Plane calculation from trio points
- [ ] Plane visualization (semi-transparent)
- [ ] Plane intersection with cylinder
- [ ] Angle calculations between planes
- [ ] Plane persistence and management
- [ ] Support for up to 100 planes per scene
- [ ] Performance optimization for large datasets

#### Phase 4.1: Ellipse Intersection (1 hour)
- [ ] Calculate ellipse intersection between cylinder and each plane
- [ ] Draw ellipse visualization on each plane
- [ ] Implement ellipse color coding per plane
- [ ] Add real-time ellipse updates
- [ ] Create ellipse mathematical calculations
- [ ] Support for up to 100 ellipses per scene
- [ ] Performance optimization for large datasets

#### Phase 5: Automatic Depth Calculation (1 hour)
- [ ] Implement automatic depth calculation for subsequent trios
- [ ] Use cylinder diameter (6.35cm) as reference
- [ ] Calculate Z-axis intersection point for each plane
- [ ] Assign plane position to Z-axis intersection point
- [ ] Implement geometric depth formula using Z-intersection
- [ ] Add depth calculation validation and error handling

#### Phase 6: Alpha and Beta Angle Measurements (1 hour)
- [ ] Implement alpha angle measurement relative to Z-axis
- [ ] Implement beta angle measurement relative to BOH lines
- [ ] Add dynamic beta calculation responding to BOH displacement
- [ ] Create real-time angle updates for all 100 planes
- [ ] Add angle measurement precision and validation
- [ ] Implement angle display and reporting system

#### Phase 7: AC (Angle de Calce) Report System (1 hour)
- [ ] Implement AC calculation between both BOH lines
- [ ] Add BOH relative position tracking in report
- [ ] Create angle between BOHs calculation
- [ ] Integrate AC into measurement report
- [ ] Add real-time AC updates with BOH displacement
- [ ] Implement AC visualization in report panel

### Technical Stack Requirements

#### 3D Rendering
- **WebGL/Three.js**: For 3D geometry rendering
- **AR.js**: For camera integration
- **WebXR**: For advanced AR features (future)

#### Coordinate System
- **World Coordinates**: Real-world measurements
- **Camera Coordinates**: Screen space mapping
- **Cylinder Coordinates**: Local geometry space

### Performance Considerations

#### Rendering Optimization
- **LOD (Level of Detail)**: Adjust geometry complexity
- **Frustum Culling**: Only render visible geometry
- **Texture Optimization**: Minimal texture usage
- **Frame Rate**: Maintain 30+ FPS

#### Memory Management
- **Geometry Buffers**: Efficient vertex data
- **Texture Caching**: Reuse common materials
- **Garbage Collection**: Minimize object creation

### Testing Requirements

#### Visual Testing
- [ ] Cylinder appears correctly in camera feed
- [ ] Dimensions match real-world specifications
- [ ] Z-axis alignment is accurate
- [ ] Transparency and wireframe modes work

#### Measurement Testing
- [ ] BOHs positioning relative to cylinder
- [ ] Angular calculations using cylinder axis
- [ ] Depth measurements within cylinder bounds
- [ ] Real-world scale accuracy

### Future Enhancements

#### Advanced Features
- **Multiple Geometries**: Support for different shapes
- **Custom Dimensions**: User-defined cylinder parameters
- **Animation**: Smooth transitions and interactions
- **Export**: 3D model export capabilities

#### Integration Features
- **CAD Integration**: Import/export CAD models
- **Cloud Sync**: Share geometry configurations
- **Collaboration**: Multi-user geometry editing
- **Analytics**: Usage and measurement statistics
