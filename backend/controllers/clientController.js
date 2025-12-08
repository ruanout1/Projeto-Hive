// backend\controllers\clientController.js - VERSÃO COMPLETA E CORRIGIDA

const { models, sequelize } = require('../database/connection');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

// ========================================================================
// 1. LISTAGEM DE CLIENTES (GET /api/clients) - COMPLETA
// ========================================================================
exports.getClients = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const offset = (page - 1) * limit;

    // Filtros
    const whereClause = {};
    
    // Filtro por status
    if (status && status !== 'todos') {
      whereClause.is_active = status === 'active';
    }
    
    // Filtro por busca
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { legal_name: { [Op.like]: `%${search}%` } },
        { cnpj: { [Op.like]: `%${search}%` } },
        { main_email: { [Op.like]: `%${search}%` } },
        { main_phone: { [Op.like]: `%${search}%` } }
      ];
    }

    // Busca com relacionamentos
    const { count, rows } = await models.companies.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: models.client_branches,
          as: 'client_branches',
          required: false,
          attributes: [
            'branch_id', 'name', 'email', 'phone', 'cnpj', 'area', 
            'is_main_branch', 'street', 'number', 'complement', 
            'neighborhood', 'city', 'state', 'zip_code'
          ]
        },
        {
          model: models.client_users,
          as: 'client_users',
          required: false,
          include: [{ 
            model: models.users, 
            as: 'user', 
            attributes: ['user_id', 'full_name', 'email', 'phone'] 
          }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // Formatação para o frontend
    const formattedData = rows.map(company => {
      const mainBranch = company.client_branches?.find(b => b.is_main_branch) || company.client_branches?.[0];
      
      // Localizações formatadas
      const locations = company.client_branches?.map(branch => {
        const isMainBranch = branch.is_main_branch;
        
        return {
          id: branch.branch_id.toString(),
          name: branch.name,
          email: branch.email || (isMainBranch ? company.main_email : '') || '',
          phone: branch.phone || (isMainBranch ? company.main_phone : '') || '',
          cnpj: branch.cnpj || (isMainBranch ? company.cnpj : '') || '',
          area: branch.area || 'centro',
          isPrimary: isMainBranch,
          address: {
            street: branch.street,
            number: branch.number,
            complement: branch.complement,
            neighborhood: branch.neighborhood,
            city: branch.city,
            state: branch.state,
            zipCode: branch.zip_code
          }
        };
      }) || [];

      // Contato primário
      const primaryContact = company.client_users?.find(u => u.is_primary_contact)?.user || 
                            company.client_users?.[0]?.user;

      return {
        id: company.company_id,
        name: company.name,
        cnpj: company.cnpj,
        email: primaryContact?.email || company.main_email || '',
        phone: primaryContact?.phone || company.main_phone || '',
        status: company.is_active ? 'active' : 'inactive',
        notes: company.notes || '',
        address: {
          street: mainBranch?.street || '',
          number: mainBranch?.number || '',
          complement: mainBranch?.complement || '',
          neighborhood: mainBranch?.neighborhood || '',
          city: mainBranch?.city || '',
          state: mainBranch?.state || '',
          zipCode: mainBranch?.zip_code || ''
        },
        area: company.main_area || 'centro',
        locations,
        servicesActive: 0, // TODO: Integrar com serviços
        servicesCompleted: 0, // TODO: Integrar com serviços
        lastService: '-', // TODO: Integrar com serviços
        rating: 0, // TODO: Integrar com avaliações
        totalValue: 'R$ 0,00', // TODO: Integrar com finanças
        createdAt: company.created_at ? new Date(company.created_at).toISOString().split('T')[0] : ''
      };
    });

    res.json({
      clients: formattedData,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });

  } catch (error) {
    handleDatabaseError(res, error, 'buscar clientes');
  }
};

