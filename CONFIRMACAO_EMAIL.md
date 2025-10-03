# 📧 Sistema de Confirmação de Email

## 📋 Visão Geral

Sistema completo de confirmação de email implementado seguindo os padrões arquiteturais do projeto Luxus Brechó.

### **Fluxo Implementado:**

1. **Usuário se cadastra** → Email de confirmação é enviado
2. **Conta fica inativa** até confirmação
3. **Usuário clica no link** do email → Conta é ativada
4. **Login bloqueado** até confirmar email
5. **Reenvio de email** disponível se necessário

---

## 🏗️ Padrões Arquiteturais Seguidos

### **Backend (Flask + MongoDB)**

#### **Arquitetura MVC:**
```
app/
├── models/user_model.py        # Schema, validações, funções auxiliares
├── controllers/users_controller.py  # Lógica de negócio
├── routes/users_routes.py      # Definição de endpoints
└── services/email_service.py   # Serviço de envio de emails (NOVO)
```

#### **Padrões Implementados:**

**1. Model (`user_model.py`):**
- ✅ Funções auxiliares: `generate_confirmation_token()`, `get_token_expiration()`
- ✅ Schema MongoDB atualizado com novos campos
- ✅ `prepare_new_user()` modificado para criar token automaticamente
- ✅ `normalize_user()` remove campos sensíveis (token, senha_hash)

**2. Service (`email_service.py`):**
- ✅ Serviço dedicado para envio de emails
- ✅ Templates HTML profissionais e responsivos
- ✅ Configuração via variáveis de ambiente
- ✅ Tratamento de erros robusto
- ✅ Logs informativos

**3. Controller (`users_controller.py`):**
- ✅ `create_user()`: Envia email após criação
- ✅ `authenticate_user()`: Valida email confirmado
- ✅ `confirm_email()`: Nova função para confirmar
- ✅ `resend_confirmation_email()`: Reenvio de confirmação
- ✅ Tratamento de erros com status HTTP corretos

**4. Routes (`users_routes.py`):**
- ✅ `GET /api/users/confirm-email/<token>` - Confirma email
- ✅ `POST /api/users/resend-confirmation` - Reenvia email

---

### **Mobile (React Native + Expo Router)**

#### **Arquitetura:**
```
mobile/
├── app/
│   ├── register.tsx            # Tela de cadastro (MODIFICADA)
│   └── resend-confirmation.tsx # Tela de reenvio (NOVA)
├── services/auth.ts            # Serviço de autenticação (MODIFICADO)
├── store/authStore.ts          # Estado global Zustand (MODIFICADO)
└── schemas/auth.schema.ts      # Validação Zod (existente)
```

#### **Padrões Implementados:**

**1. Service (`auth.ts`):**
- ✅ Interface `User` atualizada com `email_confirmado`
- ✅ `login()` retorna objeto com `emailNotConfirmed`
- ✅ `register()` retorna objeto com `requiresEmailConfirmation`
- ✅ Nova função `resendConfirmationEmail()`

**2. Store (`authStore.ts`):**
- ✅ Tipos de retorno atualizados (não mais boolean simples)
- ✅ `register()` NÃO autentica automaticamente se precisar confirmar
- ✅ Nova ação `resendConfirmation()`

**3. Screens:**
- ✅ `register.tsx`: Mostra Alert informativo sobre confirmação
- ✅ `resend-confirmation.tsx`: Nova tela para reenvio

---

## 🔧 Configuração

### **1. Variáveis de Ambiente (Backend)**

Adicione ao arquivo `backend/.env`:

```env
# EMAIL SMTP - Confirmação de email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
FROM_EMAIL=seu-email@gmail.com
FROM_NAME=Luxus Brechó
APP_URL=http://localhost:5000
```

#### **Configuração Gmail:**

