var DataTypes = require("sequelize").DataTypes;
var _allocation_work_days = require("./allocation_work_days");
var _areas = require("./areas");
var _assignment_statuses = require("./assignment_statuses");
var _audit_log = require("./audit_log");
var _calendar_events = require("./calendar_events");
var _client_branches = require("./client_branches");
var _client_users = require("./client_users");
var _collaborator_allocations = require("./collaborator_allocations");
var _collaborator_assignments = require("./collaborator_assignments");
var _collaborators = require("./collaborators");
var _companies = require("./companies");
var _document_types = require("./document_types");
var _documents = require("./documents");
var _event_participants = require("./event_participants");
var _expenses = require("./expenses");
var _manager_areas = require("./manager_areas");
var _message_recipients = require("./message_recipients");
var _messages = require("./messages");
var _notifications = require("./notifications");
var _payment_methods = require("./payment_methods");
var _performance_report_feedback = require("./performance_report_feedback");
var _performance_reports = require("./performance_reports");
var _photo_review_status = require("./photo_review_status");
var _priority_levels = require("./priority_levels");
var _ratings = require("./ratings");
var _roles = require("./roles");
var _scheduled_services = require("./scheduled_services");
var _service_catalog = require("./service_catalog");
var _service_categories = require("./service_categories");
var _service_order_photos = require("./service_order_photos");
var _service_orders = require("./service_orders");
var _service_requests = require("./service_requests");
var _service_status_history = require("./service_status_history");
var _service_statuses = require("./service_statuses");
var _system_settings = require("./system_settings");
var _team_members = require("./team_members");
var _teams = require("./teams");
var _time_clock_entries = require("./time_clock_entries");
var _users = require("./users");
var _vw_user_agenda = require("./vw_user_agenda");

