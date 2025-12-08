// backend/controllers/adminClientController.js
const { Op } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('../models/User');
const Client = require('../models/Client');
const ClientAddress = require('../models/ClientAddress');
const Area = require('../models/Area');

// ============================================================================
// HELPERS
// ============================================================================
const formatCNPJ = (cnpj) => {
  if (!cnpj) return null;
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.length === 14;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// ============================================================================
// GET STATS
// ============================================================================
exports.getClientStats = async (req, res) => {
  try {
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN c.is_active = TRUE THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN c.is_active = FALSE THEN 1 ELSE 0 END) as inactive,
        COALESCE(SUM(c.contract_value), 0) as totalRevenue
      FROM clients c
    `);
    
    res.json({
      success: true,
      data: {
        total: parseInt(stats[0].total) || 0,
        active: parseInt(stats[0].active) || 0,
        inactive: parseInt(stats[0].inactive) || 0,
        totalRevenue: parseFloat(stats[0].totalRevenue) || 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
};

// ============================================================================
// GET ALL CLIENTS
// ============================================================================
exports.getAllClients = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let whereClause = {};
    
    // Filtro de status
    if (status === 'active') {
      whereClause.is_active = true;
    } else if (status === 'inactive') {
      whereClause.is_active = false;
    }
    
    // Filtro de busca
    let userWhereClause = {};
    if (search) {
      userWhereClause = {
        [Op.or]: [
          { full_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    // Buscar clientes
    let query = `
      SELECT 
        c.client_id,
        c.main_company_name as name,
        c.main_cnpj as cnpj,
        u.email,
        u.phone,
        c.notes,
        c.is_active,
        c.created_at,
        c.contract_value,
        (SELECT COUNT(*) FROM scheduled_services ss 
         WHERE ss.client_id = c.client_id AND ss.status IN ('scheduled', 'in_progress')) as servicesActive,
        (SELECT COUNT(*) FROM scheduled_services ss 
         WHERE ss.client_id = c.client_id AND ss.status = 'completed') as servicesCompleted,
        (SELECT MAX(ss.scheduled_date) FROM scheduled_services ss 
         WHERE ss.client_id = c.client_id) as lastService,
        (SELECT AVG(r.rating) FROM ratings r 
         WHERE r.client_id = c.client_id) as rating
      FROM clients c
      INNER JOIN users u ON c.user_id = u.user_id
      WHERE 1=1
    `;
    
    const params = { replacements: [] };
    
    if (status === 'active') {
      query += ' AND c.is_active = TRUE';
    } else if (status === 'inactive') {
      query += ' AND c.is_active = FALSE';
    }
    
    if (search) {
      query += ` AND (
        c.main_company_name LIKE ? OR 
        c.main_cnpj LIKE ? OR 
        u.email LIKE ? OR 
        u.phone LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.replacements = [searchTerm, searchTerm, searchTerm, searchTerm];
    }
    
    query += ' ORDER BY c.main_company_name ASC';
    
    const [clients] = await sequelize.query(query, params);
    
    // Processar cada cliente
    for (let client of clients) {
      // Buscar endereços
      const [addresses] = await sequelize.query(`
        SELECT ca.*, a.code as area_code
        FROM client_addresses ca
        LEFT JOIN areas a ON ca.area_id = a.area_id
        WHERE ca.client_id = ?
        ORDER BY ca.address_id ASC
      `, {
        replacements: [client.client_id]
      });
      
      if (addresses.length > 0) {
        const addr = addresses[0];
        client.address = {
          street: addr.street || '',
          number: addr.number || '',
          complement: addr.complement || '',
          zipCode: addr.zip_code || '',
          neighborhood: addr.neighborhood || '',
          city: addr.city || '',
          state: addr.state || ''
        };
        client.area = addr.area_code || 'centro';
      } else {
        client.address = {
          street: '', number: '', complement: '',
          zipCode: '', neighborhood: '', city: '', state: ''
        };
        client.area = 'centro';
      }
      
      // Buscar todas as localizações
      client.locations = addresses.map((loc, index) => ({
        id: `loc-${loc.address_id}`,
        name: loc.nickname || `Unidade ${index + 1}`,
        address: {
          street: loc.street || '',
          number: loc.number || '',
          complement: loc.complement || '',
          zipCode: loc.zip_code || '',
          neighborhood: loc.neighborhood || '',
          city: loc.city || '',
          state: loc.state || ''
        },
        area: loc.area_code || 'centro',
        isPrimary: index === 0
      }));
      
      // Formatar resposta
      client.id = client.client_id;
      client.status = client.is_active ? 'active' : 'inactive';
      client.cnpj = formatCNPJ(client.cnpj) || '';
      client.totalValue = client.contract_value 
        ? `R$ ${parseFloat(client.contract_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : 'R$ 0,00';
      client.lastService = client.lastService 
        ? new Date(client.lastService).toLocaleDateString('pt-BR')
        : '-';
      client.rating = client.rating ? parseFloat(client.rating) : 0;
      client.createdAt = client.created_at 
        ? new Date(client.created_at).toLocaleDateString('pt-BR')
        : null;
      
      // Limpar campos
      delete client.client_id;
      delete client.is_active;
      delete client.created_at;
      delete client.contract_value;
    }
    
    res.json({
      success: true,
      data: clients,
      count: clients.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar clientes',
      error: error.message
    });
  }
};

// ============================================================================
// GET CLIENT BY ID
// ============================================================================
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [clients] = await sequelize.query(`
      SELECT 
        c.client_id,
        c.main_company_name as name,
        c.main_cnpj as cnpj,
        u.email,
        u.phone,
        c.notes,
        c.is_active,
        c.created_at,
        c.contract_value,
        (SELECT COUNT(*) FROM scheduled_services ss 
         WHERE ss.client_id = c.client_id AND ss.status IN ('scheduled', 'in_progress')) as servicesActive,
        (SELECT COUNT(*) FROM scheduled_services ss 
         WHERE ss.client_id = c.client_id AND ss.status = 'completed') as servicesCompleted,
        (SELECT MAX(ss.scheduled_date) FROM scheduled_services ss 
         WHERE ss.client_id = c.client_id) as lastService,
        (SELECT AVG(r.rating) FROM ratings r 
         WHERE r.client_id = c.client_id) as rating
      FROM clients c
      INNER JOIN users u ON c.user_id = u.user_id
      WHERE c.client_id = ?
    `, {
      replacements: [id]
    });
    
    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    const client = clients[0];
    
    // Buscar localizações
    const [locations] = await sequelize.query(`
      SELECT ca.*, a.code as area_code
      FROM client_addresses ca
      LEFT JOIN areas a ON ca.area_id = a.area_id
      WHERE ca.client_id = ?
      ORDER BY ca.address_id ASC
    `, {
      replacements: [id]
    });
    
    client.locations = locations.map((loc, index) => ({
      id: `loc-${loc.address_id}`,
      name: loc.nickname || `Unidade ${index + 1}`,
      address: {
        street: loc.street || '',
        number: loc.number || '',
        complement: loc.complement || '',
        zipCode: loc.zip_code || '',
        neighborhood: loc.neighborhood || '',
        city: loc.city || '',
        state: loc.state || ''
      },
      area: loc.area_code || 'centro',
      isPrimary: index === 0
    }));
    
    if (locations.length > 0) {
      const addr = locations[0];
      client.address = {
        street: addr.street || '',
        number: addr.number || '',
        complement: addr.complement || '',
        zipCode: addr.zip_code || '',
        neighborhood: addr.neighborhood || '',
        city: addr.city || '',
        state: addr.state || ''
      };
      client.area = addr.area_code || 'centro';
    }
    
    // Formatar
    client.id = client.client_id;
    client.status = client.is_active ? 'active' : 'inactive';
    client.cnpj = formatCNPJ(client.cnpj) || '';
    client.totalValue = client.contract_value 
      ? `R$ ${parseFloat(client.contract_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : 'R$ 0,00';
    client.lastService = client.lastService 
      ? new Date(client.lastService).toLocaleDateString('pt-BR')
      : '-';
    client.rating = client.rating ? parseFloat(client.rating) : 0;
    client.createdAt = client.created_at 
      ? new Date(client.created_at).toLocaleDateString('pt-BR')
      : null;
    
    delete client.client_id;
    delete client.is_active;
    delete client.created_at;
    delete client.contract_value;
    
    res.json({ success: true, data: client });
    
  } catch (error) {
    console.error('❌ Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente',
      error: error.message
    });
  }
};

// ============================================================================
// CREATE CLIENT
// ============================================================================
exports.createClient = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { name, cnpj, email, phone, address, area, notes, status, locations } = req.body;
    
    // Validações
    if (!name || !cnpj || !email) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nome, CNPJ e email são obrigatórios'
      });
    }
    
    if (!validateCNPJ(cnpj)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'CNPJ inválido'
      });
    }
    
    if (!validateEmail(email)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }
    
    // Verificar email duplicado
    const existingUser = await User.findOne({
      where: { email },
      transaction: t
    });
    
    if (existingUser) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }
    
    // Criar usuário
    const newUser = await User.create({
      email,
      password_hash: '$2y$10$defaulthash',
      user_type: 'client',
      full_name: name,
      phone: phone || null,
      is_active: status === 'active'
    }, { transaction: t });
    
    // Criar cliente
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    const newClient = await Client.create({
      user_id: newUser.user_id,
      main_company_name: name,
      main_cnpj: cleanCNPJ,
      notes: notes || null,
      is_active: status === 'active',
      contract_value: 0
    }, { transaction: t });
    
    // Criar endereços
    const locationsToCreate = locations && locations.length > 0 ? locations : [{
      name: 'Unidade Principal',
      address: address,
      area: area || 'centro',
      isPrimary: true
    }];
    
    for (const loc of locationsToCreate) {
      const areaRecord = await Area.findOne({
        where: { code: loc.area || 'centro' },
        transaction: t
      });
      
      await sequelize.query(`
        INSERT INTO client_addresses 
        (client_id, nickname, street, number, complement, neighborhood, city, state, zip_code, coordinates, area_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText('POINT(-46.6333 -23.5505)', 4326), ?)
      `, {
        replacements: [
          newClient.client_id,
          loc.name || 'Unidade Principal',
          loc.address.street || '',
          loc.address.number || '',
          loc.address.complement || '',
          loc.address.neighborhood || '',
          loc.address.city || '',
          loc.address.state || '',
          loc.address.zipCode || '',
          areaRecord?.area_id || null
        ],
        transaction: t
      });
    }
    
    await t.commit();
    
    console.log(`✅ Cliente criado: ${name} (ID: ${newClient.client_id})`);
    
    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: { id: newClient.client_id }
    });
    
  } catch (error) {
    await t.rollback();
    console.error('❌ Error creating client:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================================
// UPDATE CLIENT
// ============================================================================
exports.updateClient = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { name, cnpj, email, phone, notes, status, locations } = req.body;
    
    // Buscar cliente
    const client = await Client.findByPk(id, { transaction: t });
    
    if (!client) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    const user = await User.findByPk(client.user_id, { transaction: t });
    
    // Atualizar usuário
    await user.update({
      full_name: name,
      email,
      phone: phone || null,
      is_active: status === 'active'
    }, { transaction: t });
    
    // Atualizar cliente
    const cleanCNPJ = cnpj ? cnpj.replace(/\D/g, '') : null;
    await client.update({
      main_company_name: name,
      main_cnpj: cleanCNPJ,
      notes: notes || null,
      is_active: status === 'active'
    }, { transaction: t });
    
    // Atualizar endereços
    if (locations && locations.length > 0) {
      await sequelize.query('DELETE FROM client_addresses WHERE client_id = ?', {
        replacements: [id],
        transaction: t
      });
      
      for (const loc of locations) {
        const areaRecord = await Area.findOne({
          where: { code: loc.area || 'centro' },
          transaction: t
        });
        
        await sequelize.query(`
          INSERT INTO client_addresses 
          (client_id, nickname, street, number, complement, neighborhood, city, state, zip_code, coordinates, area_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText('POINT(-46.6333 -23.5505)', 4326), ?)
        `, {
          replacements: [
            id,
            loc.name || 'Unidade',
            loc.address.street || '',
            loc.address.number || '',
            loc.address.complement || '',
            loc.address.neighborhood || '',
            loc.address.city || '',
            loc.address.state || '',
            loc.address.zipCode || '',
            areaRecord?.area_id || null
          ],
          transaction: t
        });
      }
    }
    
    await t.commit();
    
    console.log(`✅ Cliente atualizado: ${name} (ID: ${id})`);
    
    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso'
    });
    
  } catch (error) {
    await t.rollback();
    console.error('❌ Error updating client:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================================
// TOGGLE STATUS
// ============================================================================
exports.toggleClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    const user = await User.findByPk(client.user_id);
    const newStatus = !client.is_active;
    
    await client.update({ is_active: newStatus });
    await user.update({ is_active: newStatus });
    
    console.log(`✅ Status alterado: Cliente ID ${id} → ${newStatus ? 'ATIVO' : 'INATIVO'}`);
    
    res.json({
      success: true,
      message: `Cliente ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
      data: { status: newStatus ? 'active' : 'inactive' }
    });
    
  } catch (error) {
    console.error('❌ Error toggling status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar status',
      error: error.message
    });
  }
};

// ============================================================================
// DELETE CLIENT
// ============================================================================
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    const user = await User.findByPk(client.user_id);
    
    // Deletar usuário (CASCADE deleta cliente e endereços)
    await user.destroy();
    
    console.log(`✅ Cliente excluído: ID ${id}`);
    
    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir cliente',
      error: error.message
    });
  }
};