const AdminDocuments = require('../models/AdminDocuments');
const Company = require('../models/Company'); // ✅ MUDOU DE Client PARA Company
const DocumentType = require('../models/DocumentType'); // ✅ NOVO
const User = require('../models/User');
const { handleDatabaseError } = require('../utils/errorHandling');
const { Op } = require('sequelize');

// ============================================================================
// HELPER: Normalizar booleanos
// ============================================================================
const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return Boolean(value);
};

const normalizeDocument = (doc) => {
  if (!doc) return null;
  const normalized = doc.toJSON ? doc.toJSON() : doc;
  if ('is_available_to_client' in normalized) {
    normalized.is_available_to_client = normalizeBoolean(normalized.is_available_to_client);
  }
  return normalized;
};

// ============================================================================
// GET /api/documents/clients - Listar empresas ativas (mantém rota como 'clients' para compatibilidade)
// ============================================================================
exports.getClients = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { is_active: true },
      attributes: ['company_id', 'name', 'legal_name', 'cnpj'],
      order: [['name', 'ASC']]
    });

    // Formatar resposta (mantém formato client_id para compatibilidade com frontend)
    const formattedCompanies = companies.map(company => {
      const companyData = company.toJSON();
      return {
        client_id: companyData.company_id, // ✅ Frontend usa client_id
        main_company_name: companyData.name,
        legal_name: companyData.legal_name,
        cnpj: companyData.cnpj
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedCompanies
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'buscar empresas');
  }
};

// ============================================================================
// GET /api/documents/stats - Estatísticas
// ============================================================================
exports.getStats = async (req, res) => {
  try {
    const stats = await AdminDocuments.getStats();

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'buscar estatísticas');
  }
};

// ============================================================================
// GET /api/documents - Listar documentos (com filtros)
// ============================================================================
exports.getAll = async (req, res) => {
  try {
    const {
      type,
      client_id, // ✅ Frontend envia client_id
      is_available_to_client,
      search
    } = req.query;

    const filters = {};

    // ✅ Filtro por tipo (converte string para document_type_id)
    if (type) {
      const documentType = await DocumentType.findOne({
        where: { key_name: type }
      });
      if (documentType) {
        filters.document_type_id = documentType.document_type_id;
      }
    }

    // ✅ Filtro por empresa (client_id do frontend = company_id do banco)
    if (client_id && !isNaN(parseInt(client_id))) {
      filters.company_id = parseInt(client_id);
    }

    // Filtro por visibilidade
    if (is_available_to_client !== undefined) {
      filters.is_available_to_client = is_available_to_client === 'true' || is_available_to_client === true;
    }

    // ✅ Filtro de busca
    let searchFilter = null;
    if (search && search.trim()) {
      searchFilter = {
        [Op.or]: [
          { name: { [Op.like]: `%${search.trim()}%` } },
          { document_number: { [Op.like]: `%${search.trim()}%` } },
          { '$company.name$': { [Op.like]: `%${search.trim()}%` } }
        ]
      };
    }

    const documents = await AdminDocuments.findAllWithDetails(filters, searchFilter);

    // Normalizar resposta
    const normalizedDocuments = documents.map(doc => {
      const normalized = normalizeDocument(doc);
      
      // ✅ Converter company_id para client_id (frontend)
      if (normalized.company) {
        normalized.client_id = normalized.company.company_id;
        normalized.client = {
          client_id: normalized.company.company_id,
          main_company_name: normalized.company.name
        };
      }
      
      // ✅ Converter document_type_id para string
      if (normalized.documentType) {
        normalized.document_type = normalized.documentType.key_name;
      }
      
      return normalized;
    });

    return res.status(200).json({
      success: true,
      data: normalizedDocuments
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'listar documentos');
  }
};

// ============================================================================
// GET /api/documents/:id - Buscar por ID
// ============================================================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const document = await AdminDocuments.findByPk(parseInt(id), {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'name', 'legal_name']
        },
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['document_type_id', 'key_name', 'label']
        }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }

    const normalized = normalizeDocument(document);
    
    // ✅ Formatar para frontend
    if (normalized.company) {
      normalized.client_id = normalized.company.company_id;
      normalized.client = {
        client_id: normalized.company.company_id,
        main_company_name: normalized.company.name
      };
    }
    
    if (normalized.documentType) {
      normalized.document_type = normalized.documentType.key_name;
    }

    return res.status(200).json({
      success: true,
      data: normalized
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'buscar documento');
  }
};

