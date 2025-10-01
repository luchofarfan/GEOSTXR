import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
// import "./globals.css" // CSS processing issue - using inline styles instead

export const metadata: Metadata = {
  title: "GeoStVR - Structural Logging AR",
  description: "Professional AR application for structural measurement and logging",
  generator: "GeoStVR v31",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, sans-serif;
              background: #0a0a0a;
              color: #ffffff;
              min-height: 100vh;
            }
            .min-h-screen { min-height: 100vh; }
            .bg-background { background-color: #0a0a0a; }
            .text-foreground { color: #ffffff; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-2 { gap: 0.5rem; }
            button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 0.375rem;
              cursor: pointer;
              font-size: 0.875rem;
              font-weight: 500;
              transition: all 0.2s;
            }
            button:hover { background: #2563eb; }
            button:disabled { opacity: 0.5; cursor: not-allowed; }
            .rounded-xl { border-radius: 0.75rem; }
            .border { border: 1px solid #333; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            .p-8 { padding: 2rem; }
            .p-4 { padding: 1rem; }
            .p-3 { padding: 0.75rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .font-bold { font-weight: 700; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .font-semibold { font-weight: 600; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-center { text-align: center; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mt-4 { margin-top: 1rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .relative { position: relative; }
            .absolute { position: absolute; }
            .top-4 { top: 1rem; }
            .left-4 { left: 1rem; }
            .right-4 { right: 1rem; }
            .w-80 { width: 20rem; }
            .h-6 { height: 1.5rem; }
            .w-6 { width: 1.5rem; }
            .h-4 { height: 1rem; }
            .w-4 { width: 1rem; }
            .flex-1 { flex: 1 1 0%; }
            .flex-col { flex-direction: column; }
            .border-l { border-left: 1px solid #333; }
            .border-t { border-top: 1px solid #333; }
            .bg-muted { background-color: #1a1a1a; }
            .bg-primary { background-color: #3b82f6; }
            .bg-secondary { background-color: #374151; }
            .bg-accent { background-color: #10b981; }
            .text-primary { color: #3b82f6; }
            .text-secondary { color: #9ca3af; }
            .text-muted-foreground { color: #6b7280; }
            .border-b { border-bottom: 1px solid #333; }
            .bg-card { background-color: rgba(0, 0, 0, 0.8); }
            .backdrop-blur-sm { backdrop-filter: blur(4px); }
            /* Mobile responsive styles */
            @media (max-width: 768px) {
              .w-80 { width: 100%; }
              .md\\:hidden { display: none; }
              .md\\:flex { display: flex; }
              .md\\:relative { position: relative; }
              .md\\:translate-x-0 { transform: translateX(0); }
              .md\\:opacity-100 { opacity: 1; }
            }
            
            @media (min-width: 769px) {
              .md\\:hidden { display: none; }
              .md\\:flex { display: flex; }
              .md\\:relative { position: relative; }
              .md\\:translate-x-0 { transform: translateX(0); }
              .md\\:opacity-100 { opacity: 1; }
            }
            
            /* Mobile-specific styles */
            .fixed { position: fixed; }
            .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
            .z-40 { z-index: 40; }
            .z-50 { z-index: 50; }
            .translate-x-full { transform: translateX(100%); }
            .translate-x-0 { transform: translateX(0); }
            .opacity-0 { opacity: 0; }
            .opacity-100 { opacity: 1; }
            .transition-all { transition: all 0.3s ease-in-out; }
            .duration-300 { transition-duration: 300ms; }
            .ease-in-out { transition-timing-function: ease-in-out; }
            .bg-black\\/50 { background-color: rgba(0, 0, 0, 0.5); }
            .touch-manipulation { touch-action: manipulation; }
            
            /* Estilos para paneles flotantes con fondo transparente */
            .floating-panel-content {
              color: white !important;
            }
            .floating-panel-content h3,
            .floating-panel-content h4,
            .floating-panel-content h5,
            .floating-panel-content label,
            .floating-panel-content span:not(.text-green-900):not(.text-yellow-900):not(.text-blue-900),
            .floating-panel-content p,
            .floating-panel-content div:not(.bg-green-50):not(.bg-yellow-50):not(.bg-blue-50):not(.bg-purple-50) {
              color: white !important;
              text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
            }
            .floating-panel-content input[type="range"] {
              background: rgba(255, 255, 255, 0.2);
            }
            .floating-panel-content input[type="checkbox"] {
              filter: brightness(1.2) contrast(1.3);
            }
            .floating-panel-content .text-gray-600,
            .floating-panel-content .text-gray-700,
            .floating-panel-content .text-gray-800,
            .floating-panel-content .text-gray-900 {
              color: rgba(255, 255, 255, 0.9) !important;
            }
          `
        }} />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
