// ===================================
// 1. CARREGAR VARIÁVEIS DE AMBIENTE
// ===================================
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const sequelize = require('./database/connection');

// --- IMPORTAÇÃO DAS ROTAS ---
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const collaboratorAllocationRoutes = require('./routes/collaboratorAllocationRoutes');
const collaboratorScheduleRoutes = require('./routes/collaboratorScheduleRoutes'); // <-- ADICIONADO
const collaboratorTimeClockRoutes = require('./routes/collaboratorTimeClockRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const managerRoutes = require('./routes/managerRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const serviceCatalogRoutes = require('./routes/serviceCatalogRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const teamRoutes = require('./routes/teamRoutes');
const timeClockRoutes = require('./routes/timeClockRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();

// =============================================
// 🔥 CORS CONFIGURADO CORRETAMENTE
// =============================================
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // PERMITE envio de cookies / headers
};

app.use(cors(corsOptions));

// ==================================================
app.use(express.json());
app.use(express.static(__dirname));
app.use("/src", express.static(path.join(__dirname, "src")));

if (sequelize) {
  // =============================================
  // 🔹 REGISTRAR ASSOCIAÇÕES (NOVO MÉTODO!)
  // =============================================
  const { setupAssociations } = require('./database/associations');
  setupAssociations();

  // =====================
  // REGISTRO DAS ROTAS 
  // =====================
  app.use('/api/auth', authRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/allocations', collaboratorAllocationRoutes);
  app.use('/api/collaborator-schedule', collaboratorScheduleRoutes); // <-- ADICIONADO
  app.use('/api/collaborator-time-clock', collaboratorTimeClockRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/manager', managerRoutes);
  app.use('/api/schedule', scheduleRoutes);
  app.use('/api/service-catalog', serviceCatalogRoutes);
  app.use('/api/service-requests', serviceRequestRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/time-clock', timeClockRoutes);
  app.use('/api/users', userRoutes);
}

// =====================
// ROTA DE HEALTH CHECK
// =====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando',
    timestamp: new Date().toISOString()
  });
});

// =====================
// INICIAR SERVIDOR
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("====================================");
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  if (sequelize) {
    console.log("✅ Arquitetura de rotas por Recurso está ATIVA.");
  }
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log("====================================");
});