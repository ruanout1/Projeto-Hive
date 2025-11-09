const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

// --- IMPORTAÇÃO DAS ROTAS ---
const clientRoutes = require('./routes/clientRoutes');
const managerRoutes = require('./routes/managerRoutes'); 

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use("/src", express.static(path.join(__dirname, "src")));

// =====================
// REGISTRO DAS ROTAS DA API
// =====================
app.use('/api/clientes', clientRoutes); 
app.use('/api/manager', managerRoutes);

// =============================================
// 🔹 REGISTRAR ASSOCIAÇÕES (O LUGAR CORRETO)
// =============================================
// Importa todos os models
const User = require('./models/User');
const Team = require('./models/Team');
const TeamMember = require('./models/TeamMember');
const ServiceCatalog = require('./models/ServiceCatalog');
const ServiceCategory = require('./models/ServiceCategory');
const ServiceRequest = require('./models/ServiceRequest');
const Client = require('./models/Client');
// (Adicione outros models aqui se/quando forem criados)

// --- DEFINIÇÃO DAS ASSOCIAÇÕES ---

// User <-> Team (Gestor)
User.hasMany(Team, { foreignKey: 'manager_user_id', as: 'managedTeams' });
Team.belongsTo(User, { foreignKey: 'manager_user_id', as: 'manager' });

// User <-> Team (Membros)
User.belongsToMany(Team, {
  through: TeamMember,
  foreignKey: 'user_id', // Chave em TeamMember que aponta para User
  otherKey: 'team_id',
  as: 'teams'
});
Team.belongsToMany(User, {
  through: TeamMember,
  foreignKey: 'team_id', // Chave em TeamMember que aponta para Team
  otherKey: 'user_id',
  as: 'members'
});

// User <-> Client
User.hasOne(Client, { foreignKey: 'user_id', as: 'clientDetails' });
Client.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Client <-> ServiceRequest
Client.hasMany(ServiceRequest, { foreignKey: 'client_id', as: 'requests' });
ServiceRequest.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Team <-> ServiceRequest
Team.hasMany(ServiceRequest, { foreignKey: 'assigned_team_id', as: 'assignedRequests' });
ServiceRequest.belongsTo(Team, { foreignKey: 'assigned_team_id', as: 'assignedTeam' });

// === CORREÇÃO: ASSOCIAÇÃO DO CATÁLOGO QUE FALTAVA ===
ServiceCategory.hasMany(ServiceCatalog, {
  foreignKey: 'category_id',
  as: 'services'
});
ServiceCatalog.belongsTo(ServiceCategory, {
  foreignKey: 'category_id',
  as: 'category'
});
// === FIM DA CORREÇÃO ===

// --- FIM DO REGISTRO ---

// =====================
// INICIAR SERVIDOR (SEMPRE POR ÚLTIMO)
// =====================
app.listen(5000, () => {
  console.log(" Servidor backend rodando na porta 5000");
});

// =====================
// 🔹 INICIAR SERVIDOR
// =====================
app.listen(5000, () => console.log(" Servidor backend rodando na porta 5000"));
