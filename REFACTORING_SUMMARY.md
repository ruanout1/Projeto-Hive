# Resumo da Refatoração - Integração Admin/Gestor e Portal do Cliente

## Objetivo
Garantir integração real (DB -> API -> UI) entre Admin/Gestor e Portal do Cliente, eliminando fallbacks e garantindo consistência com o schema MySQL real.

---

## Alterações Realizadas

### 1. **backend/middleware/authMiddleware.js**
**Problema**: Buscava `client_user_id` ao invés de `company_id`

**Correção**:
- Linha 60: `attributes: ['company_id']` (antes: `['client_user_id']`)
- Linha 64: `client_id = clientUser.company_id` (antes: `clientUser.client_user_id`)
- Adicionado comentário documentando a convenção: `client_id` no token/API = `company_id` no banco

---

### 2. **backend/controllers/authController.js**
**Problema**: Faltava documentação da convenção

**Correção**:
- Adicionado comentário nas linhas 45-48 documentando:
  - `client_id` no token/API = `company_id` no banco de dados
  - Mantém compatibilidade com frontend

---

### 3. **backend/middleware/authorizationMiddleware.js**
**Problema**: Compatibilidade desnecessária com `user_type` (nome antigo)

**Correção**:
- Removido fallback `req.user?.user_type`
- Usa apenas `req.user?.role_key`
- Adicionada documentação JSDoc completa com roles disponíveis:
  - `admin`: Administrador do sistema
  - `manager`: Gestor de área/equipe
  - `client`: Cliente (usuário de empresa cliente)
  - `collaborator`: Colaborador (técnico de campo)

---

### 4. **backend/controllers/clientController.js**
**Problema**: Usava nomenclatura antiga incompatível com o schema

**Correções massivas**:
- `Client` → `Company`
- `ClientAddress` → `ClientBranch`
- `client_id` → `company_id`
- `address_id` → `branch_id`
- `main_company_name` → `name`
- `user_type` → `role_key`
- `addresses` → `client_branches`

**Funções refatoradas**:
- `getClientById`: Agora busca `Company` com `company_id`
- `createClient`: Usa `role_key` para verificação de manager
- `getManagerClientsList`: Busca `Company` com join em `ClientBranch`
- `addClientLocation`: Cria `ClientBranch` com `company_id`
- `updateClientLocation`: Atualiza `ClientBranch` com `branch_id`
- `removeClientLocation`: Remove `ClientBranch` com `branch_id`

---

## Convenções Adotadas

### No Token JWT e Respostas de API:
- **`client_id`**: Representa o `company_id` do banco
- **`type`**: Representa o `role_key` do usuário (para compatibilidade com frontend antigo)

### No Banco de Dados:
- **`companies`**: Tabela de empresas cliente (antes chamada `clients`)
- **`client_branches`**: Filiais/unidades das empresas (antes `client_addresses`)
- **`client_users`**: Vínculo entre `users` e `companies`
- **`service_catalog.status`**: Usa string 'active'/'inactive' (NÃO `is_active`)
- **`service_requests/scheduled_services.status_key`**: FK para `service_statuses`

---

## Validações Implementadas (já existentes em clientPortalRoutes.js)

### POST `/api/client-portal/requests`:
✅ Valida `service_catalog_id` (busca por name e status='active')
✅ Valida `branch_id` pertence ao `company_id` do usuário
✅ Valida `priority_key` existe em `priority_levels` (fallback 'medium')
✅ Valida `status_key='pending'` existe em `service_statuses`
✅ Retorna 400 com mensagem amigável em caso de FK inválida

---

## Queries SQL de Verificação

### 1. Verificar estrutura das tabelas principais:
```sql
-- Ver estrutura de companies
DESCRIBE companies;

-- Ver estrutura de client_branches
DESCRIBE client_branches;

-- Ver estrutura de service_catalog
DESCRIBE service_catalog;

-- Ver estrutura de service_requests
DESCRIBE service_requests;

-- Ver estrutura de service_statuses
DESCRIBE service_statuses;

-- Ver estrutura de priority_levels
DESCRIBE priority_levels;
```

