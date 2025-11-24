# 📊 ANÁLISE COMPLETA: BANCO DE DADOS HIVE

## 🏗️ ESTRUTURA GERAL DO PROJETO

### 👥 HIERARQUIA DE USUÁRIOS:
```
usuarios (tabela central)
├── admin           → Administrador geral
├── gerente         → Gerente de áreas
├── colaborador     → Equipes de trabalho
└── cliente         → Seu foco! 🎯
```

---

## 🎯 FOCO: ÁREA DO CLIENTE

### 📋 TABELAS PRINCIPAIS RELACIONADAS AO CLIENTE:

### 1️⃣ **usuarios** (Base de todos)
```sql
- usuario_id (PK)
- email (UNIQUE)
- senha_hash
- tipo_usuario (ENUM: 'admin', 'gerente', 'colaborador', 'cliente')
- nome_completo
- telefone
- url_avatar
- ativo
```

### 2️⃣ **clientes** (Dados complementares)
```sql
- cliente_id (PK)
- usuario_id (FK → usuarios) 1:1
- nome_empresa_principal
- cnpj_principal
- dia_pagamento
- data_inicio_contrato
- data_fim_contrato
- valor_contrato
- observacoes
```

### 3️⃣ **enderecos_clientes** (Múltiplos endereços)
```sql
- endereco_id (PK)
- cliente_id (FK → clientes) 1:N
- area_id (FK → areas)
- logradouro, numero, complemento
- bairro, cidade, estado, cep
- tipo_endereco ('comercial', 'residencial', 'filial', 'outros')
- principal (boolean)
```

---

## 🔄 FLUXO COMPLETO DE SERVIÇO (Do ponto de vista do cliente)

### **PASSO 1: SOLICITAÇÃO**
```
solicitacoes_servicos
├── solicitacao_servico_id (PK)
├── cliente_id (FK)
├── titulo
├── descricao
├── prioridade ('baixa', 'media', 'alta', 'urgente')
├── status ('pendente', 'em_analise', 'aprovada', 'em_execucao', 'concluida', 'cancelada')
├── data_desejada
└── endereco_id (FK → onde será realizado)
```

### **PASSO 2: AGENDAMENTO**
```
servicos_agendados
├── servico_agendado_id (PK)
├── cliente_id (FK)
├── catalogo_servico_id (FK → tipo de serviço)
├── data_agendada
├── horario_inicio
├── horario_fim
├── status ('agendado', 'em_andamento', 'concluido', 'cancelado')
├── usuario_id_colaborador (FK → quem vai fazer)
└── area_id (FK → onde será feito)
```

### **PASSO 3: EXECUÇÃO**
```
ordens_servico
├── ordem_servico_id (PK)
├── cliente_id (FK)
├── numero_ordem (VARCHAR)
├── status ('pendente', 'em_andamento', 'concluida', 'cancelada')
├── valor_total
├── data_emissao
└── data_conclusao
```

### **PASSO 4: AVALIAÇÃO**
```
avaliacoes
├── avaliacao_id (PK)
├── cliente_id (FK)
├── servico_agendado_id (FK → qual serviço está avaliando)
├── usuario_id_colaborador (FK → quem fez o serviço)
├── nota (1-5)
├── comentario
└── data_avaliacao
```

### **PASSO 5: FATURAMENTO**
```
faturas
├── fatura_id (PK)
├── cliente_id (FK)
├── numero_fatura
├── data_emissao
├── data_vencimento
├── valor_total
├── status ('pendente', 'paga', 'vencida', 'cancelada')
└── data_pagamento

itens_fatura
├── item_fatura_id (PK)
├── fatura_id (FK)
├── servico_agendado_id (FK → qual serviço está sendo cobrado)
├── descricao
├── quantidade
├── valor_unitario
└── valor_total
```

---

## 💬 SISTEMA DE COMUNICAÇÃO

```
mensagens
├── mensagem_id (PK)
├── usuario_id_remetente (FK → quem enviou)
├── usuario_id_destinatario (FK → quem recebe)
├── conteudo
├── tipo ('texto', 'arquivo')
├── lida (boolean)
└── data_envio
```

