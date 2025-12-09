# Luxus Brechó — Mobile

App React Native + Expo com TypeScript e NativeWind.

## 🚀 Início Rápido

```bash
npm install
cp .env.example .env
npx expo start --clear
```

## ⚙️ Configuração (.env)

```env
EXPO_PUBLIC_API_URL=http://SEU_IP:5000/api
EXPO_PUBLIC_ENABLE_LOGS=true
```

> Execute `npm run dev` na raiz do projeto para sincronizar IP automaticamente.

## 📂 Estrutura

```
├── app/          # Screens (Expo Router)
├── components/   # UI, Forms, Ecommerce
├── services/     # API, Auth
├── store/        # Zustand (auth, cart, favorites)
├── schemas/      # Validações Zod
└── types/        # TypeScript types
```

## 🔑 Funcionalidades

- **Catálogo** com filtros e busca
- **Carrinho** com persistência local
- **Autenticação** JWT
- **Favoritos** sincronizados
- **Painel Admin** (role-based)

## 📱 Executar

| Comando | Plataforma |
|---------|------------|
| `npx expo start` | QR Code (Expo Go) |
| `npm run android` | Android |
| `npm run ios` | iOS |
| `npm run web` | Web |

## 🧪 Testes

```bash
npm test              # Jest
npm run test:coverage # Cobertura
```

## 📦 Stack

**Expo 54** · **TypeScript** · **Expo Router** · **Zustand** · **Zod** · **NativeWind**
