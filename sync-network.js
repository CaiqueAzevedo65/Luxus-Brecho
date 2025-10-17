#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para obter o IP da rede
function getNetworkIP() {
  try {
    if (process.platform === 'win32') {
      const output = execSync('ipconfig', { encoding: 'utf8' });
      const lines = output.split('\n');
      
      // Procurar por adaptadores Wi-Fi ou Ethernet ativos
      let currentAdapter = '';
      const validIPs = [];
      
      for (const line of lines) {
        if (line.includes('Adaptador')) {
          currentAdapter = line;
        }
        
        if (line.includes('IPv4') && line.includes(':')) {
          const ip = line.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ip && !ip[1].startsWith('127.') && !ip[1].startsWith('169.254.')) {
            // Priorizar IPs de redes privadas comuns
            if (ip[1].startsWith('192.168.') || ip[1].startsWith('10.') || ip[1].startsWith('172.')) {
              validIPs.unshift(ip[1]); // Adicionar no início
            } else {
              validIPs.push(ip[1]);
            }
          }
        }
      }
      
      if (validIPs.length > 0) {
        console.log(`🔍 IPs encontrados: ${validIPs.join(', ')}`);
        return validIPs[0]; // Retornar o primeiro (mais provável)
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

// Função para criar o arquivo de configuração padrão
function createDefaultConfig(currentIP) {
  return {
    "description": "Configuração de rede compartilhada entre backend e mobile",
    "backend": {
      "host": "0.0.0.0",
      "port": 5000,
      "current_ip": currentIP,
      "urls": {
        "local": "http://127.0.0.1:5000",
        "network": `http://${currentIP}:5000`
      }
    },
    "mobile": {
      "api_urls": {
        "local": "http://localhost:5000/api",
        "network": `http://${currentIP}:5000/api`,
        "emulator": "http://10.0.2.2:5000/api",
        "production": "https://sua-api.herokuapp.com/api"
      },
      "current_environment": "development",
      "preferred_url": "network"
    },
    "cors": {
      "allowed_origins": [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:19000",
        "http://localhost:8081",
        "http://10.0.2.2:*",
        "exp://*:*",
        "http://*:*",
        "https://*:*"
      ]
    },
    "troubleshooting": {
      "common_issues": [
        "Verificar se o backend está rodando na porta 5000",
        "Confirmar se o IP da rede está correto",
        "Verificar se o firewall não está bloqueando a porta",
        "Confirmar se o dispositivo está na mesma rede Wi-Fi"
      ],
      "commands": {
        "check_backend": `curl http://${currentIP}:5000/api/health`,
        "get_network_ip_windows": "ipconfig | findstr IPv4",
        "get_network_ip_linux": "ifconfig | grep inet"
      }
    }
  };
}

// Função para atualizar configurações
function updateConfigurations() {
  const currentIP = getNetworkIP();
  
  if (!currentIP) {
    console.error('❌ Não foi possível detectar o IP da rede');
    return;
  }

  console.log(`🌐 IP da rede detectado: ${currentIP}`);

  // Criar ou atualizar network-config.json
  const configPath = path.join(__dirname, 'network-config.json');
  let config;
  
  if (fs.existsSync(configPath)) {
    // Arquivo existe, apenas atualizar
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.backend.current_ip = currentIP;
    config.backend.urls.network = `http://${currentIP}:5000`;
    config.mobile.api_urls.network = `http://${currentIP}:5000/api`;
    config.troubleshooting.commands.check_backend = `curl http://${currentIP}:5000/api/health`;
    
    console.log('✅ network-config.json atualizado');
  } else {
    // Arquivo não existe, criar novo
    config = createDefaultConfig(currentIP);
    console.log('🆕 network-config.json criado');
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  // Copiar configuração para dentro da pasta mobile
  const mobileConfigPath = path.join(__dirname, 'mobile', 'network-config.json');
  fs.writeFileSync(mobileConfigPath, JSON.stringify(config, null, 2));
  console.log('✅ mobile/network-config.json sincronizado');

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