function initModels(sequelize) {
  var allocation_work_days = _allocation_work_days(sequelize, DataTypes);
  var areas = _areas(sequelize, DataTypes);
  var assignment_statuses = _assignment_statuses(sequelize, DataTypes);
  var audit_log = _audit_log(sequelize, DataTypes);
  var calendar_events = _calendar_events(sequelize, DataTypes);
  var client_branches = _client_branches(sequelize, DataTypes);
  var client_users = _client_users(sequelize, DataTypes);
  var collaborator_allocations = _collaborator_allocations(sequelize, DataTypes);
  var collaborator_assignments = _collaborator_assignments(sequelize, DataTypes);
  var collaborators = _collaborators(sequelize, DataTypes);
  var companies = _companies(sequelize, DataTypes);
  var document_types = _document_types(sequelize, DataTypes);
  var documents = _documents(sequelize, DataTypes);
  var event_participants = _event_participants(sequelize, DataTypes);
  var expenses = _expenses(sequelize, DataTypes);
  var manager_areas = _manager_areas(sequelize, DataTypes);
  var message_recipients = _message_recipients(sequelize, DataTypes);
  var messages = _messages(sequelize, DataTypes);
  var notifications = _notifications(sequelize, DataTypes);
  var payment_methods = _payment_methods(sequelize, DataTypes);
  var performance_report_feedback = _performance_report_feedback(sequelize, DataTypes);
  var performance_reports = _performance_reports(sequelize, DataTypes);
  var photo_review_status = _photo_review_status(sequelize, DataTypes);
  var priority_levels = _priority_levels(sequelize, DataTypes);
  var ratings = _ratings(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var scheduled_services = _scheduled_services(sequelize, DataTypes);
  var service_catalog = _service_catalog(sequelize, DataTypes);
  var service_categories = _service_categories(sequelize, DataTypes);
  var service_order_photos = _service_order_photos(sequelize, DataTypes);
  var service_orders = _service_orders(sequelize, DataTypes);
  var service_requests = _service_requests(sequelize, DataTypes);
  var service_status_history = _service_status_history(sequelize, DataTypes);
  var service_statuses = _service_statuses(sequelize, DataTypes);
  var system_settings = _system_settings(sequelize, DataTypes);
  var team_members = _team_members(sequelize, DataTypes);
  var teams = _teams(sequelize, DataTypes);
  var time_clock_entries = _time_clock_entries(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var vw_user_agenda = _vw_user_agenda(sequelize, DataTypes);

  // --- ASSOCIAÇÕES DE ÁREAS ---
  collaborator_allocations.belongsTo(areas, { as: "area", foreignKey: "area_id"});
  areas.hasMany(collaborator_allocations, { as: "collaborator_allocations", foreignKey: "area_id"});
  manager_areas.belongsTo(areas, { as: "area", foreignKey: "area_id"});
  areas.hasMany(manager_areas, { as: "manager_areas", foreignKey: "area_id"});
  scheduled_services.belongsTo(areas, { as: "area", foreignKey: "area_id"});
  areas.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "area_id"});
  teams.belongsTo(areas, { as: "area", foreignKey: "area_id"});
  areas.hasMany(teams, { as: "teams", foreignKey: "area_id"});

  // --- ASSOCIAÇÕES DE STATUS E TIPOS ---
  collaborator_allocations.belongsTo(assignment_statuses, { as: "status_key_assignment_status", foreignKey: "status_key"});
  assignment_statuses.hasMany(collaborator_allocations, { as: "collaborator_allocations", foreignKey: "status_key"});
  collaborator_assignments.belongsTo(assignment_statuses, { as: "collaborator_status_key_assignment_status", foreignKey: "collaborator_status_key"});
  assignment_statuses.hasMany(collaborator_assignments, { as: "collaborator_assignments", foreignKey: "collaborator_status_key"});

  // --- ASSOCIAÇÕES DE AGENDA E EVENTOS ---
  event_participants.belongsTo(calendar_events, { as: "event", foreignKey: "event_id"});
  calendar_events.hasMany(event_participants, { as: "event_participants", foreignKey: "event_id"});

  // --- ASSOCIAÇÕES DE CLIENTES E FILIAIS ---
  client_users.belongsTo(client_branches, { as: "branch", foreignKey: "branch_id"});
  client_branches.hasMany(client_users, { as: "client_users", foreignKey: "branch_id"});
  scheduled_services.belongsTo(client_branches, { as: "branch", foreignKey: "branch_id"});
  client_branches.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "branch_id"});
  service_order_photos.belongsTo(client_branches, { as: "branch", foreignKey: "branch_id"});
  client_branches.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "branch_id"});
  service_requests.belongsTo(client_branches, { as: "branch", foreignKey: "branch_id"});
  client_branches.hasMany(service_requests, { as: "service_requests", foreignKey: "branch_id"});

  // --- ASSOCIAÇÕES DE EMPRESAS (CLIENTES PRINCIPAIS) ---
  client_branches.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(client_branches, { as: "client_branches", foreignKey: "company_id"});
  client_users.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(client_users, { as: "client_users", foreignKey: "company_id"});
  collaborator_allocations.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(collaborator_allocations, { as: "collaborator_allocations", foreignKey: "company_id"});
  documents.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(documents, { as: "documents", foreignKey: "company_id"});
  expenses.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(expenses, { as: "expenses", foreignKey: "company_id"});
  ratings.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(ratings, { as: "ratings", foreignKey: "company_id"});
  scheduled_services.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "company_id"});
  service_order_photos.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "company_id"});
  service_orders.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(service_orders, { as: "service_orders", foreignKey: "company_id"});
  service_requests.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(service_requests, { as: "service_requests", foreignKey: "company_id"});

  // --- ALOCAÇÕES ---
  allocation_work_days.belongsTo(collaborator_allocations, { as: "allocation", foreignKey: "allocation_id"});
  collaborator_allocations.hasMany(allocation_work_days, { as: "allocation_work_days", foreignKey: "allocation_id"});

  // --- DOCUMENTOS ---
  documents.belongsTo(document_types, { as: "document_type", foreignKey: "document_type_id"});
  document_types.hasMany(documents, { as: "documents", foreignKey: "document_type_id"});

  // --- MENSAGENS ---
  message_recipients.belongsTo(messages, { as: "message", foreignKey: "message_id"});
  messages.hasMany(message_recipients, { as: "message_recipients", foreignKey: "message_id"});
  messages.belongsTo(messages, { as: "parent_message", foreignKey: "parent_message_id"});
  messages.hasMany(messages, { as: "messages", foreignKey: "parent_message_id"});

  // --- PAGAMENTOS ---
  expenses.belongsTo(payment_methods, { as: "payment_method_key_payment_method", foreignKey: "payment_method_key"});
  payment_methods.hasMany(expenses, { as: "expenses", foreignKey: "payment_method_key"});

  // --- RELATÓRIOS DE PERFORMANCE ---
  performance_report_feedback.belongsTo(performance_reports, { as: "performance_report", foreignKey: "performance_report_id"});
  performance_reports.hasMany(performance_report_feedback, { as: "performance_report_feedbacks", foreignKey: "performance_report_id"});

  // --- FOTOS ---
  service_order_photos.belongsTo(photo_review_status, { as: "review_status_key_photo_review_status", foreignKey: "review_status_key"});
  photo_review_status.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "review_status_key"});

  // --- PRIORIDADE ---
  service_requests.belongsTo(priority_levels, { as: "priority_key_priority_level", foreignKey: "priority_key"});
  priority_levels.hasMany(service_requests, { as: "service_requests", foreignKey: "priority_key"});

  // --- ROLES (PAPEIS) ---
  users.belongsTo(roles, { as: "role_key_role", foreignKey: "role_key"});
  roles.hasMany(users, { as: "users", foreignKey: "role_key"});

  // --- SERVIÇOS AGENDADOS E ORDENS DE SERVIÇO ---
  collaborator_assignments.belongsTo(scheduled_services, { as: "scheduled_service", foreignKey: "scheduled_service_id"});
  scheduled_services.hasMany(collaborator_assignments, { as: "collaborator_assignments", foreignKey: "scheduled_service_id"});
  ratings.belongsTo(scheduled_services, { as: "scheduled_service", foreignKey: "scheduled_service_id"});
  scheduled_services.hasMany(ratings, { as: "ratings", foreignKey: "scheduled_service_id"});
  service_order_photos.belongsTo(scheduled_services, { as: "scheduled_service", foreignKey: "scheduled_service_id"});
  scheduled_services.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "scheduled_service_id"});
  service_status_history.belongsTo(scheduled_services, { as: "scheduled_service", foreignKey: "scheduled_service_id"});
  scheduled_services.hasMany(service_status_history, { as: "service_status_histories", foreignKey: "scheduled_service_id"});

  // --- CATÁLOGO DE SERVIÇOS ---
  collaborator_allocations.belongsTo(service_catalog, { as: "service_catalog", foreignKey: "service_catalog_id"});
  service_catalog.hasMany(collaborator_allocations, { as: "collaborator_allocations", foreignKey: "service_catalog_id"});
  scheduled_services.belongsTo(service_catalog, { as: "service_catalog", foreignKey: "service_catalog_id"});
  service_catalog.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "service_catalog_id"});
  service_requests.belongsTo(service_catalog, { as: "service_catalog", foreignKey: "service_catalog_id"});
  service_catalog.hasMany(service_requests, { as: "service_requests", foreignKey: "service_catalog_id"});
  service_catalog.belongsTo(service_categories, { as: "category", foreignKey: "category_id"});
  service_categories.hasMany(service_catalog, { as: "service_catalogs", foreignKey: "category_id"});

  // --- ORDENS DE SERVIÇO VINCULADAS ---
  documents.belongsTo(service_orders, { as: "service_order", foreignKey: "service_order_id"});
  service_orders.hasMany(documents, { as: "documents", foreignKey: "service_order_id"});
  expenses.belongsTo(service_orders, { as: "service_order", foreignKey: "service_order_id"});
  service_orders.hasMany(expenses, { as: "expenses", foreignKey: "service_order_id"});
  ratings.belongsTo(service_orders, { as: "service_order", foreignKey: "service_order_id"});
  service_orders.hasMany(ratings, { as: "ratings", foreignKey: "service_order_id"});
  scheduled_services.belongsTo(service_orders, { as: "service_order", foreignKey: "service_order_id"});
  service_orders.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "service_order_id"});
  service_order_photos.belongsTo(service_orders, { as: "service_order", foreignKey: "service_order_id"});
  service_orders.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "service_order_id"});
  service_orders.belongsTo(service_requests, { as: "service_request", foreignKey: "service_request_id"});
  service_requests.hasMany(service_orders, { as: "service_orders", foreignKey: "service_request_id"});

  // --- STATUS DE SERVIÇO ---
  scheduled_services.belongsTo(service_statuses, { as: "status_key_service_status", foreignKey: "status_key"});
  service_statuses.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "status_key"});
  service_requests.belongsTo(service_statuses, { as: "status_key_service_status", foreignKey: "status_key"});
  service_statuses.hasMany(service_requests, { as: "service_requests", foreignKey: "status_key"});
  service_status_history.belongsTo(service_statuses, { as: "new_status_key_service_status", foreignKey: "new_status_key"});
  service_statuses.hasMany(service_status_history, { as: "service_status_histories", foreignKey: "new_status_key"});
  service_status_history.belongsTo(service_statuses, { as: "old_status_key_service_status", foreignKey: "old_status_key"});
  service_statuses.hasMany(service_status_history, { as: "old_status_key_service_status_histories", foreignKey: "old_status_key"});

  // --- EQUIPES ---
  collaborator_assignments.belongsTo(teams, { as: "team", foreignKey: "team_id"});
  teams.hasMany(collaborator_assignments, { as: "collaborator_assignments", foreignKey: "team_id"});
  scheduled_services.belongsTo(teams, { as: "team", foreignKey: "team_id"});
  teams.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "team_id"});
  team_members.belongsTo(teams, { as: "team", foreignKey: "team_id"});
  teams.hasMany(team_members, { as: "team_members", foreignKey: "team_id"});

  // --- ASSOCIAÇÕES DE USUÁRIOS (A MAIS IMPORTANTE) ---
  audit_log.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(audit_log, { as: "audit_logs", foreignKey: "user_id"});
  
  calendar_events.belongsTo(users, { as: "created_by_user", foreignKey: "created_by_user_id"});
  users.hasMany(calendar_events, { as: "calendar_events", foreignKey: "created_by_user_id"});
  
  client_users.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(client_users, { as: "client_users", foreignKey: "user_id"});
  
  collaborator_allocations.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(collaborator_allocations, { as: "collaborator_allocations", foreignKey: "collaborator_user_id"});
  
  collaborator_assignments.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(collaborator_assignments, { as: "collaborator_assignments", foreignKey: "collaborator_user_id"});
  
  collaborators.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasOne(collaborators, { as: "collaborator", foreignKey: "user_id"});
  
  documents.belongsTo(users, { as: "uploaded_by_user", foreignKey: "uploaded_by_user_id"});
  users.hasMany(documents, { as: "documents", foreignKey: "uploaded_by_user_id"});
  
  event_participants.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(event_participants, { as: "event_participants", foreignKey: "user_id"});
  
  expenses.belongsTo(users, { as: "approved_by_user", foreignKey: "approved_by_user_id"});
  users.hasMany(expenses, { as: "expenses", foreignKey: "approved_by_user_id"});
  
  expenses.belongsTo(users, { as: "created_by_user", foreignKey: "created_by_user_id"});
  users.hasMany(expenses, { as: "created_by_user_expenses", foreignKey: "created_by_user_id"});
  
  manager_areas.belongsTo(users, { as: "manager_user", foreignKey: "manager_user_id"});
  users.hasMany(manager_areas, { as: "manager_areas", foreignKey: "manager_user_id"});
  
  message_recipients.belongsTo(users, { as: "recipient_user", foreignKey: "recipient_user_id"});
  users.hasMany(message_recipients, { as: "message_recipients", foreignKey: "recipient_user_id"});
  
  messages.belongsTo(users, { as: "sender_user", foreignKey: "sender_user_id"});
  users.hasMany(messages, { as: "messages", foreignKey: "sender_user_id"});
  
  notifications.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(notifications, { as: "notifications", foreignKey: "user_id"});
  
  performance_report_feedback.belongsTo(users, { as: "recipient_user", foreignKey: "recipient_user_id"});
  users.hasMany(performance_report_feedback, { as: "performance_report_feedbacks", foreignKey: "recipient_user_id"});
  
  performance_report_feedback.belongsTo(users, { as: "sender_user", foreignKey: "sender_user_id"});
  users.hasMany(performance_report_feedback, { as: "sender_user_performance_report_feedbacks", foreignKey: "sender_user_id"});
  
  performance_reports.belongsTo(users, { as: "admin_user", foreignKey: "admin_user_id"});
  users.hasMany(performance_reports, { as: "performance_reports", foreignKey: "admin_user_id"});
  
  performance_reports.belongsTo(users, { as: "generated_by_user", foreignKey: "generated_by_user_id"});
  users.hasMany(performance_reports, { as: "generated_by_user_performance_reports", foreignKey: "generated_by_user_id"});
  
  ratings.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(ratings, { as: "ratings", foreignKey: "collaborator_user_id"});
  
  scheduled_services.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "collaborator_user_id"});
  
  service_order_photos.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "collaborator_user_id"});
  
  service_orders.belongsTo(users, { as: "created_by_user", foreignKey: "created_by_user_id"});
  users.hasMany(service_orders, { as: "service_orders", foreignKey: "created_by_user_id"});
  
  // SOLICITAÇÕES: CUIDADO COM O NOME DA CHAVE
  service_requests.belongsTo(users, { as: "requester_user", foreignKey: "requester_user_id"}); // ou requester_id
  users.hasMany(service_requests, { as: "service_requests", foreignKey: "requester_user_id"});
  
  service_status_history.belongsTo(users, { as: "changed_by_user", foreignKey: "changed_by_user_id"});
  users.hasMany(service_status_history, { as: "service_status_histories", foreignKey: "changed_by_user_id"});
  
  system_settings.belongsTo(users, { as: "updated_by_user", foreignKey: "updated_by_user_id"});
  users.hasMany(system_settings, { as: "system_settings", foreignKey: "updated_by_user_id"});
  
  team_members.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(team_members, { as: "team_members", foreignKey: "user_id"});
  
  teams.belongsTo(users, { as: "supervisor", foreignKey: "manager_user_id"}); // ou supervisor_user_id
  users.hasMany(teams, { as: "teams", foreignKey: "manager_user_id"});
  
  time_clock_entries.belongsTo(users, { as: "approved_by_user", foreignKey: "approved_by_user_id"});
  users.hasMany(time_clock_entries, { as: "time_clock_entries", foreignKey: "approved_by_user_id"});
  
  time_clock_entries.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(time_clock_entries, { as: "collaborator_user_time_clock_entries", foreignKey: "collaborator_user_id"});

  return {
    allocation_work_days,
    areas,
    assignment_statuses,
    audit_log,
    calendar_events,
    client_branches,
    client_users,
    collaborator_allocations,
    collaborator_assignments,
    collaborators,
    companies,
    document_types,
    documents,
    event_participants,
    expenses,
    manager_areas,
    message_recipients,
    messages,
    notifications,
    payment_methods,
    performance_report_feedback,
    performance_reports,
    photo_review_status,
    priority_levels,
    ratings,
    roles,
    scheduled_services,
    service_catalog,
    service_categories,
    service_order_photos,
    service_orders,
    service_requests,
    service_status_history,
    service_statuses,
    system_settings,
    team_members,
    teams,
    time_clock_entries,
    users,
    vw_user_agenda,
  };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;var DataTypes = require("sequelize").DataTypes;
