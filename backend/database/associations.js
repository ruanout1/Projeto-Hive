// Importa todos os models
const User = require('../models/User');
const Client = require('../models/Client');
const Collaborator = require('../models/Collaborator');
const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const Area = require('../models/Area');
const ManagerArea = require('../models/ManagerArea');
const ClientAddress = require('../models/ClientAddress');
const CollaboratorAllocation = require('../models/CollaboratorAllocation');
const ServiceCatalog = require('../models/ServiceCatalog');
const ServiceCategory = require('../models/ServiceCategory');
const ServiceRequest = require('../models/ServiceRequest');
// Adicione outros models aqui...

function setupAssociations() {
  console.log('Configurando associações do Sequelize...');

  // ===================================================
  // USER ASSOCIATIONS
  // ===================================================

  // User <-> Client (1:1)
  User.hasOne(Client, { foreignKey: 'user_id', as: 'clientDetails' });
  Client.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User <-> Collaborator (1:1)
  User.hasOne(Collaborator, { foreignKey: 'user_id', as: 'collaboratorDetails' });
  Collaborator.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // ===================================================
  // TEAM ASSOCIATIONS
  // ===================================================

  // User <-> Team (Gestor 1:M)
  User.hasMany(Team, { foreignKey: 'manager_user_id', as: 'managedTeams' });
  Team.belongsTo(User, { foreignKey: 'manager_user_id', as: 'manager' });

  // User <-> Team (Membros M:M via TeamMember)
  User.belongsToMany(Team, {
    through: TeamMember,
    foreignKey: 'collaborator_user_id',
    otherKey: 'team_id',
    as: 'teams'
  });
  Team.belongsToMany(User, {
    through: TeamMember,
    foreignKey: 'team_id',
    otherKey: 'collaborator_user_id',
    as: 'members'
  });

  // Relacionamento direto Team <-> TeamMember (para includes)
  Team.hasMany(TeamMember, { foreignKey: 'team_id', as: 'teamMemberships' });
  TeamMember.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

  // Relacionamento direto User <-> TeamMember (para includes)
  User.hasMany(TeamMember, { foreignKey: 'collaborator_user_id', as: 'teamMemberships' });
  TeamMember.belongsTo(User, { foreignKey: 'collaborator_user_id', as: 'user' });

  // ===================================================
  // MANAGER AREA ASSOCIATIONS (ESSENCIAL PARA USER MANAGEMENT!)
  // ===================================================

  // User <-> ManagerArea (Gestor 1:M)
  User.hasMany(ManagerArea, { foreignKey: 'manager_user_id', as: 'managerAreas' });
  ManagerArea.belongsTo(User, { foreignKey: 'manager_user_id', as: 'manager' });

  // Area <-> ManagerArea (1:M)
  Area.hasMany(ManagerArea, { foreignKey: 'area_id', as: 'managerAssignments' });
  ManagerArea.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

  // ===================================================
  // AREA ASSOCIATIONS
  // ===================================================

  // Area <-> Team (1:M)
  Area.hasMany(Team, { foreignKey: 'area_id', as: 'teams' });
  Team.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

  // Area <-> ClientAddress (1:M)
  Area.hasMany(ClientAddress, { foreignKey: 'area_id', as: 'clientAddresses' });
  ClientAddress.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

  // Area <-> CollaboratorAllocation (1:M)
  Area.hasMany(CollaboratorAllocation, { foreignKey: 'area_id', as: 'allocations' });
  CollaboratorAllocation.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

  // ===================================================
  // CLIENT ADDRESS ASSOCIATIONS
  // ===================================================

  // Client <-> ClientAddress (1:M)
  Client.hasMany(ClientAddress, { foreignKey: 'client_id', as: 'addresses' });
  ClientAddress.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

  // ===================================================
  // COLLABORATOR ALLOCATION ASSOCIATIONS
  // ===================================================

  CollaboratorAllocation.belongsTo(User, { foreignKey: 'collaborator_user_id', as: 'collaborator' });
  User.hasMany(CollaboratorAllocation, { foreignKey: 'collaborator_user_id', as: 'allocations' });
  
  CollaboratorAllocation.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  Client.hasMany(CollaboratorAllocation, { foreignKey: 'client_id', as: 'allocations' });

  // ===================================================
  // SERVICE CATALOG ASSOCIATIONS
  // ===================================================

  ServiceCategory.hasMany(ServiceCatalog, { foreignKey: 'category_id', as: 'services' });
  ServiceCatalog.belongsTo(ServiceCategory, { foreignKey: 'category_id', as: 'category' });

  // ===================================================
  // SERVICE REQUEST ASSOCIATIONS
  // ===================================================

  ServiceRequest.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  ServiceRequest.belongsTo(Team, { foreignKey: 'assigned_team_id', as: 'assignedTeam' });
  ServiceRequest.belongsTo(User, { foreignKey: 'requester_user_id', as: 'requester' });
  ServiceRequest.belongsTo(User, { foreignKey: 'assigned_manager_user_id', as: 'assignedManager' });
  ServiceRequest.belongsTo(User, { foreignKey: 'assigned_collaborator_user_id', as: 'assignedCollaborator' });
  ServiceRequest.belongsTo(ClientAddress, { foreignKey: 'address_id', as: 'address' });
  ServiceRequest.belongsTo(ServiceCatalog, { foreignKey: 'service_catalog_id', as: 'service' });

  console.log('✅ Associações Sequelize configuradas com sucesso!');
}

module.exports = { setupAssociations };