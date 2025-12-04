const { models, sequelize } = require('../database/connection');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

// ========================================================================
// 1. LISTAGEM DE CLIENTES (GET /api/clients) - VERSÃO COMPLETA
// Agora retorna Notes e Locations para a visualização funcionar
// ========================================================================
exports.getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // 1. Filtros
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { cnpj: { [Op.like]: `%${search}%` } }
      ];
    }

    // 2. Busca no Banco (Trazendo TUDO: Filiais e Usuários)
    const { count, rows } = await models.companies.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: models.client_branches,
          as: 'client_branches',
          required: false 
        },
        {
          model: models.client_users,
          as: 'client_users',
          required: false,
          include: [{ model: models.users, as: 'user', required: false }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // 3. Formatação para o Frontend (O SEGREDO ESTÁ AQUI)
    const formattedData = rows.map(company => {
      // Acha a matriz e o contato principal
      const mainBranch = company.client_branches?.find(b => b.is_main_branch) || company.client_branches?.[0];
      const primaryContact = company.client_users?.find(u => u.is_primary_contact)?.user || company.client_users?.[0]?.user;

      // Mapeia TODAS as filiais para o formato que o Frontend espera (ClientLocation[])
      const locations = company.client_branches?.map(branch => ({
        id: branch.branch_id, // O ID real do banco
        name: branch.name,
        area: branch.area || 'centro', // Fallback se estiver null
        isPrimary: branch.is_main_branch,
        address: {
            street: branch.street,
            number: branch.number,
            complement: branch.complement,
            neighborhood: branch.neighborhood,
            city: branch.city,
            state: branch.state,
            zipCode: branch.zip_code // Backend (snake) -> Frontend (camel)
        }
      })) || [];

      return {
        id: company.company_id,
        name: company.name,
        cnpj: company.cnpj,
        email: primaryContact?.email || company.main_email || '-',
        phone: primaryContact?.phone || company.main_phone || '-',
        status: company.is_active ? 'active' : 'inactive',
        
        // Campo que estava faltando:
        notes: company.notes, 

        // Objeto de endereço principal (da Matriz)
        address: {
            street: mainBranch?.street || '',
            number: mainBranch?.number || '',
            complement: mainBranch?.complement || '',
            neighborhood: mainBranch?.neighborhood || '',
            city: mainBranch?.city || '',
            state: mainBranch?.state || '',
            zipCode: mainBranch?.zip_code || '' 
        },

        // Lista completa de unidades para o Modal de Visualização
        locations: locations,

        // Campos calculados (Mockados por enquanto)
        servicesActive: 0,
        servicesCompleted: 0,
        lastService: '-',
        rating: 0,
        totalValue: 'R$ 0,00',
        createdAt: company.created_at
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
        // Todas as filiais
        { model: models.client_branches, as: 'client_branches' },
        // Todos os usuários vinculados
        { 
          model: models.client_users, 
          as: 'client_users',
          include: [{ model: models.users, as: 'user', attributes: ['user_id', 'full_name', 'email', 'role_key'] }]
        }
      ]
    });

    if (!company) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(company);

  } catch (error) {
    handleDatabaseError(res, error, 'buscar detalhes do cliente');
  }
};

// ========================================================================
// 3. CRIAR CLIENTE (POST /api/clients) - VERSÃO FINAL COM NOTES E ÁREA
// ========================================================================
exports.createClient = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // 1. Agora extraímos TAMBÉM 'notes' e 'area' do corpo da requisição
    const { name, legal_name, cnpj, email, phone, address, locations, notes, area } = req.body;

    // 2. Cria a Empresa (Incluindo notes e main_area)
    const newCompany = await models.companies.create({
      name,
      legal_name,
      cnpj,
      main_email: email,
      main_phone: phone,
      notes: notes,          // <--- AGORA SALVA AS OBSERVAÇÕES
      main_area: area,       // <--- AGORA SALVA A ÁREA PRINCIPAL
      is_active: true
    }, { transaction: t });

    // 3. Cria a Filial Matriz (Principal)
    if (address) {
      await models.client_branches.create({
        company_id: newCompany.company_id,
        name: 'Matriz',
        is_main_branch: true,
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        area: area // <--- SALVA A ÁREA NA FILIAL MATRIZ TAMBÉM
      }, { transaction: t });
    }

    // 4. Cria as Filiais Adicionais (Loop)
    if (locations && Array.isArray(locations) && locations.length > 0) {
      for (const loc of locations) {
        if (loc.address && loc.address.street) {
            await models.client_branches.create({
              company_id: newCompany.company_id,
              name: loc.name || 'Filial',
              is_main_branch: false,
              street: loc.address.street,
              number: loc.address.number,
              complement: loc.address.complement,
              neighborhood: loc.address.neighborhood,
              city: loc.address.city,
              state: loc.address.state,
              zip_code: loc.address.zipCode || loc.address.zip_code,
              area: loc.area // <--- SALVA A ÁREA DA FILIAL ESPECÍFICA
            }, { transaction: t });
        }
      }
    }

    await t.commit();
    
    res.status(201).json({ 
      success: true, 
      message: 'Cliente completo criado com sucesso', 
      data: { id: newCompany.company_id } 
    });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'criar cliente');
  }
};

