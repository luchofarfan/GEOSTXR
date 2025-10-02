# Script para iniciar túnel HTTPS con localtunnel
Write-Host "🚀 Iniciando túnel HTTPS para GeoStXR..." -ForegroundColor Green
Write-Host ""
Write-Host "Asegúrate de que el servidor esté corriendo (npm run dev)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Generando URL pública..." -ForegroundColor Cyan
Write-Host ""

npx localtunnel --port 3000