// ========================================================================
// 2. DETALHES DO CLIENTE (GET /api/clients/:id)
// ========================================================================
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await models.companies.findByPk(id, {
      include: [
        { 
          model: models.client_branches, 
          as: 'client_branches',
          attributes: [
            'branch_id', 'name', 'email', 'phone', 'cnpj', 'area', 
            'is_main_branch', 'street', 'number', 'complement', 
            'neighborhood', 'city', 'state', 'zip_code'
          ]
        },
        { 
          model: models.client_users, 
          as: 'client_users',
          include: [{ 
            model: models.users, 
            as: 'user', 
            attributes: ['user_id', 'full_name', 'email', 'phone'] 
          }]
        }
      ]
    });

    if (!company) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const mainBranch = company.client_branches?.find(b => b.is_main_branch) || company.client_branches?.[0];
    const primaryContact = company.client_users?.find(u => u.is_primary_contact)?.user || company.client_users?.[0]?.user;

    const locations = company.client_branches?.map(branch => {
      const isMainBranch = branch.is_main_branch;
      
      return {
        id: branch.branch_id.toString(),
        name: branch.name,
        email: branch.email || (isMainBranch ? company.main_email : '') || '',
        phone: branch.phone || (isMainBranch ? company.main_phone : '') || '',
        cnpj: branch.cnpj || (isMainBranch ? company.cnpj : '') || '',
        area: branch.area || 'centro',
        isPrimary: isMainBranch,
        address: {
          street: branch.street,
          number: branch.number,
          complement: branch.complement,
          neighborhood: branch.neighborhood,
          city: branch.city,
          state: branch.state,
          zipCode: branch.zip_code
        }
      };
    }) || [];

    const formattedCompany = {
      id: company.company_id,
      name: company.name,
      cnpj: company.cnpj,
      email: primaryContact?.email || company.main_email || '',
      phone: primaryContact?.phone || company.main_phone || '',
      status: company.is_active ? 'active' : 'inactive',
      notes: company.notes || '',
      address: {
        street: mainBranch?.street || '',
        number: mainBranch?.number || '',
        complement: mainBranch?.complement || '',
        neighborhood: mainBranch?.neighborhood || '',
        city: mainBranch?.city || '',
        state: mainBranch?.state || '',
        zipCode: mainBranch?.zip_code || ''
      },
      area: company.main_area || 'centro',
      locations,
      servicesActive: 0,
      servicesCompleted: 0,
      lastService: '-',
      rating: 0,
      totalValue: 'R$ 0,00',
      createdAt: company.created_at
    };

    res.json(formattedCompany);

  } catch (error) {
    handleDatabaseError(res, error, 'buscar detalhes do cliente');
  }
};

// ========================================================================
// 3. CRIAR CLIENTE (POST /api/clients) - COMPLETA
// ========================================================================
exports.createClient = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      name, 
      cnpj, 
      email, 
      phone, 
      address, 
      locations = [], 
      notes = '', 
      area = 'centro', 
      status = 'active' 
    } = req.body;

    // Validações básicas
    if (!name || !cnpj || !email) {
      await t.rollback();
      return res.status(400).json({ 
        message: 'Nome, CNPJ e email são obrigatórios' 
      });
    }

    // Verifica se CNPJ já existe
    const existingCompany = await models.companies.findOne({
      where: { cnpj },
      transaction: t
    });

    if (existingCompany) {
      await t.rollback();
      return res.status(400).json({ 
        message: 'CNPJ já cadastrado no sistema' 
      });
    }

    // Cria a empresa
    const newCompany = await models.companies.create({
      name,
      legal_name: name,
      cnpj,
      main_email: email,
      main_phone: phone,
      notes,
      main_area: area,
      is_active: status === 'active'
    }, { transaction: t });

    // Cria a filial matriz (com endereço principal)
    if (address && address.street) {
      await models.client_branches.create({
        company_id: newCompany.company_id,
        name: 'Matriz',
        is_main_branch: true,
        email: email,
        phone: phone,
        cnpj: cnpj,
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zip_code: address.zipCode || address.zip_code,
        area: area
      }, { transaction: t });
    }

    // Cria filiais adicionais se existirem
    if (Array.isArray(locations) && locations.length > 0) {
      for (const loc of locations) {
        if (loc.address && loc.address.street) {
          await models.client_branches.create({
            company_id: newCompany.company_id,
            name: loc.name || 'Filial',
            is_main_branch: loc.isPrimary || false,
            email: loc.email || '',
            phone: loc.phone || '',
            cnpj: loc.cnpj || '',
            street: loc.address.street,
            number: loc.address.number,
            complement: loc.address.complement || '',
            neighborhood: loc.address.neighborhood,
            city: loc.address.city,
            state: loc.address.state,
            zip_code: loc.address.zipCode || loc.address.zip_code || '',
            area: loc.area || 'centro'
          }, { transaction: t });
        }
      }
    }

    await t.commit();
    
    res.status(201).json({ 
      success: true, 
      message: 'Cliente criado com sucesso', 
      clientId: newCompany.company_id 
    });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'criar cliente');
  }
};

