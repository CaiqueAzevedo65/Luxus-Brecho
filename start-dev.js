#!/usr/bin/env node

const { spawn } = require('child_process');
const { updateConfigurations } = require('./sync-network.js');

console.log('🚀 Iniciando ambiente de desenvolvimento Luxus Brechó...\n');

// 1. Sincronizar configurações de rede
console.log('📡 Sincronizando configurações de rede...');
updateConfigurations();

console.log('\n⏳ Aguardando 2 segundos para aplicar configurações...\n');

// 2. Aguardar um pouco para as configurações serem aplicadas
setTimeout(() => {
  console.log('🔧 Iniciando serviços...\n');
  
  // 3. Iniciar backend
  console.log('🖥️  Iniciando backend...');
  const backend = spawn('python', ['run.py'], {
    cwd: './backend',
    stdio: 'inherit',
    shell: true
  });

  // 4. Aguardar backend inicializar e depois iniciar mobile
  setTimeout(() => {
    console.log('📱 Iniciando mobile...');
    const mobile = spawn('npx', ['expo', 'start', '--clear'], {
      cwd: './mobile',
      stdio: 'inherit',
      shell: true
    });

    // Gerenciar encerramento
    process.on('SIGINT', () => {
      console.log('\n🛑 Encerrando serviços...');
      backend.kill();
      mobile.kill();
      process.exit(0);
    });

  }, 3000); // 3 segundos para o backend inicializar

}, 2000); // 2 segundos para configurações
