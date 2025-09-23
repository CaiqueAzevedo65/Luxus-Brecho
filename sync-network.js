#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para obter o IP da rede
function getNetworkIP() {
  try {
    if (process.platform === 'win32') {
      const output = execSync('ipconfig', { encoding: 'utf8' });
      const match = output.match(/IPv4.*?: (\d+\.\d+\.\d+\.\d+)/g);
      
      if (match) {
        for (const line of match) {
          const ip = line.match(/(\d+\.\d+\.\d+\.\d+)/)[1];
          if (!ip.startsWith('127.') && !ip.startsWith('169.254.')) {
            return ip;
          }
        }
      }
    } else {
      const output = execSync('ifconfig 2>/dev/null || ip addr show', { encoding: 'utf8' });
      const match = output.match(/inet (\d+\.\d+\.\d+\.\d+)/g);
      
      if (match) {
        for (const line of match) {
          const ip = line.match(/(\d+\.\d+\.\d+\.\d+)/)[1];
          if (!ip.startsWith('127.') && !ip.startsWith('169.254.')) {
            return ip;
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro ao obter IP da rede:', error.message);
  }
  
  return null;
}

// Função para atualizar configurações
function updateConfigurations() {
  const currentIP = getNetworkIP();
  
  if (!currentIP) {
    console.error('❌ Não foi possível detectar o IP da rede');
    return;
  }

  console.log(`🌐 IP da rede detectado: ${currentIP}`);

  // Atualizar network-config.json
  const configPath = path.join(__dirname, 'network-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.backend.current_ip = currentIP;
    config.backend.urls.network = `http://${currentIP}:5000`;
    config.mobile.api_urls.network = `http://${currentIP}:5000/api`;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ network-config.json atualizado');
  }

  // Atualizar mobile/constants/config.ts
  const mobileConfigPath = path.join(__dirname, 'mobile', 'constants', 'config.ts');
  if (fs.existsSync(mobileConfigPath)) {
    let content = fs.readFileSync(mobileConfigPath, 'utf8');
    
    // Substituir o IP na NETWORK_URL
    content = content.replace(
      /NETWORK_URL: 'http:\/\/[\d.]+:5000\/api'/,
      `NETWORK_URL: 'http://${currentIP}:5000/api'`
    );
    
    fs.writeFileSync(mobileConfigPath, content);
    console.log('✅ mobile/constants/config.ts atualizado');
  }

  console.log('\n🎉 Configurações sincronizadas com sucesso!');
  console.log(`📱 Mobile deve usar: http://${currentIP}:5000/api`);
  console.log(`🖥️  Backend rodando em: http://${currentIP}:5000`);
  console.log('\n💡 Dicas:');
  console.log('1. Reinicie o servidor backend se necessário');
  console.log('2. Limpe o cache do Expo: npx expo start --clear');
  console.log('3. Verifique se ambos estão na mesma rede Wi-Fi');
}

// Executar se chamado diretamente
if (require.main === module) {
  console.log('🔄 Sincronizando configurações de rede...\n');
  updateConfigurations();
}

module.exports = { getNetworkIP, updateConfigurations };