var _allocation_work_days = require("./allocation_work_days");
var _areas = require("./areas");
var _assignment_statuses = require("./assignment_statuses");
var _audit_log = require("./audit_log");
var _calendar_events = require("./calendar_events");
var _client_branches = require("./client_branches");
var _client_users = require("./client_users");
var _collaborator_allocations = require("./collaborator_allocations");
var _collaborator_assignments = require("./collaborator_assignments");
var _collaborators = require("./collaborators");
var _companies = require("./companies");
var _document_types = require("./document_types");
var _documents = require("./documents");
var _event_participants = require("./event_participants");
var _expenses = require("./expenses");
var _manager_areas = require("./manager_areas");
var _message_recipients = require("./message_recipients");
var _messages = require("./messages");
var _notifications = require("./notifications");
var _payment_methods = require("./payment_methods");
var _performance_report_feedback = require("./performance_report_feedback");
var _performance_reports = require("./performance_reports");
var _photo_review_status = require("./photo_review_status");
var _priority_levels = require("./priority_levels");
var _ratings = require("./ratings");
var _roles = require("./roles");
var _scheduled_services = require("./scheduled_services");
var _service_catalog = require("./service_catalog");
var _service_categories = require("./service_categories");
var _service_order_photos = require("./service_order_photos");
var _service_orders = require("./service_orders");
var _service_requests = require("./service_requests");
var _service_status_history = require("./service_status_history");
var _service_statuses = require("./service_statuses");
var _system_settings = require("./system_settings");
var _team_members = require("./team_members");
var _teams = require("./teams");
var _time_clock_entries = require("./time_clock_entries");
var _users = require("./users");