### 2. Verificar dados existentes:
```sql
-- Listar companies ativas
SELECT company_id, name, cnpj, is_active
FROM companies
WHERE is_active = 1;

-- Listar filiais de uma company específica
SELECT branch_id, name, nickname, city, state, is_active
FROM client_branches
WHERE company_id = 1;

-- Listar serviços ativos no catálogo
SELECT service_catalog_id, name, status, category_id
FROM service_catalog
WHERE status = 'active';

-- Listar solicitações de uma empresa
SELECT
  sr.service_request_id,
  sr.request_number,
  sr.title,
  sr.status_key,
  sr.priority_key,
  c.name AS company_name,
  cb.nickname AS branch_name,
  sc.name AS service_name
FROM service_requests sr
INNER JOIN companies c ON sr.company_id = c.company_id
LEFT JOIN client_branches cb ON sr.branch_id = cb.branch_id
LEFT JOIN service_catalog sc ON sr.service_catalog_id = sc.service_catalog_id
WHERE sr.company_id = 1
ORDER BY sr.created_at DESC;

-- Listar serviços agendados de uma empresa
SELECT
  ss.scheduled_service_id,
  ss.scheduled_date,
  ss.status_key,
  c.name AS company_name,
  cb.nickname AS branch_name,
  sc.name AS service_name
FROM scheduled_services ss
INNER JOIN companies c ON ss.company_id = c.company_id
LEFT JOIN client_branches cb ON ss.branch_id = cb.branch_id
LEFT JOIN service_catalog sc ON ss.service_catalog_id = sc.service_catalog_id
WHERE ss.company_id = 1
ORDER BY ss.scheduled_date ASC;
```

### 3. Verificar integridade referencial:
```sql
-- Verificar se todos os service_requests têm company_id válido
SELECT COUNT(*) AS invalid_count
FROM service_requests sr
LEFT JOIN companies c ON sr.company_id = c.company_id
WHERE c.company_id IS NULL;

-- Verificar se todos os service_requests têm branch_id válido (quando não é NULL)
SELECT COUNT(*) AS invalid_count
FROM service_requests sr
LEFT JOIN client_branches cb ON sr.branch_id = cb.branch_id
WHERE sr.branch_id IS NOT NULL AND cb.branch_id IS NULL;

-- Verificar se todos os service_catalog têm status válido
SELECT service_catalog_id, name, status
FROM service_catalog
WHERE status NOT IN ('active', 'inactive');
```

---

## Exemplos de Chamadas curl para Testes

### 1. Login como Cliente:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@empresa.com",
    "password": "senha123"
  }'
```
**Resposta esperada**:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 2,
    "client_id": 1,
    "name": "João Silva",
    "email": "cliente@empresa.com",
    "type": "client"
  }
}
```

### 2. Listar Solicitações do Cliente:
```bash
TOKEN="seu_token_aqui"

curl -X GET "http://localhost:5000/api/client-portal/requests" \
  -H "Authorization: Bearer $TOKEN"
```
**Resposta esperada**: Array de solicitações ou `[]` se vazio

### 3. Criar Nova Solicitação:
```bash
TOKEN="seu_token_aqui"

curl -X POST http://localhost:5000/api/client-portal/requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "Limpeza Geral",
    "description": "Limpeza completa do escritório",
    "priority": "media",
    "date": "25/12/2024",
    "location": "Sala principal",
    "area": "Administrativo",
    "addressId": 1,
    "serviceCatalogId": 3
  }'
```
**Resposta esperada**: `201 Created` com dados da solicitação

### 4. Listar Serviços Agendados do Cliente:
```bash
TOKEN="seu_token_aqui"

curl -X GET "http://localhost:5000/api/client-scheduled/scheduled-services" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Listar Catálogo de Serviços (Admin):
```bash
ADMIN_TOKEN="token_do_admin"

curl -X GET "http://localhost:5000/api/service-catalog" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 6. Criar Categoria de Serviço (Admin):
```bash
ADMIN_TOKEN="token_do_admin"

curl -X POST http://localhost:5000/api/service-catalog/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Limpeza",
    "description": "Serviços de limpeza e higienização"
  }'
```

### 7. Criar Serviço no Catálogo (Admin):
```bash
ADMIN_TOKEN="token_do_admin"

curl -X POST http://localhost:5000/api/service-catalog \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Limpeza Geral",
    "description": "Limpeza completa de ambientes",
    "category_id": 1,
    "price": 250.00,
    "status": "active",
    "duration_value": 2,
    "duration_type": "hours"
  }'
```