// ============================================================================
// POST /api/documents - Criar documento
// ============================================================================
exports.create = async (req, res) => {
  try {
    const {
      document_type, // ✅ Frontend envia string ('contract', 'invoice', etc)
      name,
      description,
      file_url,
      file_size,
      mime_type,
      client_id, // ✅ Frontend envia client_id
      service_order_id,
      is_available_to_client
    } = req.body;

    // ✅ Validar e converter document_type string para document_type_id
    if (!document_type) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento é obrigatório'
      });
    }

    const documentType = await DocumentType.findOne({
      where: { key_name: document_type }
    });

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento inválido'
      });
    }

    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome do documento é obrigatório'
      });
    }

    if (!file_url || !file_url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'URL do arquivo é obrigatória'
      });
    }

    if (!client_id || isNaN(parseInt(client_id))) {
      return res.status(400).json({
        success: false,
        message: 'Empresa inválida'
      });
    }

    // ✅ Verificar se empresa existe
    const company = await Company.findByPk(parseInt(client_id));
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    const uploaded_by_user_id = req.user ? req.user.user_id : null;
    const document_number = await AdminDocuments.generateDocumentNumber();

    // ✅ Criar documento (client_id do frontend = company_id do banco)
    const newDocument = await AdminDocuments.create({
      document_type_id: documentType.document_type_id, // ✅ BIGINT
      document_number,
      name: name.trim(),
      description: description ? description.trim() : null,
      file_url: file_url.trim(),
      file_size: file_size || null,
      mime_type: mime_type || null,
      company_id: parseInt(client_id), // ✅ Converte client_id para company_id
      service_order_id: service_order_id ? parseInt(service_order_id) : null,
      is_available_to_client: is_available_to_client === true || is_available_to_client === 'true',
      uploaded_by_user_id
    });

    // Buscar documento completo
    const document = await AdminDocuments.findByPk(newDocument.document_id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'name', 'legal_name']
        },
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['document_type_id', 'key_name', 'label']
        }
      ]
    });

    const normalized = normalizeDocument(document);
    
    // ✅ Formatar resposta
    if (normalized.company) {
      normalized.client_id = normalized.company.company_id;
      normalized.client = {
        client_id: normalized.company.company_id,
        main_company_name: normalized.company.name
      };
    }
    
    if (normalized.documentType) {
      normalized.document_type = normalized.documentType.key_name;
    }

    return res.status(201).json({
      success: true,
      message: 'Documento criado com sucesso',
      data: normalized
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'criar documento');
  }
};

// ============================================================================
// PUT /api/documents/:id - Atualizar documento
// ============================================================================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      document_type, // ✅ String
      name,
      description,
      is_available_to_client
    } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const document = await AdminDocuments.findByPk(parseInt(id));

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }

    const updates = {};

    // ✅ Converter document_type string para document_type_id
    if (document_type) {
      const documentType = await DocumentType.findOne({
        where: { key_name: document_type }
      });
      
      if (!documentType) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de documento inválido'
        });
      }
      
      updates.document_type_id = documentType.document_type_id;
    }

    if (name) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nome não pode estar vazio'
        });
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (is_available_to_client !== undefined) {
      updates.is_available_to_client = is_available_to_client === true || is_available_to_client === 'true';
    }

    await document.update(updates);

    // Buscar documento atualizado
    const updatedDocument = await AdminDocuments.findByPk(parseInt(id), {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'name', 'legal_name']
        },
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['document_type_id', 'key_name', 'label']
        }
      ]
    });

    const normalized = normalizeDocument(updatedDocument);
    
    if (normalized.company) {
      normalized.client_id = normalized.company.company_id;
      normalized.client = {
        client_id: normalized.company.company_id,
        main_company_name: normalized.company.name
      };
    }
    
    if (normalized.documentType) {
      normalized.document_type = normalized.documentType.key_name;
    }

    return res.status(200).json({
      success: true,
      message: 'Documento atualizado com sucesso',
      data: normalized
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'atualizar documento');
  }
};

// ============================================================================
// PATCH /api/documents/:id/toggle-visibility - Alternar visibilidade
// ============================================================================
exports.toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const result = await AdminDocuments.toggleVisibility(parseInt(id));

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message || 'Documento não encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: normalizeDocument(result.document)
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'alternar visibilidade');
  }
};

// ============================================================================
// DELETE /api/documents/:id - Excluir documento
// ============================================================================
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const document = await AdminDocuments.findByPk(parseInt(id));

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }

    await document.destroy();

    return res.status(200).json({
      success: true,
      message: 'Documento excluído com sucesso'
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'excluir documento');
  }
};