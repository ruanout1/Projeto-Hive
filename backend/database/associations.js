// ============================================================================
// IMPORTS DE TODOS OS MODELS
// ============================================================================
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
const ServiceOrder = require('../models/ServiceOrder');
const ServiceOrderItem = require('../models/ServiceOrderItem');
const AdminDocuments = require('../models/AdminDocuments');
const Company = require('../models/Company');
const DocumentType = require('../models/DocumentType');
const ServiceOrderPhoto = require('../models/ServiceOrderPhoto'); // ✅ ADICIONAR AQUI
const ClientBranch = require('../models/ClientBranch'); // ✅ ADICIONAR AQUI

// ============================================================================
// FUNÇÃO DE CONFIGURAÇÃO DE ASSOCIAÇÕES
// ============================================================================
function setupAssociations() {
  console.log('🔗 Configurando associações do Sequelize...');

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
    foreignKey: 'user_id',
    otherKey: 'team_id',
    as: 'teams'
  });
  Team.belongsToMany(User, {
    through: TeamMember,
    foreignKey: 'team_id',
    otherKey: 'user_id',
    as: 'members'
  });
  
  // Relacionamento direto Team <-> TeamMember
  Team.hasMany(TeamMember, { foreignKey: 'team_id', as: 'teamMemberships' });
  TeamMember.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
  
  // Relacionamento direto User <-> TeamMember
  User.hasMany(TeamMember, { foreignKey: 'user_id', as: 'teamMemberships' });
  TeamMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

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

  // ============================================================================
  // ✅ ASSOCIAÇÕES DE DOCUMENTOS (COMPANIES)
  // ============================================================================
  
  console.log('📄 Configurando associações de documentos...');
  
  AdminDocuments.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
  Company.hasMany(AdminDocuments, { foreignKey: 'company_id', as: 'documents' });
  
  AdminDocuments.belongsTo(DocumentType, { foreignKey: 'document_type_id', as: 'documentType' });
  DocumentType.hasMany(AdminDocuments, { foreignKey: 'document_type_id', as: 'documents' });
  
  AdminDocuments.belongsTo(User, { foreignKey: 'uploaded_by_user_id', as: 'uploadedBy' });
  User.hasMany(AdminDocuments, { foreignKey: 'uploaded_by_user_id', as: 'uploadedDocuments' });

  // ============================================================================
  // ✅ ASSOCIAÇÕES DE SERVICE ORDERS
  // ============================================================================
  
  console.log('📋 Configurando associações de ordens de serviço...');
  
  ServiceOrder.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
  Company.hasMany(ServiceOrder, { foreignKey: 'company_id', as: 'serviceOrders' });
  
  ServiceOrder.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'createdBy' });
  User.hasMany(ServiceOrder, { foreignKey: 'created_by_user_id', as: 'createdServiceOrders' });
  
  ServiceOrder.hasMany(ServiceOrderItem, { foreignKey: 'service_order_id', as: 'items' });
  ServiceOrderItem.belongsTo(ServiceOrder, { foreignKey: 'service_order_id', as: 'serviceOrder' });

  // ============================================================================
  // ✅ ASSOCIAÇÕES DE SERVICE ORDER PHOTOS
  // ============================================================================
  
  console.log('📷 Configurando associações de fotos...');
  
  // ServiceOrderPhoto -> ServiceOrder (IMPORTANTE!)
  ServiceOrderPhoto.belongsTo(ServiceOrder, { 
    foreignKey: 'service_order_id', 
    as: 'serviceOrder' 
  });
  ServiceOrder.hasMany(ServiceOrderPhoto, { 
    foreignKey: 'service_order_id', 
    as: 'photos' 
  });
  
  // ServiceOrderPhoto -> Company
  ServiceOrderPhoto.belongsTo(Company, { 
    foreignKey: 'company_id', 
    as: 'company' 
  });
  Company.hasMany(ServiceOrderPhoto, { 
    foreignKey: 'company_id', 
    as: 'photos' 
  });
  
  // ServiceOrderPhoto -> User (colaborador)
  ServiceOrderPhoto.belongsTo(User, { 
    foreignKey: 'collaborator_user_id', 
    as: 'collaborator' 
  });
  User.hasMany(ServiceOrderPhoto, { 
    foreignKey: 'collaborator_user_id', 
    as: 'photosTaken' 
  });
  
  // ServiceOrderPhoto -> User (revisor)
  ServiceOrderPhoto.belongsTo(User, { 
    foreignKey: 'reviewed_by_user_id', 
    as: 'reviewer' 
  });
  User.hasMany(ServiceOrderPhoto, { 
    foreignKey: 'reviewed_by_user_id', 
    as: 'photosReviewed' 
  });
  
  // ServiceOrderPhoto -> ClientBranch
  ServiceOrderPhoto.belongsTo(ClientBranch, { 
    foreignKey: 'branch_id', 
    as: 'branch' 
  });
  ClientBranch.hasMany(ServiceOrderPhoto, { 
    foreignKey: 'branch_id', 
    as: 'photos' 
  });

  // ============================================================================
  // ✅ ASSOCIAÇÕES DE CLIENT BRANCHES
  // ============================================================================
  
  console.log('🏢 Configurando associações de filiais...');
  
  ClientBranch.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
  Company.hasMany(ClientBranch, { foreignKey: 'company_id', as: 'branches' });

  console.log('✅ Todas as associações configuradas com sucesso!');
}

module.exports = { setupAssociations };