function initModels(sequelize) {
  var allocation_work_days = _allocation_work_days(sequelize, DataTypes);
  var areas = _areas(sequelize, DataTypes);
  var assignment_statuses = _assignment_statuses(sequelize, DataTypes);
  var audit_log = _audit_log(sequelize, DataTypes);
  var calendar_events = _calendar_events(sequelize, DataTypes);
  var client_branches = _client_branches(sequelize, DataTypes);
  var client_users = _client_users(sequelize, DataTypes);
  var collaborator_allocations = _collaborator_allocations(sequelize, DataTypes);
  var collaborator_assignments = _collaborator_assignments(sequelize, DataTypes);
  var collaborators = _collaborators(sequelize, DataTypes);
  var companies = _companies(sequelize, DataTypes);
  var document_types = _document_types(sequelize, DataTypes);
  var documents = _documents(sequelize, DataTypes);
  var event_participants = _event_participants(sequelize, DataTypes);
  var expenses = _expenses(sequelize, DataTypes);
  var manager_areas = _manager_areas(sequelize, DataTypes);
  var message_recipients = _message_recipients(sequelize, DataTypes);
  var messages = _messages(sequelize, DataTypes);
  var notifications = _notifications(sequelize, DataTypes);
  var payment_methods = _payment_methods(sequelize, DataTypes);
  var performance_report_feedback = _performance_report_feedback(sequelize, DataTypes);
  var performance_reports = _performance_reports(sequelize, DataTypes);
  var photo_review_status = _photo_review_status(sequelize, DataTypes);
  var priority_levels = _priority_levels(sequelize, DataTypes);
  var ratings = _ratings(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var scheduled_services = _scheduled_services(sequelize, DataTypes);
  var service_catalog = _service_catalog(sequelize, DataTypes);
  var service_categories = _service_categories(sequelize, DataTypes);
  var service_order_photos = _service_order_photos(sequelize, DataTypes);
  var service_orders = _service_orders(sequelize, DataTypes);
  var service_requests = _service_requests(sequelize, DataTypes);
  var service_status_history = _service_status_history(sequelize, DataTypes);
  var service_statuses = _service_statuses(sequelize, DataTypes);
  var system_settings = _system_settings(sequelize, DataTypes);
  var team_members = _team_members(sequelize, DataTypes);
  var teams = _teams(sequelize, DataTypes);
  var time_clock_entries = _time_clock_entries(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  collaborator_allocations.belongsTo(areas, { as: "area", foreignKey: "area_id"});
  areas.hasMany(collaborator_allocations, { as: "collaborator_allocations", foreignKey: "area_id"});
  manager_areas.belongsTo(areas, { as: "area", foreignKey: "area_id"});
  areas.hasMany(manager_areas, { as: "manager_areas", foreignKey: "area_id"});
  scheduled_services.belongsTo(areas, { as: "area", foreignKey: "area_id"});
  areas.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "area_id"});
  teams.belongsTo(areas, { as: "area", foreignKey: "area_id"});
  areas.hasMany(teams, { as: "teams", foreignKey: "area_id"});
  collaborator_allocations.belongsTo(assignment_statuses, { as: "status_key_assignment_status", foreignKey: "status_key"});
  assignment_statuses.hasMany(collaborator_allocations, { as: "collaborator_allocations", foreignKey: "status_key"});
  collaborator_assignments.belongsTo(assignment_statuses, { as: "collaborator_status_key_assignment_status", foreignKey: "collaborator_status_key"});
  assignment_statuses.hasMany(collaborator_assignments, { as: "collaborator_assignments", foreignKey: "collaborator_status_key"});
  event_participants.belongsTo(calendar_events, { as: "event", foreignKey: "event_id"});
  calendar_events.hasMany(event_participants, { as: "event_participants", foreignKey: "event_id"});
  client_users.belongsTo(client_branches, { as: "branch", foreignKey: "branch_id"});
  client_branches.hasMany(client_users, { as: "client_users", foreignKey: "branch_id"});
  scheduled_services.belongsTo(client_branches, { as: "branch", foreignKey: "branch_id"});
  client_branches.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "branch_id"});
  service_order_photos.belongsTo(client_branches, { as: "branch", foreignKey: "branch_id"});
  client_branches.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "branch_id"});
  service_requests.belongsTo(client_branches, { as: "branch", foreignKey: "branch_id"});
  client_branches.hasMany(service_requests, { as: "service_requests", foreignKey: "branch_id"});
  allocation_work_days.belongsTo(collaborator_allocations, { as: "allocation", foreignKey: "allocation_id"});
  collaborator_allocations.hasMany(allocation_work_days, { as: "allocation_work_days", foreignKey: "allocation_id"});
  client_branches.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(client_branches, { as: "client_branches", foreignKey: "company_id"});
  client_users.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(client_users, { as: "client_users", foreignKey: "company_id"});
  collaborator_allocations.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(collaborator_allocations, { as: "collaborator_allocations", foreignKey: "company_id"});
  documents.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(documents, { as: "documents", foreignKey: "company_id"});
  expenses.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(expenses, { as: "expenses", foreignKey: "company_id"});
  ratings.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(ratings, { as: "ratings", foreignKey: "company_id"});
  scheduled_services.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "company_id"});
  service_order_photos.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "company_id"});
  service_orders.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(service_orders, { as: "service_orders", foreignKey: "company_id"});
  service_requests.belongsTo(companies, { as: "company", foreignKey: "company_id"});
  companies.hasMany(service_requests, { as: "service_requests", foreignKey: "company_id"});
  documents.belongsTo(document_types, { as: "document_type", foreignKey: "document_type_id"});
  document_types.hasMany(documents, { as: "documents", foreignKey: "document_type_id"});
  message_recipients.belongsTo(messages, { as: "message", foreignKey: "message_id"});
  messages.hasMany(message_recipients, { as: "message_recipients", foreignKey: "message_id"});
  messages.belongsTo(messages, { as: "parent_message", foreignKey: "parent_message_id"});
  messages.hasMany(messages, { as: "messages", foreignKey: "parent_message_id"});
  expenses.belongsTo(payment_methods, { as: "payment_method_key_payment_method", foreignKey: "payment_method_key"});
  payment_methods.hasMany(expenses, { as: "expenses", foreignKey: "payment_method_key"});
  performance_report_feedback.belongsTo(performance_reports, { as: "performance_report", foreignKey: "performance_report_id"});
  performance_reports.hasMany(performance_report_feedback, { as: "performance_report_feedbacks", foreignKey: "performance_report_id"});
  service_order_photos.belongsTo(photo_review_status, { as: "review_status_key_photo_review_status", foreignKey: "review_status_key"});
  photo_review_status.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "review_status_key"});
  service_requests.belongsTo(priority_levels, { as: "priority_key_priority_level", foreignKey: "priority_key"});
  priority_levels.hasMany(service_requests, { as: "service_requests", foreignKey: "priority_key"});
  users.belongsTo(roles, { as: "role_key_role", foreignKey: "role_key"});
  roles.hasMany(users, { as: "users", foreignKey: "role_key"});
  collaborator_assignments.belongsTo(scheduled_services, { as: "scheduled_service", foreignKey: "scheduled_service_id"});
  scheduled_services.hasMany(collaborator_assignments, { as: "collaborator_assignments", foreignKey: "scheduled_service_id"});
  ratings.belongsTo(scheduled_services, { as: "scheduled_service", foreignKey: "scheduled_service_id"});
  scheduled_services.hasMany(ratings, { as: "ratings", foreignKey: "scheduled_service_id"});
  service_order_photos.belongsTo(scheduled_services, { as: "scheduled_service", foreignKey: "scheduled_service_id"});
  scheduled_services.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "scheduled_service_id"});
  service_status_history.belongsTo(scheduled_services, { as: "scheduled_service", foreignKey: "scheduled_service_id"});
  scheduled_services.hasMany(service_status_history, { as: "service_status_histories", foreignKey: "scheduled_service_id"});
  collaborator_allocations.belongsTo(service_catalog, { as: "service_catalog", foreignKey: "service_catalog_id"});
  service_catalog.hasMany(collaborator_allocations, { as: "collaborator_allocations", foreignKey: "service_catalog_id"});
  scheduled_services.belongsTo(service_catalog, { as: "service_catalog", foreignKey: "service_catalog_id"});
  service_catalog.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "service_catalog_id"});
  service_requests.belongsTo(service_catalog, { as: "service_catalog", foreignKey: "service_catalog_id"});
  service_catalog.hasMany(service_requests, { as: "service_requests", foreignKey: "service_catalog_id"});
  service_catalog.belongsTo(service_categories, { as: "category", foreignKey: "category_id"});
  service_categories.hasMany(service_catalog, { as: "service_catalogs", foreignKey: "category_id"});
  documents.belongsTo(service_orders, { as: "service_order", foreignKey: "service_order_id"});
  service_orders.hasMany(documents, { as: "documents", foreignKey: "service_order_id"});
  expenses.belongsTo(service_orders, { as: "service_order", foreignKey: "service_order_id"});
  service_orders.hasMany(expenses, { as: "expenses", foreignKey: "service_order_id"});
  ratings.belongsTo(service_orders, { as: "service_order", foreignKey: "service_order_id"});
  service_orders.hasMany(ratings, { as: "ratings", foreignKey: "service_order_id"});
  scheduled_services.belongsTo(service_orders, { as: "service_order", foreignKey: "service_order_id"});
  service_orders.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "service_order_id"});
  service_order_photos.belongsTo(service_orders, { as: "service_order", foreignKey: "service_order_id"});
  service_orders.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "service_order_id"});
  service_orders.belongsTo(service_requests, { as: "service_request", foreignKey: "service_request_id"});
  service_requests.hasMany(service_orders, { as: "service_orders", foreignKey: "service_request_id"});
  scheduled_services.belongsTo(service_statuses, { as: "status_key_service_status", foreignKey: "status_key"});
  service_statuses.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "status_key"});
  service_requests.belongsTo(service_statuses, { as: "status_key_service_status", foreignKey: "status_key"});
  service_statuses.hasMany(service_requests, { as: "service_requests", foreignKey: "status_key"});
  service_status_history.belongsTo(service_statuses, { as: "new_status_key_service_status", foreignKey: "new_status_key"});
  service_statuses.hasMany(service_status_history, { as: "service_status_histories", foreignKey: "new_status_key"});
  service_status_history.belongsTo(service_statuses, { as: "old_status_key_service_status", foreignKey: "old_status_key"});
  service_statuses.hasMany(service_status_history, { as: "old_status_key_service_status_histories", foreignKey: "old_status_key"});
  collaborator_assignments.belongsTo(teams, { as: "team", foreignKey: "team_id"});
  teams.hasMany(collaborator_assignments, { as: "collaborator_assignments", foreignKey: "team_id"});
  scheduled_services.belongsTo(teams, { as: "team", foreignKey: "team_id"});
  teams.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "team_id"});
  team_members.belongsTo(teams, { as: "team", foreignKey: "team_id"});
  teams.hasMany(team_members, { as: "team_members", foreignKey: "team_id"});
  audit_log.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(audit_log, { as: "audit_logs", foreignKey: "user_id"});
  calendar_events.belongsTo(users, { as: "created_by_user", foreignKey: "created_by_user_id"});
  users.hasMany(calendar_events, { as: "calendar_events", foreignKey: "created_by_user_id"});
  client_users.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(client_users, { as: "client_users", foreignKey: "user_id"});
  collaborator_allocations.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(collaborator_allocations, { as: "collaborator_allocations", foreignKey: "collaborator_user_id"});
  collaborator_assignments.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(collaborator_assignments, { as: "collaborator_assignments", foreignKey: "collaborator_user_id"});
  collaborators.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasOne(collaborators, { as: "collaborator", foreignKey: "user_id"});
  documents.belongsTo(users, { as: "uploaded_by_user", foreignKey: "uploaded_by_user_id"});
  users.hasMany(documents, { as: "documents", foreignKey: "uploaded_by_user_id"});
  event_participants.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(event_participants, { as: "event_participants", foreignKey: "user_id"});
  expenses.belongsTo(users, { as: "approved_by_user", foreignKey: "approved_by_user_id"});
  users.hasMany(expenses, { as: "expenses", foreignKey: "approved_by_user_id"});
  expenses.belongsTo(users, { as: "created_by_user", foreignKey: "created_by_user_id"});
  users.hasMany(expenses, { as: "created_by_user_expenses", foreignKey: "created_by_user_id"});
  manager_areas.belongsTo(users, { as: "manager_user", foreignKey: "manager_user_id"});
  users.hasMany(manager_areas, { as: "manager_areas", foreignKey: "manager_user_id"});
  message_recipients.belongsTo(users, { as: "recipient_user", foreignKey: "recipient_user_id"});
  users.hasMany(message_recipients, { as: "message_recipients", foreignKey: "recipient_user_id"});
  messages.belongsTo(users, { as: "sender_user", foreignKey: "sender_user_id"});
  users.hasMany(messages, { as: "messages", foreignKey: "sender_user_id"});
  notifications.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(notifications, { as: "notifications", foreignKey: "user_id"});
  performance_report_feedback.belongsTo(users, { as: "recipient_user", foreignKey: "recipient_user_id"});
  users.hasMany(performance_report_feedback, { as: "performance_report_feedbacks", foreignKey: "recipient_user_id"});
  performance_report_feedback.belongsTo(users, { as: "sender_user", foreignKey: "sender_user_id"});
  users.hasMany(performance_report_feedback, { as: "sender_user_performance_report_feedbacks", foreignKey: "sender_user_id"});
  performance_reports.belongsTo(users, { as: "admin_user", foreignKey: "admin_user_id"});
  users.hasMany(performance_reports, { as: "performance_reports", foreignKey: "admin_user_id"});
  performance_reports.belongsTo(users, { as: "generated_by_user", foreignKey: "generated_by_user_id"});
  users.hasMany(performance_reports, { as: "generated_by_user_performance_reports", foreignKey: "generated_by_user_id"});
  ratings.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(ratings, { as: "ratings", foreignKey: "collaborator_user_id"});
  scheduled_services.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(scheduled_services, { as: "scheduled_services", foreignKey: "collaborator_user_id"});
  service_order_photos.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(service_order_photos, { as: "service_order_photos", foreignKey: "collaborator_user_id"});
  service_orders.belongsTo(users, { as: "created_by_user", foreignKey: "created_by_user_id"});
  users.hasMany(service_orders, { as: "service_orders", foreignKey: "created_by_user_id"});
  service_requests.belongsTo(users, { as: "requester_user", foreignKey: "requester_user_id"});
  users.hasMany(service_requests, { as: "service_requests", foreignKey: "requester_user_id"});
  service_status_history.belongsTo(users, { as: "changed_by_user", foreignKey: "changed_by_user_id"});
  users.hasMany(service_status_history, { as: "service_status_histories", foreignKey: "changed_by_user_id"});
  system_settings.belongsTo(users, { as: "updated_by_user", foreignKey: "updated_by_user_id"});
  users.hasMany(system_settings, { as: "system_settings", foreignKey: "updated_by_user_id"});
  team_members.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(team_members, { as: "team_members", foreignKey: "user_id"});
  teams.belongsTo(users, { as: "manager_user", foreignKey: "manager_user_id"});
  users.hasMany(teams, { as: "teams", foreignKey: "manager_user_id"});
  time_clock_entries.belongsTo(users, { as: "approved_by_user", foreignKey: "approved_by_user_id"});
  users.hasMany(time_clock_entries, { as: "time_clock_entries", foreignKey: "approved_by_user_id"});
  time_clock_entries.belongsTo(users, { as: "collaborator_user", foreignKey: "collaborator_user_id"});
  users.hasMany(time_clock_entries, { as: "collaborator_user_time_clock_entries", foreignKey: "collaborator_user_id"});

  return {
    allocation_work_days,
    areas,
    assignment_statuses,
    audit_log,
    calendar_events,
    client_branches,
    client_users,
    collaborator_allocations,
    collaborator_assignments,
    collaborators,
    companies,
    document_types,
    documents,
    event_participants,
    expenses,
    manager_areas,
    message_recipients,
    messages,
    notifications,
    payment_methods,
    performance_report_feedback,
    performance_reports,
    photo_review_status,
    priority_levels,
    ratings,
    roles,
    scheduled_services,
    service_catalog,
    service_categories,
    service_order_photos,
    service_orders,
    service_requests,
    service_status_history,
    service_statuses,
    system_settings,
    team_members,
    teams,
    time_clock_entries,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
