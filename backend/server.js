// ===================================
// 1. CARREGAR VARIÁVEIS DE AMBIENTE
// ===================================
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

// --- IMPORTAÇÃO DAS ROTAS ---
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

// =============================================
// 🔹 REGISTRAR ASSOCIAÇÕES (NOVO MÉTODO!)
// =============================================
const { setupAssociations } = require('./database/associations');
setupAssociations();

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

// =====================
// REGISTRO DAS ROTAS 
// =====================
app.use('/api/clients', clientRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/time-clock', timeClockRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/service-catalog', serviceCatalogRoutes);
app.use('/api/allocations', collaboratorAllocationRoutes);
app.use('/api/auth', authRoutes);

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
  console.log("✅ Arquitetura de rotas por Recurso está ATIVA.");
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log("====================================");
});
