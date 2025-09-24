# 📱 Luxus Brechó - Mobile App

Aplicativo móvel para o brechó de roupas Luxus, desenvolvido com React Native e Expo.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Executar aplicação
npm start
```

## 🛠️ Stack Tecnológica

- **React Native** + **Expo** (~54.0)
- **TypeScript** (strict mode)
- **Expo Router** (navegação file-based)
- **Zustand** (gerenciamento de estado)
- **Zod** (validação de dados)
- **NativeWind** (Tailwind CSS)
- **AsyncStorage** (persistência local)

## 📁 Estrutura do Projeto

```
mobile/
├── app/                 # Screens (Expo Router)
├── components/          # Componentes reutilizáveis
│   ├── ecommerce/      # Componentes específicos do e-commerce
│   ├── forms/          # Componentes de formulário
│   └── ui/             # Componentes de UI base
├── hooks/              # Custom hooks
├── schemas/            # Validações Zod
├── services/           # API e autenticação
├── store/              # Zustand stores
├── types/              # TypeScript types
├── utils/              # Utilitários
└── constants/          # Configurações
```

## 🧪 Testes

```bash
npm test              # Executar testes
npm run test:watch    # Modo watch
npm run test:coverage # Relatório de cobertura
```

## 🔍 Qualidade de Código

```bash
npm run lint          # Verificar ESLint
```

## 🏪 Funcionalidades

- **Catálogo de produtos** com filtros e busca
- **Carrinho de compras** com persistência
- **Autenticação** de usuários
- **Favoritos** de produtos
- **Painel administrativo** para gestão
- **Sistema de categorias** (Casual, Social, Esportivo)

## ⚙️ Configuração

Copie `.env.example` para `.env` e configure:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.3:5000/api
EXPO_PUBLIC_ENABLE_LOGS=true
```

## 📱 Executar no Dispositivo

- **Expo Go**: Escaneie o QR code
- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`

---

**Desenvolvido para Luxus Brechó** 👗✨
