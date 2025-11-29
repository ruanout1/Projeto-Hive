// ===================================
// DATABASE CENTRAL - Exporta sequelize e todos os models
// ===================================
const sequelize = require('../config/database');
const initModels = require('../models/init-models');

// Inicializa todos os models gerados pelo sequelize-auto
const models = initModels(sequelize);

// Exporta sequelize e models
module.exports = {
  sequelize,
  models,

  // Atalhos para models mais usados (opcional, para facilitar imports)
  User: models.users,
  Role: models.roles,
  ClientUser: models.client_users,
  Company: models.companies,
  ClientBranch: models.client_branches,
  Collaborator: models.collaborators,
  Team: models.teams,
  TeamMember: models.team_members,
  Area: models.areas,
  ManagerArea: models.manager_areas,
  ServiceCatalog: models.service_catalog,
  ServiceCategory: models.service_categories,
  ServiceRequest: models.service_requests,
  ScheduledService: models.scheduled_services,
  ServiceOrder: models.service_orders,
  ServiceStatus: models.service_statuses,
  CollaboratorAllocation: models.collaborator_allocations,
  TimeClockEntry: models.time_clock_entries,
};
