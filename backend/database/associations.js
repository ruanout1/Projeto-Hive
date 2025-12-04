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
const ScheduledService = require('../models/ScheduledService');
const ServicePhoto = require('../models/ServicePhoto');

function setupAssociations() {
  console.log('Configurando associações do Sequelize...');

  if (!User.sequelize) {
    console.log('Associações não configuradas (modo mock).');
    return;
  }

  // --- User, Client, Collaborator ---
  User.hasOne(Client, { foreignKey: 'user_id', as: 'clientDetails' });
  Client.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasOne(Collaborator, { foreignKey: 'user_id', as: 'collaboratorDetails' });
  Collaborator.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // --- Teams and Managers ---
  User.hasMany(Team, { foreignKey: 'manager_user_id', as: 'managedTeams' });
  Team.belongsTo(User, { foreignKey: 'manager_user_id', as: 'manager' });

  User.belongsToMany(Team, { through: TeamMember, foreignKey: 'user_id', otherKey: 'team_id', as: 'teams' });
  Team.belongsToMany(User, { through: TeamMember, foreignKey: 'team_id', otherKey: 'user_id', as: 'members' });
  
  Team.hasMany(TeamMember, { foreignKey: 'team_id', as: 'teamMemberships' });
  TeamMember.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

  User.hasMany(TeamMember, { foreignKey: 'user_id', as: 'teamMemberships' });
  TeamMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // --- Areas and Managers ---
  User.hasMany(ManagerArea, { foreignKey: 'manager_user_id', as: 'managerAreas' });
  ManagerArea.belongsTo(User, { foreignKey: 'manager_user_id', as: 'manager' });

  Area.hasMany(ManagerArea, { foreignKey: 'area_id', as: 'managerAssignments' });
  ManagerArea.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

  Area.hasMany(Team, { foreignKey: 'area_id', as: 'teams' });
  Team.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

  // --- Client and Addresses ---
  Client.hasMany(ClientAddress, { foreignKey: 'client_id', as: 'addresses' });
  ClientAddress.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

  Area.hasMany(ClientAddress, { foreignKey: 'area_id', as: 'clientAddresses' });
  ClientAddress.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

  // --- Collaborator Allocations ---
  CollaboratorAllocation.belongsTo(User, { foreignKey: 'collaborator_user_id', as: 'collaborator' });
  User.hasMany(CollaboratorAllocation, { foreignKey: 'collaborator_user_id', as: 'allocations' });
  CollaboratorAllocation.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  Client.hasMany(CollaboratorAllocation, { foreignKey: 'client_id', as: 'allocations' });
  CollaboratorAllocation.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });
  Area.hasMany(CollaboratorAllocation, { foreignKey: 'area_id', as: 'allocations' });

  // --- Service Catalog and Categories ---
  ServiceCategory.hasMany(ServiceCatalog, { foreignKey: 'category_id', as: 'services' });
  ServiceCatalog.belongsTo(ServiceCategory, { foreignKey: 'category_id', as: 'category' });

  // --- Service Requests ---
  ServiceRequest.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  ServiceRequest.belongsTo(Team, { foreignKey: 'assigned_team_id', as: 'assignedTeam' });
  ServiceRequest.belongsTo(User, { foreignKey: 'requester_user_id', as: 'requester' });
  ServiceRequest.belongsTo(User, { foreignKey: 'assigned_manager_user_id', as: 'assignedManager' });
  ServiceRequest.belongsTo(User, { foreignKey: 'assigned_collaborator_user_id', as: 'assignedCollaborator' });
  ServiceRequest.belongsTo(ClientAddress, { foreignKey: 'address_id', as: 'address' });
  ServiceRequest.belongsTo(ServiceCatalog, { foreignKey: 'service_catalog_id', as: 'service' });

  // --- Scheduled Services ---
  ServiceRequest.hasMany(ScheduledService, { foreignKey: 'service_request_id', as: 'scheduledServices' });
  ScheduledService.belongsTo(ServiceRequest, { foreignKey: 'service_request_id', as: 'serviceRequest' });

  // ✅ CORREÇÃO ESTRUTURAL: Adicionando a associação que faltava
  // Informa ao sistema que 'collaborator_user_id' em ScheduledService se refere a um User.
  User.hasMany(ScheduledService, { foreignKey: 'collaborator_user_id', as: 'scheduledServices' });
  ScheduledService.belongsTo(User, { foreignKey: 'collaborator_user_id', as: 'collaborator' });

  // --- Service Photos ---
  ScheduledService.hasMany(ServicePhoto, { foreignKey: 'scheduled_service_id', as: 'photos' });
  ServicePhoto.belongsTo(ScheduledService, { foreignKey: 'scheduled_service_id', as: 'scheduledService' });

  console.log('Associações configuradas com sucesso.');
}

module.exports = { setupAssociations };
