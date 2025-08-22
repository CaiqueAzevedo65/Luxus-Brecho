# Luxus Brechó — Frontend (React + Vite)

Este README documenta a arquitetura, estrutura, execução e melhorias do frontend do projeto.

## Visão Geral

- SPA em React 19 com bundling via Vite 6.
- Roteamento com `react-router-dom` v7, usando `Layout` com `Header` e `Footer` fixos e `Outlet` para páginas.
- Sem chamadas à API ainda; integração com backend será via `/api` (recomendado configurar proxy no Vite).

## Requisitos

- Node.js 18+ (recomendado LTS atual)
- NPM 9+ (ou PNPM/Yarn se preferir, ajustando os comandos)

## Scripts NPM

- `npm run dev` — inicia o servidor de desenvolvimento do Vite (porta padrão 5173)
- `npm run build` — build de produção (gera `dist/`)
- `npm run preview` — pré-visualiza o build em servidor local
- `npm run lint` — executa ESLint conforme `eslint.config.js`

## Estrutura de Pastas (Frontend)

```
frontend/
├─ index.html
├─ package.json
├─ vite.config.js
├─ eslint.config.js
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ index.css                 # estilos globais e variáveis
   ├─ assets/                   # imagens usadas nas páginas/componentes
   ├─ components/
   │  ├─ Header/
   │  │  ├─ index.jsx
   │  │  └─ index.css
   │  ├─ Footer/
   │  │  ├─ index.jsx
   │  │  └─ index.css
   │  └─ Layout/
   │     ├─ index.jsx           # encapsula Header/Footer e `Outlet`
   │     └─ index.css
   └─ pages/
      ├─ Home/
      │  ├─ index.jsx
      │  └─ index.css
      └─ Sobre/
         ├─ index.jsx
         └─ index.css
```

## Roteamento

- `"/"` — `Home`
- `"/sobre"` — `Sobre`
- O `Header` possui links para `"/produtos"` e `"/categorias"`, porém essas páginas ainda não existem (resultará em 404). Crie-as ou remova os links temporariamente.

Arquivo principal de rotas: `src/App.jsx`.

- Usa `BrowserRouter` com `<Routes>` e `<Route path="/" element={<Layout />}>`.
- O `Layout` (`src/components/Layout/index.jsx`) inclui `Header`, `Footer` e `<Outlet />`.

## Estilos e Assets

- Estilos globais em `src/index.css` (reset, variáveis e responsividade).
- Cada componente/página possui seu próprio `index.css`.
- Imagens em `src/assets/` (logos, produtos, ícones de pagamento, etc.).

## Integração com Backend

- Não há chamadas de API implementadas no frontend até o momento.
- Recomendado configurar proxy no Vite para `/api` durante o desenvolvimento, evitando CORS:

```js
// frontend/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

- Com proxy configurado, use `fetch('/api/health')` em vez de URL absoluta.
- Em produção, sirva o backend e o build do frontend do mesmo domínio ou habilite CORS no backend.

## Qualidade de Código

- ESLint configurado via `eslint.config.js` (regras base + React Hooks + React Refresh).
- Rodar: `npm run lint`.

## Build e Deploy

- Build: `npm run build` gera `frontend/dist/`.
- Preview local do build: `npm run preview`.
- Deploy estático: hospede `dist/` (ex.: Vercel/Netlify). Para SPA, configure fallback para `index.html` (history API fallback).
- Deploy integrado: normalmente o backend serve `dist/` em produção (ajuste o servidor conforme sua stack).

## Melhorias Pendentes (Frontend)

- Ajustar título em `frontend/index.html` para "Luxus Brechó".
- Corrigir `name` em `frontend/package.json` para `"luxus-brecho"` (padronizar com o repositório).
- Criar páginas/rotas para `"/produtos"` e `"/categorias"` ou remover links no `Header` provisoriamente.
- Adicionar camada de serviços para chamadas de API (ex.: `src/services/api.js`).
- SEO/accessibilidade: metatags (`lang`, `meta description`), `aria-labels`, contraste e ordem de tab.
- Componentizar UI compartilhada (botões, cartões de produto) e centralizar tokens de tema.

## Solução de Problemas

- Porta 5173 ocupada: defina `PORT` antes do comando ou ajuste `server.port` no `vite.config.js`.
- 404 ao atualizar página em rota interna: configure fallback para SPA no host.
- Imagens não carregam: confirme caminhos em `src/assets/` e imports nos componentes.
- CORS ao chamar backend: use o proxy do Vite em dev ou habilite CORS no backend.

---

Este README reflete a revisão atual do frontend. Para a visão geral do projeto e pendências do backend, consulte a documentação da raiz e do diretório `backend/`.
