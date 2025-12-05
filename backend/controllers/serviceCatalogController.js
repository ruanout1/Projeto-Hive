const { models, sequelize } = require('../database/connection');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

// =====================================
// 1. CATEGORIAS DE SERVIÇOS
// =====================================

// GET /api/service-catalog/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await models.service_categories.findAll({
      order: [['name', 'ASC']],
      // Mapeamos category_id para 'id' para o frontend não quebrar
      attributes: [['category_id', 'id'], 'name', 'color']
    });
    res.status(200).json(categories);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar categorias');
  }
};

// POST /api/service-catalog/categories
exports.createCategory = async (req, res) => {
  const { name, color } = req.body;
  try {
    const newCategory = await models.service_categories.create({ 
        name, 
        color: color || '#6400A4' // Cor padrão roxa se não vier
    });
    
    res.status(201).json({
      id: newCategory.category_id,
      name: newCategory.name,
      color: newCategory.color
    });
  } catch (error) {
    handleDatabaseError(res, error, 'criar categoria');
  }
};

// PUT /api/service-catalog/categories/:id
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  try {
    const category = await models.service_categories.findByPk(id);
    if (!category) return res.status(404).json({ message: "Categoria não encontrada." });

    await category.update({ name, color });
    
    res.status(200).json({
      id: category.category_id,
      name: category.name,
      color: category.color
    });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar categoria');
  }
};

// DELETE /api/service-catalog/categories/:id
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // Verifica se tem serviços vinculados antes de apagar
    const servicesCount = await models.service_catalog.count({ where: { category_id: id } });
    
    if (servicesCount > 0) {
      return res.status(400).json({ 
        message: "Categoria em uso por serviços ativos. Não pode ser excluída." 
      });
    }

    const deleted = await models.service_categories.destroy({ where: { category_id: id } });
    if (!deleted) return res.status(404).json({ message: "Categoria não encontrada." });

    res.status(200).json({ message: "Categoria excluída." });
  } catch (error) {
    handleDatabaseError(res, error, 'excluir categoria');
  }
};

// =====================================
// 2. CATÁLOGO DE SERVIÇOS (ITENS)
// =====================================

// GET /api/service-catalog
exports.getAllCatalogServices = async (req, res) => {
  try {
    const services = await models.service_catalog.findAll({
      where: {
        status: 'active' // ✅ Filtrar apenas serviços ativos
      },
      include: [{
        model: models.service_categories,
        as: 'category', // Verifique no seu init-models se o alias é 'category' ou 'service_category'
        attributes: [['category_id', 'id'], 'name', 'color']
      }],
      order: [['name', 'ASC']],
      attributes: [
        ['service_catalog_id', 'id'],
        'name', 'description', 'price', 'duration_value',
        'duration_type', 'status', 'created_at'
      ]
    });

    // O Sequelize já retorna JSON limpo com associations se não usar raw:true
    res.status(200).json(services);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar catálogo');
  }
};

// POST /api/service-catalog
exports.createCatalogService = async (req, res) => {
  const { name, description, category_id, price, duration_value, duration_type } = req.body;

  if (!name || !category_id || !price) {
    return res.status(400).json({ message: "Campos obrigatórios: Nome, Categoria e Preço." });
  }

  try {
    const newService = await models.service_catalog.create({
      name, 
      description, 
      category_id, 
      price, 
      duration_value: duration_value || 1, 
      duration_type: duration_type || 'hours', 
      status: 'active'
    });
    res.status(201).json(newService);
  } catch (error) {
    handleDatabaseError(res, error, 'criar serviço');
  }
};

// PUT /api/service-catalog/:id
exports.updateCatalogService = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const [updated] = await models.service_catalog.update(data, {
      where: { service_catalog_id: id }
    });

    if (!updated) return res.status(404).json({ message: "Serviço não encontrado." });
    
    res.status(200).json({ message: "Serviço atualizado." });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar serviço');
  }
};

// PUT /api/service-catalog/:id/status
exports.updateCatalogServiceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' ou 'inactive'

  try {
    const [updated] = await models.service_catalog.update({ status }, {
      where: { service_catalog_id: id }
    });
    
    if (!updated) return res.status(404).json({ message: "Serviço não encontrado." });
    res.status(200).json({ message: "Status atualizado." });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar status');
  }
};

// DELETE /api/service-catalog/:id
exports.deleteCatalogService = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await models.service_catalog.destroy({ 
        where: { service_catalog_id: id } 
    });
    
    if (!deleted) return res.status(404).json({ message: "Serviço não encontrado." });
    res.status(200).json({ message: "Serviço excluído." });
  } catch (error) {
    handleDatabaseError(res, error, 'excluir serviço');
  }
};