1. Acesse [Conta Google](https://myaccount.google.com/)
2. Vá em **Segurança** → **Verificação em duas etapas**
3. Ative a verificação em duas etapas
4. Vá em **Senhas de app**
5. Gere uma senha para "Email" ou "Outro"
6. Use essa senha no `SMTP_PASSWORD`

---

## 📊 Banco de Dados

### **Campos Adicionados à Coleção `users`:**

```javascript
{
  "email_confirmado": boolean,      // Se o email foi confirmado
  "token_confirmacao": string,      // Token único para confirmação
  "token_expiracao": date,          // Expiração do token (24h)
  "ativo": boolean                  // false até confirmar (apenas Cliente)
}
```

### **Regras de Negócio:**

- **Administrador:** Ativo imediatamente, não precisa confirmar email
- **Cliente:** Inativo até confirmar email
- **Token:** Válido por 24 horas
- **Login:** Bloqueado se email não confirmado

---

## 🚀 Endpoints da API

### **1. Criar Usuário**
```http
POST /api/users
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "tipo": "Cliente"
}
```

**Resposta:**
```json
{
  "message": "Usuário criado com sucesso. Verifique seu email para confirmar a conta.",
  "user": { ... },
  "email_confirmation_required": true
}
```

---

### **2. Confirmar Email**
```http
GET /api/users/confirm-email/{token}
```

**Resposta (Sucesso):**
```json
{
  "message": "Email confirmado com sucesso! Sua conta está ativa."
}
```

**Resposta (Token Expirado):**
```json
{
  "message": "Token expirado. Solicite um novo email de confirmação."
}
```

---

### **3. Reenviar Confirmação**
```http
POST /api/users/resend-confirmation
Content-Type: application/json

{
  "email": "joao@example.com"
}
```

**Resposta:**
```json
{
  "message": "Email de confirmação reenviado com sucesso"
}
```

---

### **4. Login (Modificado)**
```http
POST /api/users/auth
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

**Resposta (Email não confirmado):**
```json
{
  "message": "Email não confirmado. Verifique sua caixa de entrada.",
  "email_not_confirmed": true
}
```
**Status:** `403 Forbidden`

---

## 📱 Fluxo no Mobile

### **1. Cadastro com Confirmação:**

```typescript
const result = await register({
  nome: "João Silva",
  email: "joao@example.com",
  senha: "senha123",
  confirmarSenha: "senha123"
});

if (result.success && result.requiresEmailConfirmation) {
  // Mostra alerta pedindo confirmação
  Alert.alert(
    'Confirme seu email',
    'Enviamos um email de confirmação...'
  );
}
```

### **2. Login Bloqueado:**

```typescript
const loginResult = await login({
  email: "joao@example.com",
  senha: "senha123"
});

if (!loginResult.success && loginResult.emailNotConfirmed) {
  // Mostrar opção para reenviar email
  Alert.alert(
    'Email não confirmado',
    'Você deseja reenviar o email de confirmação?',
    [
      { text: 'Sim', onPress: () => router.push('/resend-confirmation') },
      { text: 'Não' }
    ]
  );
}
```

### **3. Reenvio de Confirmação:**

```typescript
const success = await resendConfirmation(email);

if (success) {
  Alert.alert('Email enviado!', 'Verifique sua caixa de entrada.');
}
```

---

## 📧 Templates de Email

### **Email de Confirmação:**

- Design profissional com cores da marca (#E91E63)
- Botão destacado para confirmação
- Link alternativo caso botão não funcione
- Aviso de validade (24 horas)
- Responsivo para mobile

### **Email de Boas-vindas:**

- Enviado automaticamente após confirmação
- Mensagem de ativação da conta

---

## 🧪 Testando

### **Backend:**

```bash
# 1. Criar usuário
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@example.com","senha":"teste123","tipo":"Cliente"}'

# 2. Verificar email (check logs para ver o token)

# 3. Confirmar email
curl http://localhost:5000/api/users/confirm-email/{TOKEN}

# 4. Fazer login
curl -X POST http://localhost:5000/api/users/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","senha":"teste123"}'
```

### **Mobile:**

1. Execute `npm run mobile`
2. Acesse a tela de registro
3. Crie uma conta
4. Observe o alerta de confirmação
5. Tente fazer login (deve bloquear)
6. Acesse `/resend-confirmation` para reenviar

---

## ⚠️ Importante

### **Segurança:**

- ✅ Token gerado com `secrets.token_urlsafe(32)` (256 bits)
- ✅ Token removido do banco após confirmação
- ✅ Token não é exposto na API (removido em `normalize_user()`)
- ✅ Expiração de 24 horas
- ✅ Reenvio não revela se email existe (segurança)

### **Performance:**

- ✅ Envio de email não bloqueia criação do usuário
- ✅ Logs informativos para debug
- ✅ Tratamento de erros robusto

### **UX:**

- ✅ Mensagens claras e em português
- ✅ Links fáceis de clicar (botões grandes)
- ✅ Emails responsivos para mobile
- ✅ Opção de reenvio disponível

---

## 🔄 Migração de Dados Existentes

Para usuários já existentes no banco:

```javascript
// MongoDB Shell
db.users.updateMany(
  { tipo: "Cliente", email_confirmado: { $exists: false } },
  { 
    $set: { 
      email_confirmado: true,  // Confirma automaticamente
      ativo: true,
      token_confirmacao: null,
      token_expiracao: null
    } 
  }
);

// Admin já vem com email_confirmado: true
db.users.updateMany(
  { tipo: "Administrador", email_confirmado: { $exists: false } },
  { 
    $set: { 
      email_confirmado: true,
      ativo: true
    } 
  }
);
```

---

## ✅ Checklist de Implementação

### Backend:
- [x] Modelo atualizado com novos campos
- [x] Funções de geração de token
- [x] Serviço de email criado
- [x] Templates HTML profissionais
- [x] Controller com validações
- [x] Endpoints criados e testados
- [x] Variáveis de ambiente documentadas

### Mobile:
- [x] Interface User atualizada
- [x] Service com novos métodos
- [x] Store com tipos corretos
- [x] Tela de registro modificada
- [x] Tela de reenvio criada
- [x] Mensagens de erro apropriadas

### Documentação:
- [x] README de configuração
- [x] Exemplos de uso
- [x] Guia de teste
- [x] Padrões arquiteturais documentados

---

## 🎯 Próximos Passos (Opcional)

1. **Deep linking** para abrir app ao clicar no email
2. **Rate limiting** no reenvio de emails
3. **Dashboard admin** para ver usuários pendentes
4. **Notificações push** quando email for confirmado
5. **Customização** de templates por evento

---

## 📞 Suporte

Para configurar o SMTP ou resolver problemas:

1. Verifique os logs do backend
2. Teste com `smtp-server` local primeiro
3. Confirme que as credenciais estão corretas
4. Verifique firewall/antivírus

**Sistema pronto para produção!** 🚀
