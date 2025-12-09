# Luxus Brechó 🛍️

Plataforma fullstack para brechó online com **Backend Flask**, **Frontend React** e **App Mobile Expo/React Native**.

## 📌 Visão Geral

| Camada | Stack |
|--------|-------|
| **Backend** | Python 3.10+, Flask, MongoDB, JWT Auth |
| **Frontend** | React 19, Vite 6, Zustand, Vitest |
| **Mobile** | Expo 54, React Native, TypeScript, NativeWind |

## 🚀 Início Rápido

```bash
# Clone o repositório
git clone https://github.com/your-username/luxus-brecho.git
cd luxus-brecho

# Backend
cd backend && pip install -r requirements.txt
cp .env.example .env  # Configure as variáveis
python run.py         # http://localhost:5000/api

# Frontend
cd frontend && npm install
npm run dev           # http://localhost:5173

# Mobile
cd mobile && npm install
npx expo start --clear
```

## 📂 Estrutura

```
├─ backend/      # API Flask + MongoDB
├─ frontend/     # SPA React + Vite
├─ mobile/       # App Expo/React Native
└─ scripts/      # Utilitários de rede
```

## ⚙️ Configuração

### Backend (.env)
```ini
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=luxus_brecho_db
JWT_SECRET_KEY=sua-chave-secreta-aqui
FLASK_DEBUG=True
```

### Mobile (.env)
```ini
EXPO_PUBLIC_API_URL=http://SEU_IP:5000/api
```

## 🔑 Funcionalidades

- **Autenticação JWT** com refresh token
- **Catálogo de produtos** com filtros e busca
- **Carrinho** (peças únicas, sem quantidade)
- **Favoritos** sincronizados
- **Painel Admin** para gestão de produtos
- **Skeleton Loaders** para melhor UX
- **Notificações por email** de status de pedido

## 📱 Mobile no Dispositivo Físico

```bash
# Da raiz do projeto - sincroniza IP automaticamente
npm run dev

# Depois inicie o mobile
cd mobile && npx expo start
```

> Escaneie o QR code com Expo Go. Ambos dispositivos devem estar na mesma rede Wi-Fi.

## 🧪 Testes

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && pytest
```

## 📄 Licença

Projeto desenvolvido para fins de aprendizado. Livre para uso e modificação.
