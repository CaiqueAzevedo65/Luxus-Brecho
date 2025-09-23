# Script de inicialização do ambiente de desenvolvimento Luxus Brechó
Write-Host "🚀 Iniciando ambiente de desenvolvimento Luxus Brechó..." -ForegroundColor Green

# 1. Sincronizar configurações de rede
Write-Host "📡 Sincronizando configurações de rede..." -ForegroundColor Yellow
node sync-network.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao sincronizar configurações de rede" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Aguardando configurações serem aplicadas..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# 2. Verificar se as portas estão livres
Write-Host "🔍 Verificando portas..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "⚠️  Porta 5000 já está em uso. Tentando liberar..." -ForegroundColor Yellow
    Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# 3. Iniciar backend
Write-Host "🖥️  Iniciando backend..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "run.py" -WorkingDirectory ".\backend" -WindowStyle Normal

# 4. Aguardar backend inicializar
Write-Host "⏳ Aguardando backend inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 5. Testar conectividade do backend
Write-Host "🔗 Testando conectividade do backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://192.168.0.3:5000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend respondendo corretamente!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend pode não estar respondendo ainda. Continuando..." -ForegroundColor Yellow
}

# 6. Iniciar mobile
Write-Host "📱 Iniciando mobile..." -ForegroundColor Cyan
Start-Process -FilePath "npx" -ArgumentList "expo", "start", "--clear" -WorkingDirectory ".\mobile" -WindowStyle Normal

Write-Host "🎉 Ambiente iniciado com sucesso!" -ForegroundColor Green
Write-Host "💡 Dicas:" -ForegroundColor Yellow
Write-Host "   - Backend: http://192.168.0.3:5000" -ForegroundColor White
Write-Host "   - Mobile: Escaneie o QR code no terminal do Expo" -ForegroundColor White
Write-Host "   - Para parar: Feche as janelas dos terminais" -ForegroundColor White
