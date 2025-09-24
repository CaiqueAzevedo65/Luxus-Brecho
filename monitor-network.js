#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getNetworkIP, updateConfigurations } = require('./sync-network.js');

let lastKnownIP = null;
let checkInterval = null;

// Carregar último IP conhecido
function loadLastKnownIP() {
  try {
    const configPath = path.join(__dirname, 'network-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      lastKnownIP = config.backend.current_ip;
      console.log(`📍 Último IP conhecido: ${lastKnownIP}`);
    }
  } catch (error) {
    console.error('Erro ao carregar configuração:', error.message);
  }
}

// Verificar mudanças de IP
function checkNetworkChanges() {
  const currentIP = getNetworkIP();
  
  if (!currentIP) {
    console.log('⚠️  Não foi possível detectar IP da rede');
    return;
  }
  
  if (currentIP !== lastKnownIP) {
    console.log(`\n🔄 Mudança de rede detectada!`);
    console.log(`   Anterior: ${lastKnownIP || 'desconhecido'}`);
    console.log(`   Atual: ${currentIP}`);
    
    updateConfigurations();
    lastKnownIP = currentIP;
    
    console.log('\n💡 Reinicie o backend e mobile para aplicar as mudanças:');
    console.log('   1. Pare os serviços (Ctrl+C)');
    console.log('   2. Execute: npm run dev');
  } else {
    console.log(`✅ IP estável: ${currentIP} (${new Date().toLocaleTimeString()})`);
  }
}

// Iniciar monitoramento
function startMonitoring() {
  console.log('🔍 Iniciando monitoramento de rede...');
  console.log('   Verificando mudanças a cada 30 segundos');
  console.log('   Pressione Ctrl+C para parar\n');
  
  loadLastKnownIP();
  checkNetworkChanges(); // Verificação inicial
  
  checkInterval = setInterval(checkNetworkChanges, 30000); // A cada 30 segundos
}

// Parar monitoramento
function stopMonitoring() {
  if (checkInterval) {
    clearInterval(checkInterval);
    console.log('\n🛑 Monitoramento de rede interrompido');
  }
}

// Gerenciar sinais de interrupção
process.on('SIGINT', () => {
  stopMonitoring();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopMonitoring();
  process.exit(0);
});

// Executar se chamado diretamente
if (require.main === module) {
  startMonitoring();
}

module.exports = { startMonitoring, stopMonitoring };
