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

  // User <-> Client (1:1)
  User.hasOne(Client, { foreignKey: 'user_id', as: 'clientDetails' });
  Client.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User <-> Collaborator (1:1)
  User.hasOne(Collaborator, { foreignKey: 'user_id', as: 'collaboratorDetails' });
  Collaborator.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User <-> Team (Gestor 1:M)
  User.hasMany(Team, { foreignKey: 'manager_user_id', as: 'managedTeams' });
  Team.belongsTo(User, { foreignKey: 'manager_user_id', as: 'manager' });

  // User <-> Team (Membros M:M via TeamMember)
  User.belongsToMany(Team, {
    through: TeamMember,
    foreignKey: 'collaborator_user_id', // Chave em TeamMember
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


  // User <-> ManagerArea (Gestor 1:M)
  User.hasMany(ManagerArea, { foreignKey: 'manager_user_id', as: 'managerAreas' });
  ManagerArea.belongsTo(User, { foreignKey: 'manager_user_id', as: 'manager' });

  // Area <-> ManagerArea (1:M)
  Area.hasMany(ManagerArea, { foreignKey: 'area_id', as: 'managerAssignments' });
  ManagerArea.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

  // Area <-> Team (1:M)
  Area.hasMany(Team, { foreignKey: 'area_id', as: 'teams' });
  Team.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

  // Client <-> ClientAddress (1:M)
  Client.hasMany(ClientAddress, { foreignKey: 'client_id', as: 'addresses' });
  ClientAddress.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  Client.hasMany(ServiceRequest, { foreignKey: 'client_id', as: 'serviceRequests' });

  // Area <-> ClientAddress (1:M)
  Area.hasMany(ClientAddress, { foreignKey: 'area_id', as: 'clientAddresses' });
  ClientAddress.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

  // --- Associações de Alocação ---
  CollaboratorAllocation.belongsTo(User, { foreignKey: 'collaborator_user_id', as: 'collaborator' });
  User.hasMany(CollaboratorAllocation, { foreignKey: 'collaborator_user_id', as: 'allocations' });
  
  CollaboratorAllocation.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  Client.hasMany(CollaboratorAllocation, { foreignKey: 'client_id', as: 'allocations' });
  
  CollaboratorAllocation.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });
  Area.hasMany(CollaboratorAllocation, { foreignKey: 'area_id', as: 'allocations' });

  // --- Associações de Catálogo ---
  ServiceCategory.hasMany(ServiceCatalog, { foreignKey: 'category_id', as: 'services' });
  ServiceCatalog.belongsTo(ServiceCategory, { foreignKey: 'category_id', as: 'category' });

  // --- Associações de ServiceRequest ---
  ServiceRequest.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  ServiceRequest.belongsTo(Team, { foreignKey: 'assigned_team_id', as: 'assignedTeam' });
  ServiceRequest.belongsTo(User, { foreignKey: 'requester_user_id', as: 'requester' });
  ServiceRequest.belongsTo(User, { foreignKey: 'assigned_manager_user_id', as: 'assignedManager' });
  ServiceRequest.belongsTo(User, { foreignKey: 'assigned_collaborator_user_id', as: 'assignedCollaborator' });
  ServiceRequest.belongsTo(ClientAddress, { foreignKey: 'address_id', as: 'address' });
  ServiceRequest.belongsTo(ServiceCatalog, { foreignKey: 'service_catalog_id', as: 'service' });

 
  // ScheduledService Associations
const ScheduledService = require('../models/ScheduledService');

// ScheduledService → Client (N:1)
ScheduledService.belongsTo(Client, {
  foreignKey: 'client_id',
  as: 'client'
});
Client.hasMany(ScheduledService, {
  foreignKey: 'client_id',
  as: 'scheduledServices'
});

// ScheduledService → ServiceCatalog (N:1)
ScheduledService.belongsTo(ServiceCatalog, {
  foreignKey: 'service_catalog_id',
  as: 'service'
});
ServiceCatalog.hasMany(ScheduledService, {
  foreignKey: 'service_catalog_id',
  as: 'scheduledServices'
});

// ScheduledService → User (colaborador responsável) (N:1)
ScheduledService.belongsTo(User, {
  foreignKey: 'collaborator_user_id',
  as: 'collaborator'
});
User.hasMany(ScheduledService, {
  foreignKey: 'collaborator_user_id',
  as: 'collaboratorScheduledServices'
});

// ScheduledService → Team (N:1)
ScheduledService.belongsTo(Team, {
  foreignKey: 'team_id',
  as: 'team'
});
Team.hasMany(ScheduledService, {
  foreignKey: 'team_id',
  as: 'teamScheduledServices'
});

// ScheduledService → Area (client area) (N:1)
ScheduledService.belongsTo(Area, {
  foreignKey: 'client_area_id',
  as: 'clientArea'
});
Area.hasMany(ScheduledService, {
  foreignKey: 'client_area_id',
  as: 'scheduledServicesInArea'
});

  console.log('Associações configuradas com sucesso.');
}

module.exports = { setupAssociations };