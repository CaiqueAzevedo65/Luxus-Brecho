# 🌐 Configuração de Rede - Luxus Brechó

Este guia ajuda a configurar corretamente a comunicação entre o mobile (Expo) e o backend (Flask).

## 📋 Problema Comum

O mobile não consegue se conectar ao backend devido a configurações incorretas de IP.

## 🔧 Solução Rápida

### 1. Sincronização Automática

Execute o script de sincronização na raiz do projeto:

```bash
node sync-network.js
```

Este script:
- Detecta automaticamente o IP da sua rede
- Atualiza as configurações do mobile e backend
- Mostra as URLs corretas para usar

### 2. Verificação Manual

#### Backend (Flask)
1. Verifique se está rodando em `0.0.0.0:5000`:
```bash
cd backend
python run.py
```

2. Procure por estas linhas no console:
```
* Running on http://127.0.0.1:5000
* Running on http://192.168.X.X:5000  # <- Este é o IP que você precisa
```

#### Mobile (Expo)
1. Abra `mobile/constants/config.ts`
2. Verifique se `NETWORK_URL` tem o IP correto:
```typescript
NETWORK_URL: 'http://192.168.X.X:5000/api'  // <- Deve ser o mesmo IP do backend
```

### 3. Teste de Conectividade

#### No navegador:
Acesse: `http://192.168.X.X:5000/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

#### No mobile:
Use o componente de diagnóstico (botão "Debug" no canto superior direito da tela Home).

## 🛠️ Configurações Detalhadas

### Backend (`backend/run.py`)
```python
app.run(
    host="0.0.0.0",  # Aceita conexões de qualquer IP
    port=5000,       # Porta padrão
    debug=True
)
```

### Mobile (`mobile/constants/config.ts`)
```typescript
NETWORK: {
  LOCAL_URL: 'http://localhost:5000/api',        # Para emuladores
  NETWORK_URL: 'http://192.168.X.X:5000/api',   # Para dispositivos físicos
  EMULATOR_URL: 'http://10.0.2.2:5000/api',     # Para Android emulator
  PRODUCTION_URL: 'https://sua-api.herokuapp.com/api'
}
```

### CORS (`backend/app/__init__.py`)
```python
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "http://localhost:19000",  # Expo DevTools
    "http://localhost:8081",   # Expo Metro
    "http://10.0.2.2:*",      # Android Emulator
    "exp://*:*",              # Expo Go
    "http://*:*",             # Qualquer HTTP
    "https://*:*"             # Qualquer HTTPS
]
```

## 🐛 Troubleshooting

### Erro: "Request timeout" ou "Network Error"

1. **Verifique se o backend está rodando:**
```bash
curl http://192.168.X.X:5000/api/health
```

2. **Confirme se estão na mesma rede Wi-Fi:**
   - Backend e mobile devem estar na mesma rede
   - Evite redes corporativas que bloqueiam comunicação entre dispositivos

3. **Verifique o firewall:**
   - Windows: Permita Python/Flask na porta 5000
   - Antivírus: Pode estar bloqueando conexões

4. **Limpe o cache do Expo:**
```bash
cd mobile
npx expo start --clear
```

### Erro: "CORS policy"

Verifique se o CORS está configurado corretamente no backend (`app/__init__.py`).

### IP mudou

Execute novamente o script de sincronização:
```bash
node sync-network.js
```

## 📱 Ambientes de Desenvolvimento

| Ambiente | URL | Quando usar |
|----------|-----|-------------|
| Localhost | `http://localhost:5000/api` | Desenvolvimento web |
| Network | `http://192.168.X.X:5000/api` | Expo Go em dispositivo físico |
| Emulator | `http://10.0.2.2:5000/api` | Android emulator |
| Production | `https://...` | App publicado |

## 🔍 Ferramentas de Debug

### 1. Componente NetworkDiagnostic
- Disponível na tela Home (botão "Debug")
- Testa conectividade automaticamente
- Mostra configurações atuais

### 2. Logs do Backend
```bash
cd backend
python utils/network_utils.py  # Mostra informações de rede
```

### 3. Logs do Mobile
- Verifique o console do Expo para erros de API
- Use `console.log` para debug

## 📞 Suporte

Se ainda tiver problemas:

1. Execute `node sync-network.js`
2. Verifique os logs do backend e mobile
3. Confirme que ambos estão na mesma rede
4. Teste a URL do backend no navegador

---

**Última atualização:** Configurações sincronizadas automaticamente
