# Luxus Brechó — Frontend

SPA React 19 + Vite 6 com autenticação JWT, carrinho e painel admin.

## 🚀 Início Rápido

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest
```

## 📂 Estrutura

```
src/
├─ components/   # Header, Footer, Skeleton, Layout
├─ pages/        # Home, Produtos, Perfil, Carrinho, Admin...
├─ services/     # API, Auth, Products, Orders
├─ store/        # Zustand (auth, cart, favorites)
├─ schemas/      # Validações Zod
└─ hooks/        # useDebounce, useZodValidation
```

## 🔑 Funcionalidades

- **Autenticação** - Login, registro, confirmação de email
- **Catálogo** - Produtos com filtros, busca e paginação
- **Carrinho** - Peças únicas, frete grátis acima de R$150
- **Favoritos** - Sincronizado com backend
- **Admin** - Criar/editar produtos (role-based)
- **Skeleton Loaders** - UX durante carregamento

## ⚙️ Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Executar testes (Vitest) |
| `npm run lint` | Verificar ESLint |

## 🧪 Testes

```bash
npm test              # Modo watch
npm test -- --run     # Execução única
```

Cobertura: `authService`, `cartStore`

## 📦 Principais Dependências

- **react-router-dom** - Roteamento
- **zustand** - Estado global
- **zod** - Validação de schemas
- **react-icons** - Ícones
- **vitest** - Testes
