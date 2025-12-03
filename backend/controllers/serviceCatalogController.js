const { Sequelize, Op } = require('sequelize');
const { ServiceCategory, ServiceCatalog } = require('../database/db');

// =====================================
// FUNÇÕES DO CATÁLOGO DE SERVIÇOS (Apenas Admin)
// =====================================

// GET /api/service-catalog/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.findAll({
      order: [['name', 'ASC']],
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
    const newCategory = await ServiceCategory.create({ name, color });
    const response = {
      id: newCategory.category_id,
      name: newCategory.name,
      color: newCategory.color
    };
    res.status(201).json(response);
  } catch (error) {
    handleDatabaseError(res, error, 'criar categoria');
  }
};

// PUT /api/service-catalog/categories/:id
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Nome da categoria é obrigatório." });
  }
  try {
    const category = await ServiceCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }
    await category.update({ name, color: color || category.color });
    const response = {
      id: category.category_id,
      name: category.name,
      color: category.color
    };
    res.status(200).json(response);
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar categoria');
  }
};

// DELETE /api/service-catalog/categories/:id
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await ServiceCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }
    const servicesUsingCategory = await ServiceCatalog.count({
      where: { category_id: id }
    });
    if (servicesUsingCategory > 0) {
      return res.status(400).json({ 
        message: "Não é possível excluir esta categoria pois existem serviços vinculados a ela.",
        servicesCount: servicesUsingCategory
      });
    }
    await category.destroy();
    res.status(200).json({ message: "Categoria excluída com sucesso." });
  } catch (error) {
    handleDatabaseError(res, error, 'excluir categoria');
  }
};

// GET /api/service-catalog
exports.getAllCatalogServices = async (req, res) => {
  try {
    const services = await ServiceCatalog.findAll({
      include: [{
        model: ServiceCategory,
        as: 'category', 
        attributes: [['category_id', 'id'], 'name', 'color']
      }],
      order: [['name', 'ASC']],
      attributes: [
        ['service_catalog_id', 'id'],
        'name', 'description', 'price', 'duration_value', 
        'duration_type', 'status', 'created_at'
      ]
    });
    const formattedServices = services.map((service) => service.get({ plain: true }));
    res.status(200).json(formattedServices);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar catálogo de serviços');
  }
};

// POST /api/service-catalog
exports.createCatalogService = async (req, res) => {
  const { name, description, category_id, price, duration_value, duration_type } = req.body;
  if (!name || !category_id || !price || !duration_value || !duration_type) {
    return res.status(400).json({ message: "Campos obrigatórios faltando." });
  }
  try {
    const newService = await ServiceCatalog.create({
      name, description, category_id, price, 
      duration_value, duration_type, status: 'active'
    });
    res.status(201).json(newService);
  } catch (error) {
    handleDatabaseError(res, error, 'criar serviço no catálogo');
  }
};

// PUT /api/service-catalog/:id
exports.updateCatalogService = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body; // Pega todos os dados do body

  try {
    const service = await ServiceCatalog.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }
    // Limpa campos que não devem ser atualizados (ex: status)
    delete updateData.status; 
    
    await service.update(updateData);
    res.status(200).json({ message: "Serviço atualizado com sucesso." });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar serviço');
  }
};

// PUT /api/service-catalog/:id/status
exports.updateCatalogServiceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Espera 'active' ou 'inactive'

  if (status === undefined) {
    return res.status(400).json({ message: "Status é obrigatório." });
  }
  try {
    const service = await ServiceCatalog.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }
    await service.update({ status: status }); 
    res.status(200).json({ message: "Status do serviço atualizado." });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar status do serviço');
  }
};

// DELETE /api/service-catalog/:id
exports.deleteCatalogService = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await ServiceCatalog.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }
    await service.destroy();
    res.status(200).json({ message: "Serviço excluído com sucesso." });
  } catch (error) {
    handleDatabaseError(res, error, 'excluir serviço');
  }
};