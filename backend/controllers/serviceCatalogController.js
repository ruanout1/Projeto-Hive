const { models, sequelize } = require('../config/database');
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
      // Adicionamos 'icon' e 'is_system' ao retorno
      attributes: [['category_id', 'id'], 'name', 'color', 'icon', 'is_system']
    });
    res.status(200).json(categories);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar categorias');
  }
};

// POST /api/service-catalog/categories
exports.createCategory = async (req, res) => {
  const { name, color } = req.body;
  
  // REGRA DE NEGÓCIO: Cores permitidas para usuário
  // Se o usuário tentar criar algo colorido, forçamos para cinza (#6B7280) ou preto (#000000).
  // As cores vibrantes são exclusivas do sistema.
  let finalColor = color;
  const allowedUserColors = ['#6B7280', '#000000'];

  if (!allowedUserColors.includes(color)) {
      // Se não for uma das cores permitidas, força o padrão Cinza
      finalColor = '#6B7280'; 
  }

  try {
    const newCategory = await models.service_categories.create({ 
        name, 
        color: finalColor,
        icon: 'Hash', // Ícone padrão para categorias personalizadas
        is_system: false // Sempre falso para categorias criadas por usuário
    });
    
    res.status(201).json({
      id: newCategory.category_id,
      name: newCategory.name,
      color: newCategory.color,
      icon: newCategory.icon,
      isSystem: newCategory.is_system
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

    // Proteção: Não deixar alterar categorias do sistema (opcional, mas recomendado)
    if (category.is_system) {
        return res.status(403).json({ message: "Categorias do sistema não podem ser editadas." });
    }
    
    // Validação de cor também no update
    let finalColor = color;
    const allowedUserColors = ['#6B7280', '#000000'];
    if (!allowedUserColors.includes(color)) finalColor = '#6B7280';

    await category.update({ name, color: finalColor });
    
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
    const category = await models.service_categories.findByPk(id);
    
    if (!category) return res.status(404).json({ message: "Categoria não encontrada." });
    
    // TRAVA DE SEGURANÇA: Não apagar categorias padrão
    if (category.is_system) {
        return res.status(403).json({ message: "Categorias padrão do sistema não podem ser excluídas." });
    }

    // Verifica se tem serviços vinculados
    const servicesCount = await models.service_catalog.count({ where: { category_id: id } });
    
    if (servicesCount > 0) {
      return res.status(400).json({ 
        message: "Categoria em uso por serviços ativos. Não pode ser excluída." 
      });
    }

    await category.destroy();
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
      include: [{
        model: models.service_categories,
        as: 'category', 
        attributes: [['category_id', 'id'], 'name', 'color', 'icon'] // Incluindo ícone
      }],
      order: [['name', 'ASC']],
      attributes: [
        ['service_catalog_id', 'id'],
        'name', 'description', 'price', 'duration_value', 
        'duration_type', 'status', 'created_at'
      ]
    });
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
  const { status } = req.body; 

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