// ========================================================================
// 4. ATUALIZAR CLIENTE (PUT /api/clients/:id)
// Atualiza Empresa + Obs + Área + Endereço Principal + FILIAIS (Loop Inteligente)
// ========================================================================
exports.updateClient = async (req, res) => {
  const t = await sequelize.transaction(); 
  try {
    const { id } = req.params;
    // locations: Array de filiais que vem do frontend
    const { name, legal_name, cnpj, email, phone, notes, area, address, locations } = req.body;

    // 1. Atualiza dados da Empresa (Se vierem no body)
    // Verificamos se 'name' existe para evitar zerar dados caso o front mande só locations
    if (name) {
        const [updated] = await models.companies.update({
          name, 
          legal_name, 
          cnpj, 
          main_phone: phone, 
          main_email: email,
          notes: notes,       
          main_area: area     
        }, {
          where: { company_id: id },
          transaction: t
        });

        if (!updated && !locations) { // Se não atualizou empresa e não tem locations, erro
            await t.rollback();
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }
    }

    // 2. Atualiza o Endereço da Matriz (Se vier no body)
    if (address) {
        await models.client_branches.update({
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            zip_code: address.zip_code || address.zipCode, 
            area: area 
        }, {
            where: { 
                company_id: id,
                is_main_branch: true 
            },
            transaction: t
        });
    }

    // 3. (NOVO) Atualiza ou Cria Filiais Adicionais
    if (locations && Array.isArray(locations)) {
      for (const loc of locations) {
        // Dados da filial formatados para o banco
        const branchData = {
            name: loc.name,
            street: loc.address.street,
            number: loc.address.number,
            complement: loc.address.complement,
            neighborhood: loc.address.neighborhood,
            city: loc.address.city,
            state: loc.address.state,
            zip_code: loc.address.zipCode || loc.address.zip_code,
            area: loc.area,
            is_main_branch: loc.isPrimary || false
        };

        // LÓGICA INTELIGENTE:
        // Se o ID for uma string que começa com 'temp' ou 'loc-' (gerado pelo front), é CRIAÇÃO.
        // Se o ID for um número (ou string numérica do banco), é ATUALIZAÇÃO.
        const isNew = String(loc.id).startsWith('temp') || String(loc.id).startsWith('loc-');

        if (isNew) {
            // CREATE
            await models.client_branches.create({
                company_id: id,
                ...branchData
            }, { transaction: t });
        } else {
            // UPDATE
            await models.client_branches.update(branchData, {
                where: { branch_id: loc.id, company_id: id }, // Garante segurança
                transaction: t
            });
        }
      }
    }

    await t.commit();
    res.json({ success: true, message: 'Dados atualizados com sucesso' });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'atualizar cliente');
  }
};
// ========================================================================
// 5. GESTÃO DE LOCAIS / FILIAIS (POST /api/clients/:id/locations)
// ========================================================================
exports.addClientLocation = async (req, res) => {
  try {
    const { id } = req.params; // company_id
    const { name, street, number, neighborhood, city, state, zip_code } = req.body;

    const newBranch = await models.client_branches.create({
      company_id: id,
      name: name || `${street}, ${number}`, // Nome automático se não vier
      street, number, neighborhood, city, state, zip_code,
      is_main_branch: false
    });

    res.status(201).json(newBranch);

  } catch (error) {
    handleDatabaseError(res, error, 'adicionar local');
  }
};

// DELETE /api/clients/:id/locations/:locationId
exports.removeClientLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    
    // Não pode deletar a Matriz
    const branch = await models.client_branches.findByPk(locationId);
    if(branch && branch.is_main_branch) {
        return res.status(400).json({ message: 'Não é possível remover a filial Matriz.' });
    }

    await models.client_branches.destroy({ where: { branch_id: locationId } });
    res.json({ success: true, message: 'Local removido' });

  } catch (error) {
    handleDatabaseError(res, error, 'remover local');
  }
};

// DELETE /api/clients/:id
exports.deleteClient = async (req, res) => {
  // Inicia uma transação para garantir que apaga tudo ou nada
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Tentando excluir cliente ID: ${id}`);

    // 1. Apaga Filiais (Branches)
    await models.client_branches.destroy({ 
        where: { company_id: id }, 
        transaction: t 
    });

    // 2. Apaga Vínculos de Usuários (Client Users)
    // Se o seu model se chama 'client_users' e a chave 'client_id' ou 'company_id'
    // Verifique no seu init-models.js qual o nome correto da chave estrangeira!
    // No script que fizemos, era 'company_id' na tabela 'client_users'
    await models.client_users.destroy({ 
        where: { company_id: id }, 
        transaction: t 
    });

    // 3. Apaga a Empresa (Company)
    const deleted = await models.companies.destroy({ 
        where: { company_id: id }, 
        transaction: t 
    });

    if (!deleted) {
        await t.rollback();
        return res.status(404).json({ message: 'Cliente não encontrado no banco.' });
    }

    await t.commit();
    console.log("✅ Cliente excluído com sucesso.");
    res.json({ message: 'Cliente excluído com sucesso' });

  } catch (error) {
    await t.rollback();
    console.error("❌ Erro ao excluir:", error);
    handleDatabaseError(res, error, 'excluir cliente');
  }
};

// PATCH /api/clients/:id/toggle-status
exports.toggleClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Busca o cliente atual
    const client = await models.companies.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Inverte o status
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