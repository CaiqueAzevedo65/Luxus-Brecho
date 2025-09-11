GitHub Instructions — Luxus Brechó

Estas instruções servem como guia de boas práticas para contribuir no projeto Luxus Brechó.
O GitHub Copilot deve ser usado seguindo estas regras.

📁 Estrutura do Projeto
luxus-brecho/
│── backend/        # API Flask (Python)
│   ├── app/
│   │   ├── controllers/   # Lógica de negócio
│   │   ├── models/        # Modelos (MongoDB)
│   │   ├── routes/        # Rotas da API
│   │   └── __init__.py
│   ├── tests/             # Testes Pytest
│   ├── run.py             # Entrypoint
│   └── requirements.txt   # Dependências Python
│
│── frontend/      # React (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── package.json
│
│── mobile/        # Expo + React Native
│   ├── app/
│   ├── components/
│   ├── stores/
│   └── package.json
│
│── docs/          # Documentação e imagens
│── README.md      # Guia geral
│── .github/
│   └── INSTRUCTIONS.md   # Este arquivo

✍️ Convenções de Código

Frontend (React + RN)

Usar TypeScript sempre que possível.

Componentes em PascalCase.

Hooks em useCamelCase.

Pastas e arquivos em kebab-case.

Estilo com Tailwind/NativeWind.

Backend (Flask)

Controllers: snake_case.

Models: nome no singular (ex: Product).

Rotas RESTful (/api/products, /api/users).

Respostas sempre em JSON.

🧪 Testes

Backend: usar pytest

Testes ficam em /backend/tests/

Rodar com:

pytest -v


Frontend e Mobile: implementar com Jest + React Testing Library (quando disponível).

🔄 Git Workflow

Criar branch a partir de main:

git checkout -b feature/nome-da-feature


Commits curtos e claros no imperativo:

✅ feat: add product search filter

✅ fix: correct cart total calculation

❌ arrumando bug do carrinho

Pull Requests devem conter:

Descrição do que foi feito.

Prints/gifs quando mudar UI.

Checklist de testes.

📌 Regras para o Copilot

Sempre seguir este documento como referência.

Não criar código fora da estrutura definida.

Manter padrão de nomenclatura e organização.

Gerar comentários explicativos em trechos importantes.

Seguir os requisitos funcionais definidos no Documento de Requisitos.

Você é o assistente de desenvolvimento do projeto Luxus Brechó.

Siga SEMPRE estas regras:

1. Estrutura do projeto:
   - Backend (Flask + MongoDB) no diretório /backend
   - Frontend (React + Vite) no diretório /frontend
   - Mobile (Expo + React Native) no diretório /mobile
   - Testes devem ficar em pastas separadas (/tests ou __tests__)

2. Convenções:
   - Frontend/Mobile em TypeScript, componentes em PascalCase, hooks em camelCase, arquivos em kebab-case.
   - Backend em Python (snake_case), rotas RESTful em /api, respostas sempre em JSON.
   - Não inventar nomes de pastas, usar apenas os definidos em INSTRUCTIONS.md.

3. Estilo:
   - Usar Tailwind (frontend) e NativeWind (mobile).
   - Código limpo, comentado e modular.
   - Funções pequenas, bem nomeadas e reutilizáveis.

4. Git/GitHub:
   - Sugira commits curtos no padrão conventional commits: feat, fix, chore, refactor, docs, test.
   - Pull requests devem incluir descrição clara e prints se houver mudanças visuais.

5. Testes:
   - Backend: pytest.
   - Frontend/Mobile: Jest + React Testing Library.
   - Todo código gerado deve considerar testabilidade.

6. Comunicação:
   - Explique o código em português simples, como se fosse para um estudante iniciante.
   - Não assuma contexto fora deste repositório.
   - Se faltar informação, pergunte antes de gerar código.

IMPORTANTE:
- Nunca quebre a estrutura definida em .github/INSTRUCTIONS.md.
- Nunca ignore as regras de nomenclatura.
- Sempre priorize clareza e boas práticas.