**⚠️ IMPORTANTE:** Esta tabela é 1:1 (mensagem direta entre usuários).
**NÃO há tabela de conversas/grupos!**

---

## 📄 DOCUMENTOS

```
documentos
├── documento_id (PK)
├── cliente_id (FK)
├── numero_documento
├── tipo_documento ('contrato', 'ordem_servico', 'fatura', 'relatorio', 'outros')
├── nome
├── url_arquivo
├── tamanho_bytes
├── ordem_servico_id (FK, opcional)
└── enviado_em
```

---

## 🔔 NOTIFICAÇÕES

```
notificacoes
├── notificacao_id (PK)
├── usuario_id (FK → quem recebe)
├── tipo ('servico_agendado', 'solicitacao_servico', 'avaliacao', 'pagamento', 'geral')
├── titulo
├── mensagem
├── lida (boolean)
├── tipo_entidade_relacionada ('servico_agendado', 'fatura', etc)
├── id_entidade_relacionada (ID do registro relacionado)
└── criada_em
```

---

## 📊 VIEWS ÚTEIS

### **vw_resumo_usuarios**
```sql
-- Combina dados de usuarios + clientes
SELECT 
  usuario_id,
  email,
  tipo_usuario,
  nome_completo,
  telefone,
  ativo,
  empresa_cliente (do clientes.nome_empresa_principal)
```

### **vw_resumo_servicos_agendados**
```sql
-- Combina servico + cliente + colaborador + area
SELECT 
  servico_agendado_id,
  data_agendada,
  status,
  nome_servico,
  nome_cliente,
  nome_colaborador,
  nome_area,
  horario_inicio,
  horario_fim
```

---

## 🎯 RELACIONAMENTOS PRINCIPAIS (CLIENTE)

```
CLIENTE (1) ────┬──── (N) solicitacoes_servicos
                │
                ├──── (N) servicos_agendados
                │
                ├──── (N) ordens_servico
                │
                ├──── (N) avaliacoes
                │
                ├──── (N) faturas
                │
                ├──── (N) documentos
                │
                ├──── (N) enderecos_clientes
                │
                ├──── (N) mensagens (como remetente/destinatário)
                │
                └──── (N) notificacoes
```

---

## 🚨 PONTOS DE ATENÇÃO PARA IMPLEMENTAÇÃO

### ❌ **O QUE NÃO EXISTE NO BANCO:**

1. **Tabela de conversas/conversations**
   - Só existe `mensagens` (1:1 entre usuários)
   - Se quiser chat com histórico, precisa criar `conversations`

2. **Tabela de ratings separada**
   - Avaliações estão em `avaliacoes`
   - É vinculada a `servico_agendado_id`

3. **Tabela de itens de ordens de serviço**
   - Ordem de serviço não tem itens detalhados
   - Detalhamento só existe em `itens_fatura`

### ✅ **O QUE JÁ EXISTE E FUNCIONA:**

1. **Sistema de autenticação** (usuarios)
2. **Gestão de clientes** (clientes + enderecos_clientes)
3. **Catálogo de serviços** (categorias_servicos + catalogo_servicos)
4. **Solicitações** (solicitacoes_servicos)
5. **Agendamentos** (servicos_agendados)
6. **Ordens de serviço** (ordens_servico)
7. **Avaliações** (avaliacoes)
8. **Faturamento** (faturas + itens_fatura + pagamentos)
9. **Documentos** (documentos)
10. **Notificações** (notificacoes)
11. **Mensagens** (mensagens)

---

## 🔧 TRIGGERS E STORED PROCEDURES

### **Triggers Implementados:**
1. `trg_after_usuario_insert` → Log de auditoria
2. `trg_after_usuario_update` → Log de auditoria
3. `trg_after_solicitacao_servico_insert` → Notifica admins/gerentes
4. `trg_after_ordem_servico_insert` → Gera documento automaticamente
5. `trg_after_servico_agendado_insert` → Notifica colaborador

### **Stored Procedures:**
1. `sp_calcular_total_horas_registro_ponto` → Calcula horas trabalhadas
2. `sp_gerar_numero_documento` → Gera número de documento (CTR, NF, OS)

---

