DROP DATABASE IF EXISTS hive;
CREATE DATABASE hive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hive;

-- SQL mode recomendado
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ---------------------------------------------------------------------
-- LOOKUP / REFERENCE TABLES (flexíveis — permitem evolução sem alterar schema)
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  role_key VARCHAR(50) NOT NULL PRIMARY KEY,
  description VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO roles (role_key, description) VALUES
('admin','Administrador da terceirizadora'),
('manager','Gestor de equipes'),
('collaborator','Colaborador operacional'),
('client_user','Usuário representante da empresa cliente');

CREATE TABLE priority_levels (
  priority_key VARCHAR(30) NOT NULL PRIMARY KEY,
  label VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO priority_levels VALUES
('low','Baixa'),('medium','Média'),('high','Alta'),('urgent','Urgente');

CREATE TABLE service_statuses (
  status_key VARCHAR(50) NOT NULL PRIMARY KEY,
  label VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO service_statuses VALUES
('scheduled','Agendado'),('in_progress','Em execução'),('completed','Concluído'),
('cancelled','Cancelado'),('rescheduled','Reagendado');

CREATE TABLE assignment_statuses (
  status_key VARCHAR(50) NOT NULL PRIMARY KEY,
  label VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO assignment_statuses VALUES
('assigned','Atribuído'),('confirmed','Confirmado'),('in_progress','Em execução'),
('completed','Concluído'),('cancelled','Cancelado');

CREATE TABLE photo_review_status (
  review_key VARCHAR(30) NOT NULL PRIMARY KEY,
  label VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO photo_review_status VALUES
('pending','Pendente'),('approved','Aprovado'),('rejected','Rejeitado');

CREATE TABLE payment_methods (
  method_key VARCHAR(30) NOT NULL PRIMARY KEY,
  label VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO payment_methods VALUES
('pix','PIX'),('boleto','Boleto'),('card','Cartão'),('transfer','Transferência'),
('cash','Dinheiro'),('other','Outro');

-- ---------------------------------------------------------------------
-- CORE: Companies (clients), Branches (filiais)
CREATE TABLE companies (
  company_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE,
  main_phone VARCHAR(50),
  main_email VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name) -- Índice para busca rápida
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- CLIENT_BRANCHES
-- Ajuste: BOOLEAN e Índices
-- ---------------------------------------------------------------------
CREATE TABLE client_branches (
  branch_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  street VARCHAR(255),
  number VARCHAR(30),
  complement VARCHAR(100),
  neighborhood VARCHAR(150),
  city VARCHAR(150),
  state CHAR(2),
  zip_code VARCHAR(20), -- Reduzido de 30 para 20 (suficiente globalmente)
  latitude DECIMAL(10,8) NULL,
  longitude DECIMAL(11,8) NULL,
  is_main_branch BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_branch_company FOREIGN KEY (company_id) REFERENCES companies(company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_branches_company ON client_branches (company_id);
CREATE INDEX idx_branches_city ON client_branches (city);

-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
CREATE TABLE users (
  user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(40),
  avatar_url VARCHAR(500),
  role_key VARCHAR(50) NOT NULL, -- Certifique-se que a tabela 'roles' existe
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_key) REFERENCES roles(role_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_users_role ON users (role_key);

-- ---------------------------------------------------------------------
-- CLIENT_USERS
-- ---------------------------------------------------------------------
CREATE TABLE client_users (
  client_user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED NULL,
  permission_level VARCHAR(100) NULL,
  is_primary_contact BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cu_company FOREIGN KEY (company_id) REFERENCES companies(company_id),
  CONSTRAINT fk_cu_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_cu_branch FOREIGN KEY (branch_id) REFERENCES client_branches(branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE UNIQUE INDEX ux_client_user_company_user_branch ON client_users (company_id, user_id, branch_id);

-- ---------------------------------------------------------------------
-- COLLABORATORS
-- Ajuste: CPF Unique e tipos de data
-- ---------------------------------------------------------------------
CREATE TABLE collaborators (
  collaborator_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  registration VARCHAR(100),
  cpf VARCHAR(14) UNIQUE, -- Adicionado UNIQUE e ajustado tamanho
  birth_date DATE NULL,
  hire_date DATE NULL,
  termination_date DATE NULL,
  position VARCHAR(150),
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_collaborators_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_collaborators_user ON collaborators (user_id);

-- ---------------------------------------------------------------------
-- AREAS & MANAGER_AREAS
-- ---------------------------------------------------------------------
CREATE TABLE areas (
  area_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  code VARCHAR(50) NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE manager_areas (
  manager_area_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  manager_user_id BIGINT UNSIGNED NOT NULL,
  area_id BIGINT UNSIGNED NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_manager_areas_manager FOREIGN KEY (manager_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_manager_areas_area FOREIGN KEY (area_id) REFERENCES areas(area_id),
  UNIQUE KEY ux_manager_area (manager_user_id, area_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- TEAMS & TEAM_MEMBERS
-- ---------------------------------------------------------------------
CREATE TABLE teams (
  team_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  manager_user_id BIGINT UNSIGNED NULL,
  area_id BIGINT UNSIGNED NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_teams_manager FOREIGN KEY (manager_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_teams_area FOREIGN KEY (area_id) REFERENCES areas(area_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE team_members (
  team_member_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  team_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role VARCHAR(100) NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at DATETIME NULL,
  CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
  CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  UNIQUE KEY ux_team_user (team_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_team_manager ON teams (manager_user_id);

-- ---------------------------------------------------------------------
-- SERVICE CATALOG
-- ---------------------------------------------------------------------
CREATE TABLE service_categories (
  category_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT NULL,
  color VARCHAR(20) DEFAULT '#6400A4',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE service_catalog (
  service_catalog_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category_id BIGINT UNSIGNED NULL,
  price DECIMAL(12,2) NULL,
  requires_photos BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active',
  duration_value DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  duration_type VARCHAR(50) NOT NULL DEFAULT 'hours',
  event_color VARCHAR(7) DEFAULT '#35BAE6',
  event_icon VARCHAR(50) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sc_category FOREIGN KEY (category_id) REFERENCES service_categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_service_catalog_category ON service_catalog (category_id);

-- ---------------------------------------------------------------------
-- SERVICE REQUESTS
-- ---------------------------------------------------------------------
CREATE TABLE service_requests (
  service_request_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(80) NOT NULL UNIQUE,
  requester_user_id BIGINT UNSIGNED NOT NULL,
  requester_type VARCHAR(50) NOT NULL,
  company_id BIGINT UNSIGNED NULL,
  branch_id BIGINT UNSIGNED NULL,
  address_reference VARCHAR(255) NULL,
  service_catalog_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  desired_date DATE NULL,
  desired_time TIME NULL,
  priority_key VARCHAR(30) DEFAULT 'medium',
  status_key VARCHAR(50) DEFAULT 'pending',
  assigned_manager_user_id BIGINT UNSIGNED NULL,
  assigned_team_id BIGINT UNSIGNED NULL,
  assigned_collaborator_user_id BIGINT UNSIGNED NULL,
  observations TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sr_requester FOREIGN KEY (requester_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_sr_company FOREIGN KEY (company_id) REFERENCES companies(company_id),
  CONSTRAINT fk_sr_branch FOREIGN KEY (branch_id) REFERENCES client_branches(branch_id),
  CONSTRAINT fk_sr_service_catalog FOREIGN KEY (service_catalog_id) REFERENCES service_catalog(service_catalog_id),
  CONSTRAINT fk_sr_priority FOREIGN KEY (priority_key) REFERENCES priority_levels(priority_key),
  CONSTRAINT fk_sr_status FOREIGN KEY (status_key) REFERENCES service_statuses(status_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_sr_company_date ON service_requests (company_id, desired_date);

-- ---------------------------------------------------------------------
-- SERVICE ORDERS
-- ---------------------------------------------------------------------
CREATE TABLE service_orders (
  service_order_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(80) NOT NULL UNIQUE,
  company_id BIGINT UNSIGNED NOT NULL,
  service_request_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  period_start DATE NULL,
  period_end DATE NULL,
  total_value DECIMAL(14,2) NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  status VARCHAR(50) DEFAULT 'draft',
  created_by_user_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_so_company FOREIGN KEY (company_id) REFERENCES companies(company_id),
  CONSTRAINT fk_so_request FOREIGN KEY (service_request_id) REFERENCES service_requests(service_request_id),
  CONSTRAINT fk_so_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_service_orders_company ON service_orders (company_id);

-- ---------------------------------------------------------------------
-- SCHEDULED SERVICES
-- ---------------------------------------------------------------------
CREATE TABLE scheduled_services (
  scheduled_service_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  service_number VARCHAR(80) NULL UNIQUE,
  service_order_id BIGINT UNSIGNED NULL,
  service_catalog_id BIGINT UNSIGNED NOT NULL,
  company_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED NULL,
  area_id BIGINT UNSIGNED NULL,
  assigned_manager_area_id BIGINT UNSIGNED NULL,
  collaborator_user_id BIGINT UNSIGNED NULL,
  team_id BIGINT UNSIGNED NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  status_key VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  cancellation_reason TEXT NULL,
  requires_photos BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NULL,
  completion_notes TEXT NULL,
  client_visible_notes TEXT NULL,
  created_by_user_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ss_order FOREIGN KEY (service_order_id) REFERENCES service_orders(service_order_id),
  CONSTRAINT fk_ss_catalog FOREIGN KEY (service_catalog_id) REFERENCES service_catalog(service_catalog_id),
  CONSTRAINT fk_ss_company FOREIGN KEY (company_id) REFERENCES companies(company_id),
  CONSTRAINT fk_ss_branch FOREIGN KEY (branch_id) REFERENCES client_branches(branch_id),
  CONSTRAINT fk_ss_area FOREIGN KEY (area_id) REFERENCES areas(area_id),
  CONSTRAINT fk_ss_collab FOREIGN KEY (collaborator_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_ss_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
  CONSTRAINT fk_ss_status FOREIGN KEY (status_key) REFERENCES service_statuses(status_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ss_company_date ON scheduled_services (company_id, scheduled_date);
CREATE INDEX idx_ss_status_date ON scheduled_services (status_key, scheduled_date);

-- ---------------------------------------------------------------------
-- COLLABORATOR ALLOCATIONS
-- ---------------------------------------------------------------------
CREATE TABLE collaborator_allocations (
  allocation_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  allocation_number VARCHAR(80) NOT NULL UNIQUE,
  collaborator_user_id BIGINT UNSIGNED NOT NULL,
  company_id BIGINT UNSIGNED NOT NULL,
  service_catalog_id BIGINT UNSIGNED NULL,
  area_id BIGINT UNSIGNED NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  shift VARCHAR(50) NOT NULL DEFAULT 'full_day',
  status_key VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_by_user_id BIGINT UNSIGNED NULL,
  approved_by_user_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alloc_collab FOREIGN KEY (collaborator_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_alloc_company FOREIGN KEY (company_id) REFERENCES companies(company_id),
  CONSTRAINT fk_alloc_catalog FOREIGN KEY (service_catalog_id) REFERENCES service_catalog(service_catalog_id),
  CONSTRAINT fk_alloc_area FOREIGN KEY (area_id) REFERENCES areas(area_id),
  CONSTRAINT fk_alloc_status FOREIGN KEY (status_key) REFERENCES assignment_statuses(status_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE allocation_work_days (
  allocation_work_day_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  allocation_id BIGINT UNSIGNED NOT NULL,
  week_day VARCHAR(20) NOT NULL,
  CONSTRAINT fk_awd_allocation FOREIGN KEY (allocation_id) REFERENCES collaborator_allocations(allocation_id),
  UNIQUE KEY ux_allocation_weekday (allocation_id, week_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_alloc_collab ON collaborator_allocations (collaborator_user_id);

-- ---------------------------------------------------------------------
-- COLLABORATOR ASSIGNMENTS
-- ---------------------------------------------------------------------
CREATE TABLE collaborator_assignments (
  assignment_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  assignment_number VARCHAR(80) NOT NULL UNIQUE,
  scheduled_service_id BIGINT UNSIGNED NOT NULL,
  collaborator_user_id BIGINT UNSIGNED NOT NULL,
  team_id BIGINT UNSIGNED NULL,
  collaborator_status_key VARCHAR(50) NOT NULL DEFAULT 'assigned',
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at DATETIME NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  collaborator_notes TEXT NULL,
  created_by_user_id BIGINT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ca_scheduled FOREIGN KEY (scheduled_service_id) REFERENCES scheduled_services(scheduled_service_id),
  CONSTRAINT fk_ca_collab FOREIGN KEY (collaborator_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_ca_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
  CONSTRAINT fk_ca_status FOREIGN KEY (collaborator_status_key) REFERENCES assignment_statuses(status_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_assign_scheduled ON collaborator_assignments (scheduled_service_id);

-- ---------------------------------------------------------------------
-- SERVICE ORDER PHOTOS
-- ---------------------------------------------------------------------
CREATE TABLE service_order_photos (
  photo_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  service_order_id BIGINT UNSIGNED NULL,
  scheduled_service_id BIGINT UNSIGNED NULL,
  company_id BIGINT UNSIGNED NULL,
  collaborator_user_id BIGINT UNSIGNED NULL,
  branch_id BIGINT UNSIGNED NULL,
  photo_type VARCHAR(30) NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  description TEXT NULL,
  taken_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  review_status_key VARCHAR(30) NOT NULL DEFAULT 'pending',
  reviewed_by_user_id BIGINT UNSIGNED NULL,
  reviewed_at DATETIME NULL,
  review_notes TEXT NULL,
  is_visible_to_client BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sop_order FOREIGN KEY (service_order_id) REFERENCES service_orders(service_order_id),
  CONSTRAINT fk_sop_scheduled FOREIGN KEY (scheduled_service_id) REFERENCES scheduled_services(scheduled_service_id),
  CONSTRAINT fk_sop_company FOREIGN KEY (company_id) REFERENCES companies(company_id),
  CONSTRAINT fk_sop_collab FOREIGN KEY (collaborator_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_sop_branch FOREIGN KEY (branch_id) REFERENCES client_branches(branch_id),
  CONSTRAINT fk_sop_review_status FOREIGN KEY (review_status_key) REFERENCES photo_review_status(review_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_photos_scheduled ON service_order_photos (scheduled_service_id);
CREATE INDEX idx_photos_order ON service_order_photos (service_order_id);

-- ---------------------------------------------------------------------
-- DOCUMENTS
-- ---------------------------------------------------------------------
CREATE TABLE document_types (
  document_type_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  key_name VARCHAR(80) NOT NULL UNIQUE,
  label VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO document_types (key_name, label) VALUES
('contract','Contrato'),('invoice','Nota Fiscal'),('service_order','Ordem de Serviço'),('other','Outro');

CREATE TABLE documents (
  document_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  document_number VARCHAR(80) NULL,
  document_type_id BIGINT UNSIGNED NULL,
  company_id BIGINT UNSIGNED NULL,
  service_order_id BIGINT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size BIGINT NULL,
  mime_type VARCHAR(100) NULL,
  is_available_to_client BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by_user_id BIGINT UNSIGNED NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_docs_type FOREIGN KEY (document_type_id) REFERENCES document_types(document_type_id),
  CONSTRAINT fk_docs_company FOREIGN KEY (company_id) REFERENCES companies(company_id),
  CONSTRAINT fk_docs_order FOREIGN KEY (service_order_id) REFERENCES service_orders(service_order_id),
  CONSTRAINT fk_docs_uploaded_by FOREIGN KEY (uploaded_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_documents_company ON documents (company_id);
CREATE INDEX idx_documents_order ON documents (service_order_id);

-- ---------------------------------------------------------------------
-- MESSAGES
-- ---------------------------------------------------------------------
CREATE TABLE messages (
  message_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  sender_user_id BIGINT UNSIGNED NOT NULL,
  subject VARCHAR(255) NULL,
  body TEXT NOT NULL,
  priority_key VARCHAR(30) DEFAULT 'normal',
  parent_message_id BIGINT UNSIGNED NULL,
  attachment_url VARCHAR(500) NULL,
  conversation_type VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_msg_parent FOREIGN KEY (parent_message_id) REFERENCES messages(message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE message_recipients (
  message_recipient_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  message_id BIGINT UNSIGNED NOT NULL,
  recipient_user_id BIGINT UNSIGNED NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at DATETIME NULL,
  CONSTRAINT fk_mr_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
  CONSTRAINT fk_mr_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(user_id),
  UNIQUE KEY ux_message_recipient (message_id, recipient_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  notification_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(150) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(100) NULL,
  related_entity_id BIGINT UNSIGNED NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at DATETIME NULL,
  action_url VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read);

-- ---------------------------------------------------------------------
-- RATINGS
-- ---------------------------------------------------------------------
CREATE TABLE ratings (
  rating_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NOT NULL,
  scheduled_service_id BIGINT UNSIGNED NULL,
  collaborator_user_id BIGINT UNSIGNED NULL,
  service_order_id BIGINT UNSIGNED NULL,
  rating TINYINT UNSIGNED NOT NULL, -- 1 a 5
  category VARCHAR(100) NULL,
  comment TEXT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ratings_company FOREIGN KEY (company_id) REFERENCES companies(company_id),
  CONSTRAINT fk_ratings_scheduled FOREIGN KEY (scheduled_service_id) REFERENCES scheduled_services(scheduled_service_id),
  CONSTRAINT fk_ratings_collab FOREIGN KEY (collaborator_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_ratings_order FOREIGN KEY (service_order_id) REFERENCES service_orders(service_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ratings_company ON ratings (company_id);

-- ---------------------------------------------------------------------
-- TIME CLOCK
-- ---------------------------------------------------------------------
CREATE TABLE time_clock_entries (
  time_clock_entry_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  collaborator_user_id BIGINT UNSIGNED NOT NULL,
  entry_date DATE NOT NULL,
  clock_in TIME NULL,
  clock_out TIME NULL,
  lunch_start TIME NULL,
  lunch_end TIME NULL,
  total_hours DECIMAL(6,2) NULL,
  location_lat DECIMAL(10,8) NULL,
  location_lng DECIMAL(11,8) NULL,
  validated_by_manager BOOLEAN NOT NULL DEFAULT FALSE,
  digital_signature VARCHAR(255) NULL,
  notes TEXT NULL,
  status VARCHAR(50) DEFAULT 'present',
  approved_by_user_id BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tce_collab FOREIGN KEY (collaborator_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_tce_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_tce_collab_date ON time_clock_entries (collaborator_user_id, entry_date);

-- ---------------------------------------------------------------------
-- EXPENSES
-- ---------------------------------------------------------------------
CREATE TABLE expenses (
  expense_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NULL,
  service_order_id BIGINT UNSIGNED NULL,
  category VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method_key VARCHAR(30) DEFAULT 'other',
  receipt_url VARCHAR(500) NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_by_user_id BIGINT UNSIGNED NULL,
  approved_by_user_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_company FOREIGN KEY (company_id) REFERENCES companies(company_id),
  CONSTRAINT fk_expenses_order FOREIGN KEY (service_order_id) REFERENCES service_orders(service_order_id),
  CONSTRAINT fk_expenses_payment FOREIGN KEY (payment_method_key) REFERENCES payment_methods(method_key),
  CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_expenses_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_expenses_company_date ON expenses (company_id, expense_date);

-- ---------------------------------------------------------------------
-- AUDIT LOG
-- Ajuste: JSON para otimização
-- ---------------------------------------------------------------------
CREATE TABLE audit_log (
  audit_log_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(150) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id BIGINT UNSIGNED NULL,
  old_values JSON NULL, -- Melhor que TEXT para MySQL 8
  new_values JSON NULL, -- Melhor que TEXT para MySQL 8
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_audit_user ON audit_log (user_id);

-- ---------------------------------------------------------------------
-- SERVICE STATUS HISTORY
-- ---------------------------------------------------------------------
CREATE TABLE service_status_history (
  history_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  scheduled_service_id BIGINT UNSIGNED NOT NULL,
  old_status_key VARCHAR(50) NULL,
  new_status_key VARCHAR(50) NOT NULL,
  changed_by_user_id BIGINT UNSIGNED NOT NULL,
  change_reason TEXT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ssh_scheduled FOREIGN KEY (scheduled_service_id) REFERENCES scheduled_services(scheduled_service_id),
  CONSTRAINT fk_ssh_changed_by FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id),
  -- Lembre-se: As tabelas service_statuses devem existir para estas FKs funcionarem
  CONSTRAINT fk_ssh_old_status FOREIGN KEY (old_status_key) REFERENCES service_statuses(status_key),
  CONSTRAINT fk_ssh_new_status FOREIGN KEY (new_status_key) REFERENCES service_statuses(status_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ssh_scheduled ON service_status_history (scheduled_service_id, changed_at);

-- ---------------------------------------------------------------------
-- PERFORMANCE REPORTS
-- ---------------------------------------------------------------------
CREATE TABLE performance_reports (
  performance_report_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  report_scope VARCHAR(50) NOT NULL, -- 'collaborator','team','area','company'
  entity_id BIGINT UNSIGNED NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_services INT NOT NULL DEFAULT 0,
  completed_services INT NOT NULL DEFAULT 0,
  cancelled_services INT NOT NULL DEFAULT 0,
  total_hours DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  average_rating DECIMAL(4,2) NULL,
  efficiency_score DECIMAL(6,2) NULL,
  generated_by_user_id BIGINT UNSIGNED NULL,
  admin_feedback TEXT NULL,
  admin_user_id BIGINT UNSIGNED NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pr_generated_by FOREIGN KEY (generated_by_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_pr_admin_user FOREIGN KEY (admin_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- PERFORMANCE REPORT FEEDBACK
-- ---------------------------------------------------------------------
CREATE TABLE performance_report_feedback (
  feedback_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  performance_report_id BIGINT UNSIGNED NOT NULL,
  sender_user_id BIGINT UNSIGNED NOT NULL,
  recipient_user_id BIGINT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prf_report FOREIGN KEY (performance_report_id) REFERENCES performance_reports(performance_report_id),
  CONSTRAINT fk_prf_sender FOREIGN KEY (sender_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_prf_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- SYSTEM SETTINGS
-- ---------------------------------------------------------------------
CREATE TABLE system_settings (
  system_setting_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(150) NOT NULL UNIQUE,
  setting_value TEXT NULL,
  description TEXT NULL,
  updated_by_user_id BIGINT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_settings_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- CALENDAR EVENTS (Reuniões, Lembretes, Pessoais)
-- Diferente de "Scheduled Services", estes não geram cobrança nem ordem de serviço.
-- ---------------------------------------------------------------------
CREATE TABLE calendar_events (
  event_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  event_type ENUM('meeting', 'personal', 'reminder', 'holiday') NOT NULL DEFAULT 'meeting',
  
  -- Controle de tempo (Data e Hora juntas facilitam componentes de calendário como FullCalendar)
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Localização (pode ser link do Zoom/Teams ou sala física)
  location VARCHAR(255) NULL,
  meeting_link VARCHAR(500) NULL,
  
  -- Quem criou (Dono do evento)
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  
  -- Cor para o calendário (visual)
  color_hex VARCHAR(7) DEFAULT '#8E44AD', -- Roxo padrão do seu print
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_creator FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- EVENT PARTICIPANTS (Convidados da Reunião)
-- Permite que Admin convide Gestores e Colaboradores
-- ---------------------------------------------------------------------
CREATE TABLE event_participants (
  participant_id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  event_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL, -- O convidado
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_ep_event FOREIGN KEY (event_id) REFERENCES calendar_events(event_id) ON DELETE CASCADE,
  CONSTRAINT fk_ep_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY ux_event_user (event_id, user_id) -- Não pode convidar a mesma pessoa 2x
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 1. VIEWS OTIMIZADAS
-- =====================================================================

-- 2.1 vw_collaborator_schedule
-- Ajuste: Uso de CONCAT_WS para evitar que endereço fique NULL se faltar complemento
CREATE OR REPLACE VIEW vw_collaborator_schedule AS
SELECT
  ss.scheduled_service_id AS id,
  COALESCE(ss.service_number, CAST(ss.scheduled_service_id AS CHAR)) AS service_number,
  sc.name AS service_type,
  ss.notes AS description,
  ss.scheduled_date,
  DATE_FORMAT(ss.start_time, '%H:%i') AS scheduled_time, -- Formatação HH:MM
  CONCAT_WS(', ', cb.street, cb.number, cb.neighborhood, cb.city) AS location,
  t.name AS assigned_team,
  u.full_name AS assigned_collaborator,
  ss.status_key AS status,
  ss.notes AS observations,
  c.name AS client_name,
  cb.name AS client_branch
FROM scheduled_services ss
LEFT JOIN service_catalog sc ON ss.service_catalog_id = sc.service_catalog_id
LEFT JOIN teams t ON ss.team_id = t.team_id
LEFT JOIN users u ON ss.collaborator_user_id = u.user_id
LEFT JOIN companies c ON ss.company_id = c.company_id
LEFT JOIN client_branches cb ON ss.branch_id = cb.branch_id;

-- 2.2 vw_scheduled_services_summary
CREATE OR REPLACE VIEW vw_scheduled_services_summary AS
SELECT
  ss.scheduled_service_id,
  ss.scheduled_date,
  ss.status_key AS status,
  sc.name AS service_name,
  c.name AS client_name,
  u.full_name AS collaborator_name,
  a.name AS area_name,
  ss.start_time,
  ss.end_time
FROM scheduled_services ss
LEFT JOIN service_catalog sc ON ss.service_catalog_id = sc.service_catalog_id
LEFT JOIN companies c ON ss.company_id = c.company_id
LEFT JOIN users u ON ss.collaborator_user_id = u.user_id
LEFT JOIN areas a ON ss.area_id = a.area_id;

-- 2.3 vw_collaborator_performance
-- Ajuste: Removida a tabela performance_reports do JOIN para evitar duplicidade de dados.
-- O cálculo agora é feito em tempo real (Real-time) baseando-se nos serviços agendados.
CREATE OR REPLACE VIEW vw_collaborator_performance AS
SELECT
  u.user_id AS collaborator_user_id,
  u.full_name AS collaborator_name,
  COUNT(ss.scheduled_service_id) AS total_services,
  -- Exemplo de cálculo de horas baseadas na duração estimada do catálogo (ou poderia ser time_clock)
  COALESCE(SUM(sc.duration_value), 0) AS estimated_hours_worked,
  COALESCE(AVG(r.rating), 0) AS average_rating,
  SUM(CASE WHEN ss.status_key = 'completed' THEN 1 ELSE 0 END) AS completed_services
FROM users u
LEFT JOIN scheduled_services ss ON ss.collaborator_user_id = u.user_id
LEFT JOIN service_catalog sc ON ss.service_catalog_id = sc.service_catalog_id
LEFT JOIN ratings r ON r.collaborator_user_id = u.user_id
WHERE u.role_key = 'collaborator'
GROUP BY u.user_id, u.full_name;

-- 2.5 vw_users_summary
-- Ajuste: DISTINCT adicionado pois um usuário pode estar em várias filiais (client_users)
CREATE OR REPLACE VIEW vw_users_summary AS
SELECT DISTINCT
  u.user_id,
  u.email,
  u.full_name,
  u.role_key,
  u.phone,
  u.is_active,
  c.name AS client_company
FROM users u
LEFT JOIN client_users cu ON cu.user_id = u.user_id
LEFT JOIN companies c ON cu.company_id = c.company_id;

-- 2.6 vw_scheduled_services_admin
CREATE OR REPLACE VIEW vw_scheduled_services_admin AS
SELECT
  ss.scheduled_service_id AS id,
  ss.service_number,
  c.name AS client_name,
  cb.name AS client_branch,
  sc.name AS service_type,
  ss.scheduled_date,
  ss.start_time,
  ss.end_time,
  ss.status_key AS status,
  t.name AS assigned_team,
  u.full_name AS assigned_collaborator,
  ss.cancellation_reason
FROM scheduled_services ss
LEFT JOIN companies c ON ss.company_id = c.company_id
LEFT JOIN client_branches cb ON ss.branch_id = cb.branch_id
LEFT JOIN service_catalog sc ON ss.service_catalog_id = sc.service_catalog_id
LEFT JOIN teams t ON ss.team_id = t.team_id
LEFT JOIN users u ON ss.collaborator_user_id = u.user_id;

-- =====================================================================
-- 2. TRIGGERS
-- =====================================================================

DELIMITER $$

-- 3.1 Trigger: gravar histórico de status
-- Ajuste: Tenta usar a variavel de sessão @current_user_id se disponível
CREATE TRIGGER trg_scheduled_services_status_change
BEFORE UPDATE ON scheduled_services
FOR EACH ROW
BEGIN
  -- Se o status mudou
  IF NEW.status_key <> OLD.status_key THEN
     -- Tenta pegar o ID do usuário da sessão ou define NULL
     SET @user_id_check = (SELECT @current_user_id);
     
     INSERT INTO service_status_history (
        scheduled_service_id, 
        old_status_key, 
        new_status_key, 
        changed_by_user_id, 
        change_reason, 
        changed_at
     )
     VALUES (
        OLD.scheduled_service_id, 
        OLD.status_key, 
        NEW.status_key, 
        -- Se @current_user_id for nulo, tenta usar o created_by apenas como fallback, 
        -- mas o ideal é o Backend enviar "SET @current_user_id = X" antes do update.
        COALESCE(@user_id_check, OLD.created_by_user_id), 
        'Changed via system update', 
        NOW()
     );
  END IF;
END $$

-- 3.2 Trigger: notificar criação de scheduled_service
CREATE TRIGGER trg_after_insert_scheduled_service
AFTER INSERT ON scheduled_services
FOR EACH ROW
BEGIN
  -- Inserir notificação para CLIENTES (primary contacts)
  INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, created_at)
  SELECT 
    cu.user_id, 
    'scheduled_service_created', 
    CONCAT('Novo agendamento: ', COALESCE(NEW.service_number, NEW.scheduled_service_id)),
    CONCAT('Data: ', DATE_FORMAT(NEW.scheduled_date, '%d/%m/%Y')), 
    'scheduled_service', 
    NEW.scheduled_service_id, 
    NOW()
  FROM client_users cu
  WHERE cu.company_id = NEW.company_id AND cu.is_primary_contact = 1;

  -- Inserir notificação para GESTORES DA ÁREA
  INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, created_at)
  SELECT 
    ma.manager_user_id, 
    'scheduled_service_created_area', 
    CONCAT('Novo serviço na área: ', COALESCE(NEW.service_number, NEW.scheduled_service_id)),
    CONCAT('Data: ', DATE_FORMAT(NEW.scheduled_date, '%d/%m/%Y')), 
    'scheduled_service', 
    NEW.scheduled_service_id, 
    NOW()
  FROM manager_areas ma
  WHERE ma.area_id = NEW.area_id;
END $$

DELIMITER ;

CREATE OR REPLACE VIEW vw_user_agenda AS
-- PARTE 1: SERVIÇOS AGENDADOS (O "Trabalho")
SELECT 
    'service' AS item_type,
    ss.scheduled_service_id AS source_id,
    
    -- AJUSTE AQUI: Usando c.name e companies em vez de clients
    CONCAT(sc.name, ' - ', c.name) AS title,
    ss.notes AS description,
    
    -- Datas
    CAST(CONCAT(ss.scheduled_date, ' ', COALESCE(ss.start_time, '08:00:00')) AS DATETIME) AS start_at,
    CAST(CONCAT(ss.scheduled_date, ' ', COALESCE(ss.end_time, ADDTIME(ss.start_time, '01:00:00'))) AS DATETIME) AS end_at,
    
    FALSE AS is_all_day,
    '#3498DB' AS color, -- Azul
    
    ss.collaborator_user_id AS user_id,
    ss.status_key AS status
FROM scheduled_services ss
JOIN service_catalog sc ON ss.service_catalog_id = sc.service_catalog_id
-- AJUSTE AQUI: Join correto com companies
JOIN companies c ON ss.company_id = c.company_id

UNION ALL

-- PARTE 2: EVENTOS ONDE SOU O CRIADOR
SELECT 
    'event' AS item_type,
    ev.event_id AS source_id,
    ev.title,
    ev.description,
    ev.start_at,
    ev.end_at,
    ev.is_all_day,
    ev.color_hex AS color,
    ev.created_by_user_id AS user_id,
    'scheduled' AS status
FROM calendar_events ev

UNION ALL

-- PARTE 3: EVENTOS ONDE SOU CONVIDADO
SELECT 
    'event' AS item_type,
    ev.event_id AS source_id,
    ev.title,
    ev.description,
    ev.start_at,
    ev.end_at,
    ev.is_all_day,
    ev.color_hex AS color,
    ep.user_id AS user_id,
    ep.status AS status
FROM calendar_events ev
JOIN event_participants ep ON ev.event_id = ep.event_id;

SHOW TRIGGERS WHERE `Table` = 'scheduled_services';

-- =================================================================
-- LABORATÓRIO DE TESTE DE TRIGGERS
-- =================================================================

-- 1. PREPARAÇÃO DO AMBIENTE (Cria dados de apoio)
-- Garante que temos categorias e status
INSERT IGNORE INTO service_categories (name, color) VALUES ('Teste Category', '#000000');
INSERT IGNORE INTO service_statuses (status_key, label) VALUES ('scheduled', 'Agendado'), ('completed', 'Concluído');

-- Cria uma empresa de teste
INSERT INTO companies (name, legal_name, cnpj) 
VALUES ('Empresa Teste Trigger', 'Razão Social Teste', '99.999.999/0001-99');

SET @id_empresa = LAST_INSERT_ID();

-- Cria um usuário de teste
INSERT INTO users (email, password_hash, full_name, role_key) 
VALUES (CONCAT('teste.', UUID(), '@email.com'), 'hash123', 'Usuario Teste Trigger', 'client_user');

SET @id_usuario = LAST_INSERT_ID();

-- Vincula usuário à empresa como CONTATO PRINCIPAL (Isso é OBRIGATÓRIO para o trigger de notificação funcionar)
INSERT INTO client_users (company_id, user_id, is_primary_contact) 
VALUES (@id_empresa, @id_usuario, 1);

-- Cria um serviço no catálogo
INSERT INTO service_catalog (name, duration_type, duration_value) 
VALUES ('Serviço de Teste Trigger', 'hours', 1.00);

SET @id_catalogo = LAST_INSERT_ID();





-- à partir daqui ficarão todas as mudanças e adições que forem sendo feitas no banco se caso houver necessidade!

ALTER TABLE calendar_events 
ADD COLUMN reminder VARCHAR(50) DEFAULT 'none' AFTER color_hex;


CREATE OR REPLACE VIEW vw_user_agenda AS
-- Parte 1: Serviços Agendados (Serviços nunca são "dia inteiro", então is_all_day = 0)
SELECT 
    s.scheduled_service_id AS source_id,
    c.name AS title,
    cat.name AS description,
    s.start_time,
    s.end_time,
    s.scheduled_date AS start_at, 
    ADDTIME(s.scheduled_date, s.end_time) AS end_at,
    '#35BAE6' AS color,
    'service' AS item_type,
    s.status_key AS status,
    s.collaborator_user_id AS user_id,
    CONCAT(b.street, ', ', b.number, ' - ', b.city) AS location,
    NULL AS meeting_link,
    'none' AS reminder,
    0 AS is_all_day  -- <--- CAMPO ADICIONADO
FROM scheduled_services s
LEFT JOIN companies c ON s.company_id = c.company_id
LEFT JOIN service_catalog cat ON s.service_catalog_id = cat.service_catalog_id
LEFT JOIN client_branches b ON c.company_id = b.company_id AND b.is_main_branch = 1

UNION ALL

-- Parte 2: Eventos de Calendário
SELECT 
    e.event_id AS source_id,
    e.title,
    e.description,
    TIME(e.start_at) AS start_time,
    TIME(e.end_at) AS end_time,
    e.start_at,
    e.end_at,
    e.color_hex AS color,
    e.event_type AS item_type,
    'scheduled' AS status,
    e.created_by_user_id AS user_id,
    e.location,
    e.meeting_link,
    e.reminder,
    e.is_all_day  -- <--- CAMPO ADICIONADO
FROM calendar_events e;

-- Adiciona a área principal na tabela de empresas
ALTER TABLE companies ADD COLUMN main_area VARCHAR(50) AFTER cnpj;

-- Adiciona a área específica na tabela de filiais (cada unidade pode ser de uma área)
ALTER TABLE client_branches ADD COLUMN area VARCHAR(50) AFTER zip_code;


-- adição de campos para tornar as categorias dos serviços padronizadas):

-- Adiciona suporte a ícones e flag de sistema
ALTER TABLE service_categories
ADD COLUMN icon VARCHAR(50) DEFAULT 'Hash',
ADD COLUMN is_system BOOLEAN DEFAULT FALSE;

INSERT INTO service_categories (name, color, icon, is_system) VALUES 
('Outros', '#6400A4', 'Sparkles', TRUE),
('Portaria/Recepção', '#8B20EE', 'Users', TRUE),
('Limpeza', '#10B981', 'Droplet', TRUE),
('Segurança', '#35BAE6', 'Shield', TRUE),
('Zeladoria', '#F97316', 'Wrench', TRUE), -- Laranja
('Manutenção', '#EF4444', 'Hammer', TRUE),
('Pintura', '#FFFF20', 'PaintBucket', TRUE);
