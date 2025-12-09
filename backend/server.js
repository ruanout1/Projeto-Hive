require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize } = require('./config/database'); // Pega do config novo

const app = express();

// --- CORS ---
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTAS ---
// Nota: Comentei rotas que ainda não refatoramos para não quebrar o app.
// Vá descomentando conforme formos arrumando os controllers.
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/schedule', require('./routes/scheduleRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/client-portal', require('./routes/clientPortalRoutes'));
app.use('/api/service-catalog', require('./routes/serviceCatalogRoutes'));
app.use('/api/service-requests', require('./routes/serviceRequestRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/team-members', require('./routes/teamMemberRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/photo-review', require('./routes/photoReviewRoutes'));
app.use('/api/allocations', require('./routes/collaboratorAllocationRoutes'));
// app.use('/api/dashboard', require('./routes/dashboardRoutes'));
// ... adicione as outras conforme necessário

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', db: sequelize ? 'Connected' : 'Disconnected' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});