### 8. Listar Solicitações (Admin/Gestor):
```bash
ADMIN_TOKEN="token_do_admin"

curl -X GET "http://localhost:5000/api/service-requests" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 9. Criar Filial para Cliente (Admin/Gestor):
```bash
ADMIN_TOKEN="token_do_admin"
COMPANY_ID=1

curl -X POST "http://localhost:5000/api/clients/$COMPANY_ID/locations" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "Filial Centro",
    "street": "Rua Principal",
    "number": "123",
    "complement": "Sala 4",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567"
  }'
```

---

## Testes de Integração Recomendados

### Cenário 1: Admin cria serviço → Cliente vê e solicita
1. Login como Admin
2. Criar categoria (POST `/api/service-catalog/categories`)
3. Criar serviço ativo (POST `/api/service-catalog`)
4. Login como Cliente
5. Verificar que serviço aparece quando cliente faz request (implícito na validação)
6. Criar solicitação usando service_catalog_id (POST `/api/client-portal/requests`)
7. Login como Admin/Gestor
8. Verificar solicitação aparece (GET `/api/service-requests`)

### Cenário 2: Admin cria filial → Cliente usa na solicitação
1. Login como Admin
2. Criar filial para empresa (POST `/api/clients/{id}/locations`)
3. Login como Cliente
4. Criar solicitação usando branch_id da filial (POST `/api/client-portal/requests`)
5. Verificar solicitação foi criada sem erro 400

### Cenário 3: Validações de FK
1. Login como Cliente
2. Tentar criar request com `serviceCatalogId` inválido → Espera 400
3. Tentar criar request com `addressId` (branch_id) de outra empresa → Espera 400
4. Tentar criar request com `priority` inválida → Usa fallback 'medium'

---

## Arquivos Alterados

### Backend (Modificados):
- ✅ `backend/middleware/authMiddleware.js`
- ✅ `backend/controllers/authController.js`
- ✅ `backend/middleware/authorizationMiddleware.js`
- ✅ `backend/controllers/clientController.js`

### Backend (Já estavam corretos):
- ✅ `backend/routes/clientPortalRoutes.js` (validações implementadas)
- ✅ `backend/routes/clientScheduledRoutes.js`
- ✅ `backend/routes/serviceCatalogRoutes.js`
- ✅ `backend/routes/serviceRequestRoutes.js`
- ✅ `backend/routes/clientRoutes.js`
- ✅ `backend/database/db.js` (models gerados pelo sequelize-auto)

---

## Próximos Passos (Opcional)

### Frontend:
1. Verificar se existem fallbacks quando API retorna 200 com `[]`
2. Garantir que erros 403/401 mostrem mensagem de autenticação
3. Remover dados mockados que não são mais necessários

### Backend:
1. Implementar funções completas em `clientController.js`:
   - `createClient` (criar Company + User + ClientUser em transação)
   - `updateClient`
   - `toggleClientStatus`
2. Adicionar includes de `ServiceRequest` nas queries para estatísticas reais
3. Implementar soft delete nas filiais (marcar `is_active=false`)

---

## Comandos para Rodar o Projeto

### Backend:
```bash
cd backend
npm run dev
```

### Frontend:
```bash
cd frontend
npm run dev
```

### Testar Conexão com Banco:
```bash
node backend/test-db.js
```

---

## Observações Importantes

1. **Convenção client_id**: Em todo o sistema, `client_id` no token/API representa `company_id` no banco. Isso foi mantido para compatibilidade com o frontend.

2. **service_catalog.status**: Usa string 'active'/'inactive', NÃO booleano `is_active`.

3. **Timestamps**: Os models gerados usam `createdAt`/`updatedAt` (camelCase), mas o MySQL armazena como `created_at`/`updated_at` (snake_case). O Sequelize faz a conversão automaticamente.

4. **Validações**: As validações de FK no POST `/api/client-portal/requests` já estavam implementadas e funcionando corretamente.

5. **Autorização**: Todas as rotas do portal do cliente usam `protect` + `checkRole(['client'])`, garantindo acesso apenas a usuários autenticados com role 'client'.