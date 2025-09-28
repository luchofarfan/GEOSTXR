# GeoStVR - Structural Logging AR Application

A Next.js Progressive Web Application (PWA) for structural logging and measurement using Augmented Reality technology. GeoStVR enables precise structural analysis through camera-based point tracking, angle measurements, and depth calculations.

## 🎯 Overview

GeoStVR is a professional-grade AR application designed for structural engineers, surveyors, and construction professionals. The application provides real-time measurement capabilities through camera integration, allowing users to capture structural data, calculate angles between reference points (BOHs), and generate comprehensive measurement reports.

## 🚀 Key Features

### Core Functionality

- **Camera Integration**: Real-time camera feed with AR overlay capabilities
- **Point Tracking**: Precise tracking of measurement points with trio-based organization
- **BOHs Management**: Reference point system for structural measurements
- **Angle Calculations**: Automatic calculation of angles between reference points
- **Depth Measurements**: Manual and automatic depth measurement capabilities
- **Data Export**: Comprehensive reporting and data export functionality
- **Offline Support**: Full PWA capabilities for field work without internet connection

### User Interface

- **Central Visualizer**: Blue measurement band with point visualization
- **Control Panel**: Camera controls, point management, and data operations
- **Measurement Report**: Real-time display of calculated angles and depths
- **Export System**: Multiple export formats for professional reporting

## 🛠 Technical Stack

### Frontend Framework

- **Next.js 14**: React framework with App Router for optimal performance
- **TypeScript**: Type-safe development with enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: Smooth animations and transitions

### AR & Camera Integration

- **MediaDevices API**: Native camera access and control
- **WebRTC**: Real-time camera streaming capabilities
- **Canvas API**: Custom AR overlay rendering
- **WebGL**: Advanced graphics rendering for measurement visualization

### State Management & Data

- **Zustand**: Lightweight state management for app state
- **React Query**: Server state management and caching
- **IndexedDB**: Local data storage for offline functionality
- **File System Access API**: Native file operations

### PWA & Offline Support

- **Workbox**: Service worker management and caching strategies
- **Web App Manifest**: PWA configuration and installation
- **Cache API**: Offline data storage and retrieval
- **Background Sync**: Data synchronization when connection is restored

### Development & Build Tools

- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting and consistency
- **Husky**: Git hooks for pre-commit validation
- **Vercel**: Deployment and hosting platform

## 📱 PWA Capabilities

### Offline Functionality

- Complete app functionality without internet connection
- Local data storage and retrieval
- Background data synchronization
- Offline measurement and calculation capabilities

### Installation & Performance

- Native app-like installation experience
- Fast loading and responsive interface
- Optimized bundle size and caching strategies
- Cross-platform compatibility (iOS, Android, Desktop)

## 🏗 Architecture

### Component Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
│   ├── camera/            # Camera and AR components
│   ├── measurement/       # Measurement visualization
│   ├── controls/          # Control panel components
│   └── reports/           # Report and export components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── stores/                # Zustand state stores
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

### Data Flow

1. **Camera Input**: Real-time camera feed processing
2. **Point Detection**: AR point tracking and validation
3. **Measurement Calculation**: Real-time angle and depth calculations
4. **Data Storage**: Local storage with IndexedDB
5. **Report Generation**: Comprehensive measurement reports
6. **Export System**: Multiple format support (PDF, CSV, JSON)

## 🎨 Design System

### Visual Elements

- **Color Scheme**: Professional blue and grey palette
- **Typography**: Clean, readable fonts optimized for field use
- **Icons**: Consistent iconography for intuitive navigation
- **Responsive Design**: Optimized for mobile and tablet devices

### User Experience

- **Intuitive Controls**: Simple, gesture-based interactions
- **Real-time Feedback**: Immediate visual confirmation of actions
- **Professional Interface**: Clean, uncluttered design for field work
- **Accessibility**: WCAG compliant design for inclusive usage

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Modern web browser with camera support
- HTTPS environment for camera access (required for production)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd geostvr

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_APP_NAME=GeoStVR
NEXT_PUBLIC_APP_VERSION=v31
NEXT_PUBLIC_CAMERA_RESOLUTION=1920x1080
```

## 📊 Performance Optimization

### Bundle Optimization

- Code splitting and lazy loading
- Image optimization with Next.js Image component
- Tree shaking for minimal bundle size
- Service worker caching strategies

### Runtime Performance

- Efficient state management with Zustand
- Optimized re-rendering with React.memo
- Debounced calculations for smooth performance
- Memory management for long-running sessions

## 🔒 Security & Privacy

### Data Protection

- Local-first data storage
- No external data transmission without consent
- Secure camera access permissions
- Privacy-compliant data handling

### Security Measures

- HTTPS enforcement for production
- Content Security Policy implementation
- Secure camera API usage
- Input validation and sanitization

## 🚀 Deployment

### Production Build

- Optimized Next.js build with static generation
- PWA manifest and service worker configuration
- CDN-ready static assets
- Environment-specific configurations

### Hosting Options

- **Vercel**: Recommended for seamless Next.js deployment
- **Netlify**: Alternative with excellent PWA support
- **Self-hosted**: Docker containerization support

## 📈 Future Enhancements

### Planned Features

- Advanced AR visualization with WebXR
- Cloud synchronization capabilities
- Multi-user collaboration features
- Advanced measurement algorithms
- Integration with CAD software
- Machine learning-based point detection

### Scalability Considerations

- Modular architecture for easy feature addition
- Plugin system for custom measurement tools
- API integration for external data sources
- Multi-language support for international usage

---

**GeoStVR v31** - Professional Structural Logging with Augmented Reality