## 🎯 RECOMENDAÇÕES PARA SUAS IMPLEMENTAÇÕES

### **1. Dashboard de Gastos** ✅ (já implementado)
```sql
-- Buscar faturas do cliente:
SELECT * FROM faturas WHERE cliente_id = ? ORDER BY data_emissao DESC;

-- Buscar itens das faturas:
SELECT * FROM itens_fatura WHERE fatura_id = ?;
```

### **2. Serviços Agendados** ✅ (já implementado)
```sql
SELECT 
  sa.*,
  cs.nome AS service_name,
  CONCAT(ec.logradouro, ', ', ec.numero, ' - ', ec.cidade) AS address
FROM servicos_agendados sa
LEFT JOIN catalogo_servicos cs ON sa.catalogo_servico_id = cs.catalogo_servico_id
LEFT JOIN enderecos_clientes ec ON sa.endereco_id = ec.endereco_id
WHERE sa.cliente_id = ?
ORDER BY sa.data_agendada ASC;
```

### **3. Avaliações** ⚠️ (precisa ajuste)
```sql
-- Buscar avaliações do cliente:
SELECT 
  a.*,
  cs.nome AS service_name,
  sa.data_agendada AS service_date
FROM avaliacoes a
LEFT JOIN servicos_agendados sa ON a.servico_agendado_id = sa.servico_agendado_id
LEFT JOIN catalogo_servicos cs ON sa.catalogo_servico_id = cs.catalogo_servico_id
WHERE a.cliente_id = ?
ORDER BY a.data_avaliacao DESC;

-- Buscar serviços pendentes de avaliação:
SELECT sa.*
FROM servicos_agendados sa
LEFT JOIN avaliacoes a ON sa.servico_agendado_id = a.servico_agendado_id
WHERE sa.cliente_id = ?
  AND sa.status = 'concluido'
  AND a.avaliacao_id IS NULL
ORDER BY sa.data_agendada DESC;
```

### **4. Documentos** ✅ (já implementado)
```sql
SELECT * FROM documentos WHERE cliente_id = ? ORDER BY enviado_em DESC;
```

### **5. Comunicação (Chat)** ⚠️ (precisa criar tabela)
**PROBLEMA:** Tabela `mensagens` é muito simples (1:1)

**SOLUÇÃO:** Criar estrutura de conversas:
```sql
CREATE TABLE conversations (
  conversation_id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id BIGINT UNSIGNED NOT NULL,
  assunto VARCHAR(255),
  status ENUM('ativa', 'arquivada', 'fechada') DEFAULT 'ativa',
  criada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizada_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id)
);

CREATE TABLE conversation_messages (
  message_id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  usuario_id_remetente BIGINT UNSIGNED NOT NULL,
  conteudo TEXT NOT NULL,
  tipo ENUM('texto', 'arquivo', 'sistema') DEFAULT 'texto',
  lida BOOLEAN DEFAULT FALSE,
  criada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id),
  FOREIGN KEY (usuario_id_remetente) REFERENCES usuarios(usuario_id)
);
```

---

## 📝 RESUMO PARA VOCÊ

### **O que está pronto para usar:**
✅ Autenticação (usuarios + clientes)
✅ Serviços agendados (servicos_agendados)
✅ Avaliações (avaliacoes)
✅ Faturas (faturas + itens_fatura)
✅ Documentos (documentos)
✅ Solicitações (solicitacoes_servicos)
✅ Notificações (notificacoes)

### **O que precisa criar/adaptar:**
⚠️ Chat/Comunicação (criar tabela conversations)
⚠️ Ajustar queries das avaliações pendentes
⚠️ Integrar com endereços (múltiplos endereços por cliente)

---

## 🎯 PRÓXIMOS PASSOS

Agora que tenho a visão completa, posso te ajudar a:

1. **Corrigir todas as queries** para usar os nomes corretos das tabelas
2. **Criar as tabelas faltantes** (conversations para chat)
3. **Otimizar as integrações** entre frontend e backend
4. **Implementar funcionalidades avançadas** (filtros, relatórios)

**Tudo ficou claro agora!** Vamos continuar corrigindo os erros? 🚀🐝
