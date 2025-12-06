require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// =============================================
// 2. IMPORTAÇÃO DAS ROTAS
// =============================================

// --- ROTAS ADMINISTRATIVAS (Versão da colega) ---
const clientRoutes = require('./routes/clientRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const timeClockRoutes = require('./routes/timeClockRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceCatalogRoutes = require('./routes/serviceCatalogRoutes');
const collaboratorAllocationRoutes = require('./routes/collaboratorAllocationRoutes');
const authRoutes = require('./routes/authRoutes');
const clientScheduledRoutes = require('./routes/clientScheduledRoutes');

// --- ROTAS EXTRAS (Suas rotas) ---
const clientPortalRoutes = require('./routes/clientPortalRoutes');
const managerRoutes = require('./routes/managerRoutes');
const communicationRoutes = require('./routes/communicationRoutes');

// =============================================
// 3. INICIALIZAR DATABASE E MODELS
// =============================================
const { sequelize, models } = require('./database/db');

// Testa a conexão com o banco
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco estabelecida!');
  } catch (error) {
    console.error('❌ Erro ao conectar no banco:', error.message);
  }
})();

// =============================================
// 4. CONFIGURAR APLICAÇÃO EXPRESS
// =============================================
const app = express();

// =============================================
// 5. CONFIGURAR CORS
// =============================================
const corsOptions = {
  origin: [
    "http://localhost:5000",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Permite envio de cookies/headers
};

app.use(cors(corsOptions));

// =============================================
// 6. MIDDLEWARES GLOBAIS
// =============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTAS ---
// Nota: Comentei rotas que ainda não refatoramos para não quebrar o app.
// Vá descomentando conforme formos arrumando os controllers.
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/schedule', require('./routes/scheduleRoutes')); 
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/service-catalog', require('./routes/serviceCatalogRoutes'));
app.use('/api/service-requests', require('./routes/serviceRequestRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/team-members', require('./routes/teamMemberRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/photo-review', require('./routes/photoReviewRoutes'));
// app.use('/api/dashboard', require('./routes/dashboardRoutes'));
// ... adicione as outras conforme necessário

// --- GESTÃO ADMINISTRATIVA (Admin/Manager) ---
app.use('/api/clients', clientRoutes);                           // CRUD de clientes
app.use('/api/schedule', scheduleRoutes);                        // Agendamentos
app.use('/api/time-clock', timeClockRoutes);                     // Ponto eletrônico
app.use('/api/service-requests', serviceRequestRoutes);          // Solicitações de serviço
app.use('/api/dashboard', dashboardRoutes);                      // Dashboard admin
app.use('/api/teams', teamRoutes);                               // Equipes
app.use('/api/users', userRoutes);                               // Usuários
app.use('/api/service-catalog', serviceCatalogRoutes);           // Catálogo de serviços
app.use('/api/allocations', collaboratorAllocationRoutes);       // Alocação de colaboradores
app.use('/api/client-portal', clientScheduledRoutes);            // Serviços agendados 

// --- PORTAL DO CLIENTE (Cliente visualiza seus dados) ---
app.use('/api/client-portal', clientPortalRoutes);               // Portal do cliente

// --- ROTAS DE GESTORES E COMUNICAÇÃO ---
app.use('/api/manager', managerRoutes);                          // Funcionalidades de gestores
app.use('/api/communication', communicationRoutes);              // Sistema de comunicação

// =============================================
// 8. ROTA DE HEALTH CHECK
// =============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend Hive funcionando corretamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    routes: {
      auth: '/api/auth',
      clients: '/api/clients (Admin/Manager)',
      clientPortal: '/api/client-portal (Client)',
      teams: '/api/teams',
      users: '/api/users',
      manager: '/api/manager',
      communication: '/api/communication'
    }
  });
});

// =============================================
// 9. TRATAMENTO DE ROTAS NÃO ENCONTRADAS
// =============================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method,
    message: 'Verifique a documentação da API'
  });
});

// =============================================
// 10. TRATAMENTO DE ERROS GLOBAL
// =============================================
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  
  res.status(err.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =============================================
// 11. INICIAR SERVIDOR
// =============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n====================================");
  console.log(`🚀 Servidor Hive rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log("====================================");
  console.log("\n📍 Rotas disponíveis:");
  console.log(`   • Health Check:     http://localhost:${PORT}/api/health`);
  console.log(`   • Autenticação:     http://localhost:${PORT}/api/auth`);
  console.log(`   • Admin/Manager:    http://localhost:${PORT}/api/clients`);
  console.log(`   • Portal Cliente:   http://localhost:${PORT}/api/client-portal`);
  console.log(`   • Equipes:          http://localhost:${PORT}/api/teams`);
  console.log(`   • Usuários:         http://localhost:${PORT}/api/users`);
  console.log(`   • Gestores:         http://localhost:${PORT}/api/manager`);
  console.log(`   • Comunicação:      http://localhost:${PORT}/api/communication`);
  console.log("\n Arquitetura de rotas por Recurso está ATIVA");
  console.log("====================================\n");
});

module.exports = app;