// ========================================================================
// 4. ATUALIZAR CLIENTE (PUT /api/clients/:id) - NOVA FUNÇÃO
// ========================================================================
exports.updateClient = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { 
      name, 
      cnpj, 
      email, 
      phone, 
      address, 
      notes = '', 
      area = 'centro', 
      status = 'active' 
    } = req.body;

    // Busca o cliente existente
    const company = await models.companies.findByPk(id, { transaction: t });
    
    if (!company) {
      await t.rollback();
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Verifica se CNPJ mudou e já existe
    if (cnpj && cnpj !== company.cnpj) {
      const existingWithCNPJ = await models.companies.findOne({
        where: { cnpj },
        transaction: t
      });
      
      if (existingWithCNPJ) {
        await t.rollback();
        return res.status(400).json({ message: 'CNPJ já cadastrado para outro cliente' });
      }
    }

    // Atualiza os dados da empresa
    await company.update({
      name,
      legal_name: name,
      cnpj: cnpj || company.cnpj,
      main_email: email || company.main_email,
      main_phone: phone || company.main_phone,
      notes,
      main_area: area,
      is_active: status === 'active'
    }, { transaction: t });

    // Atualiza a filial matriz (endereço principal)
    if (address && address.street) {
      const mainBranch = await models.client_branches.findOne({
        where: { 
          company_id: id, 
          is_main_branch: true 
        },
        transaction: t
      });

      if (mainBranch) {
        await mainBranch.update({
          street: address.street,
          number: address.number,
          complement: address.complement || '',
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zip_code: address.zipCode || address.zip_code,
          area: area
        }, { transaction: t });
      } else {
        // Se não existe matriz, cria uma
        await models.client_branches.create({
          company_id: id,
          name: 'Matriz',
          is_main_branch: true,
          email: email || company.main_email,
          phone: phone || company.main_phone,
          cnpj: cnpj || company.cnpj,
          street: address.street,
          number: address.number,
          complement: address.complement || '',
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zip_code: address.zipCode || address.zip_code,
          area: area
        }, { transaction: t });
      }
    }

    await t.commit();
    
    res.json({ 
      success: true, 
      message: 'Cliente atualizado com sucesso' 
    });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'atualizar cliente');
  }
};

// ========================================================================
// 5. ADICIONAR FILIAL (POST /api/clients/:id/locations)
// ========================================================================
exports.addClientLocation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const data = req.body;
    const addr = data.address || {};

    // Validações
    if (!data.name || !addr.street || !addr.number) {
      await t.rollback();
      return res.status(400).json({ 
        message: 'Nome, rua e número são obrigatórios' 
      });
    }

    // Se vai ser marcada como principal, desmarca as outras
    const isPrimary = Boolean(data.isPrimary);
    
    if (isPrimary) {
      await models.client_branches.update(
        { is_main_branch: false }, 
        { where: { company_id: id }, transaction: t }
      );
      
      // Sincroniza com empresa pai
      await models.companies.update({
        main_email: data.email || '',
        main_phone: data.phone || '',
        cnpj: data.cnpj || ''
      }, { 
        where: { company_id: id }, 
        transaction: t 
      });
    }

    // Cria a nova filial
    const newBranch = await models.client_branches.create({
      company_id: id,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      cnpj: data.cnpj || '',
      street: addr.street,
      number: addr.number,
      complement: addr.complement || '',
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
      zip_code: addr.zipCode || addr.zip_code || '',
      area: data.area || 'centro',
      is_main_branch: isPrimary,
      is_active: true
    }, { transaction: t });

    await t.commit();
    
    res.status(201).json({
      success: true,
      message: 'Filial adicionada com sucesso',
      location: {
        id: newBranch.branch_id.toString(),
        name: newBranch.name,
        email: newBranch.email,
        phone: newBranch.phone,
        cnpj: newBranch.cnpj,
        area: newBranch.area,
        isPrimary: newBranch.is_main_branch,
        address: {
          street: newBranch.street,
          number: newBranch.number,
          complement: newBranch.complement,
          neighborhood: newBranch.neighborhood,
          city: newBranch.city,
          state: newBranch.state,
          zipCode: newBranch.zip_code
        }
      }
    });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'adicionar filial');
  }
};

// ========================================================================
// 6. ATUALIZAR FILIAL (PUT /api/clients/:id/locations/:locationId)
// ========================================================================
exports.updateClientLocation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, locationId } = req.params;
    const data = req.body;
    const addr = data.address || {};

    // Busca a filial
    const branch = await models.client_branches.findOne({ 
      where: { 
        branch_id: locationId, 
        company_id: id 
      }, 
      transaction: t 
    });
    
    if (!branch) { 
      await t.rollback(); 
      return res.status(404).json({ 
        message: 'Filial não encontrada' 
      }); 
    }

    // Determina se será principal
    const isPrimary = data.isPrimary === true || 
                     data.isPrimary === "true" || 
                     data.isPrimary === 1;

    const wasMainBranch = branch.is_main_branch;

    // Se vai se tornar principal, desmarca as outras
    if (isPrimary && !wasMainBranch) {
      await models.client_branches.update(
        { is_main_branch: false }, 
        { where: { company_id: id }, transaction: t }
      );
      
      // Sincroniza com empresa pai
      await models.companies.update({
        main_email: data.email || branch.email,
        main_phone: data.phone || branch.phone,
        cnpj: data.cnpj || branch.cnpj
      }, { 
        where: { company_id: id }, 
        transaction: t 
      });
    }

    // Atualiza a filial
    await branch.update({
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      cnpj: data.cnpj || '',
      area: data.area || branch.area,
      is_main_branch: isPrimary,
      street: addr.street,
      number: addr.number,
      complement: addr.complement || '',
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
      zip_code: addr.zipCode || addr.zip_code || branch.zip_code
    }, { transaction: t });
    
    await t.commit();
    
    res.json({ 
      success: true, 
      message: 'Filial atualizada com sucesso' 
    });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'atualizar filial');
  }
};

// ========================================================================
// 7. REMOVER FILIAL (DELETE /api/clients/:id/locations/:locationId)
// ========================================================================
exports.removeClientLocation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { locationId } = req.params;
    
    // Verifica se é a matriz
    const branch = await models.client_branches.findByPk(locationId, { transaction: t });
    
    if (!branch) {
      await t.rollback();
      return res.status(404).json({ 
        message: 'Filial não encontrada' 
      });
    }

    if (branch.is_main_branch) {
      await t.rollback();
      return res.status(400).json({ 
        message: 'Não é possível remover a filial matriz' 
      });
    }

    // Remove a filial
    await branch.destroy({ transaction: t });
    
    await t.commit();
    
    res.json({ 
      success: true, 
      message: 'Filial removida com sucesso' 
    });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'remover filial');
  }
};

// ========================================================================
// 8. EXCLUIR CLIENTE (DELETE /api/clients/:id)
// ========================================================================
exports.deleteClient = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    // Verifica se o cliente existe
    const company = await models.companies.findByPk(id, { transaction: t });
    if (!company) {
      await t.rollback();
      return res.status(404).json({ 
        message: 'Cliente não encontrado' 
      });
    }

    // Remove filiais primeiro
    await models.client_branches.destroy({ 
      where: { company_id: id }, 
      transaction: t 
    });

    // Remove vínculos com usuários
    await models.client_users.destroy({ 
      where: { company_id: id }, 
      transaction: t 
    });

    // Remove o cliente
    await company.destroy({ transaction: t });

    await t.commit();
    
    res.json({ 
      success: true, 
      message: 'Cliente excluído com sucesso' 
    });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'excluir cliente');
  }
};

// ========================================================================
// 9. ALTERAR STATUS (PATCH /api/clients/:id/toggle-status)
// ========================================================================
exports.toggleClientStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await models.companies.findByPk(id);
    if (!client) {
      return res.status(404).json({ 
        message: 'Cliente não encontrado' 
      });
    }

    const newStatus = !client.is_active;
    
    await client.update({ is_active: newStatus });

    res.json({
      success: true,
      message: `Cliente ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
      is_active: newStatus
    });

  } catch (error) {
    handleDatabaseError(res, error, 'alterar status cliente');
  }
};

// ========================================================================
// 10. MINHAS FILIAIS (GET /api/clients/my-branches)
// ========================================================================
exports.getMyBranches = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;

    const clientUser = await models.client_users.findOne({
      where: { user_id: userId }
    });

    if (!clientUser) {
      return res.status(404).json({ 
        message: 'Usuário não vinculado a nenhuma empresa' 
      });
    }

    const branches = await models.client_branches.findAll({
      where: {
        company_id: clientUser.company_id,
        is_active: true
      },
      order: [
        ['is_main_branch', 'DESC'],
        ['name', 'ASC']
      ]
    });

    const formattedBranches = branches.map(branch => ({
      id: branch.branch_id.toString(),
      name: branch.name,
      email: branch.email,
      phone: branch.phone,
      cnpj: branch.cnpj,
      area: branch.area,
      isPrimary: branch.is_main_branch,
      address: {
        street: branch.street,
        number: branch.number,
        complement: branch.complement,
        neighborhood: branch.neighborhood,
        city: branch.city,
        state: branch.state,
        zipCode: branch.zip_code
      }
    }));

    res.json(formattedBranches);

  } catch (error) {
    handleDatabaseError(res, error, 'buscar minhas filiais');
  }
};