const { models, sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

// ========================================================================
// 1. LISTAGEM DE CLIENTES (GET /api/clients) - VERSÃO COMPLETA
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

    // 2. Busca no Banco
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
          include: [{ model: models.users, as: 'user', required: false }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // 3. Formatação para o Frontend
    const formattedData = rows.map(company => {
      const mainBranch = company.client_branches?.find(b => b.is_main_branch) || company.client_branches?.[0];
      const primaryContact = company.client_users?.find(u => u.is_primary_contact)?.user || company.client_users?.[0]?.user;

      // CORREÇÃO AQUI: Incluir os novos campos no mapeamento
      const locations = company.client_branches?.map(branch => {
        // SE FOR A MATRIZ, PEGA OS DADOS DA EMPRESA SE OS CAMPOS ESTIVEREM VAZIOS
        const isMainBranch = branch.is_main_branch;
        
        return {
          id: branch.branch_id,
          name: branch.name,
          // Para a matriz, prioriza os dados da filial, mas usa da empresa se estiver vazio
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

      return {
        id: company.company_id,
        name: company.name,
        cnpj: company.cnpj,
        email: primaryContact?.email || company.main_email || '-',
        phone: primaryContact?.phone || company.main_phone || '-',
        status: company.is_active ? 'active' : 'inactive',
        notes: company.notes,
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
        locations: locations, // AGORA COM OS CAMPOS NOVOS E DADOS DA EMPRESA PARA A MATRIZ
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
            attributes: ['user_id', 'full_name', 'email', 'role_key'] 
          }]
        }
      ]
    });

    if (!company) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const mainBranch = company.client_branches?.find(b => b.is_main_branch) || company.client_branches?.[0];
    const primaryContact = company.client_users?.find(u => u.is_primary_contact)?.user || company.client_users?.[0]?.user;

    // CORREÇÃO AQUI TAMBÉM
    const locations = company.client_branches?.map(branch => {
      const isMainBranch = branch.is_main_branch;
      
      return {
        id: branch.branch_id,
        name: branch.name,
        // Para a matriz, usa dados da empresa se a filial não tiver
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
      email: primaryContact?.email || company.main_email || '-',
      phone: primaryContact?.phone || company.main_phone || '-',
      status: company.is_active ? 'active' : 'inactive',
      notes: company.notes,
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
      locations: locations,
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
        email: email,           
        phone: phone,          
        cnpj: cnpj,
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
exports.updateClientLocation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, locationId } = req.params;
    const data = req.body;
    const addr = data.address || {};

    const branch = await models.client_branches.findOne({ 
      where: { branch_id: locationId, company_id: id }, 
      transaction: t 
    });
    
    if (!branch) { 
      await t.rollback(); 
      return res.status(404).json({ message: 'Filial não encontrada.' }); 
    }

    const isMainBranch = branch.is_main_branch;
    const willBeMainBranch = data.isPrimary === true || data.isPrimary === "true" || data.isPrimary === 1;

    // SE É OU VAI SER MATRIZ, SINCRONIZA COM A EMPRESA
    if (isMainBranch || willBeMainBranch) {
      // Atualiza a empresa com os dados da filial (se for matriz)
      await models.companies.update({
        main_email: data.email || branch.email,
        main_phone: data.phone || branch.phone,
        cnpj: data.cnpj || branch.cnpj
      }, { 
        where: { company_id: id }, 
        transaction: t 
      });
    }

    // SE VAI TORNAR-SE MATRIZ, DESMARCA OUTRAS
    if (willBeMainBranch && !isMainBranch) {
      await models.client_branches.update({ 
        is_main_branch: false 
      }, { 
        where: { company_id: id }, 
        transaction: t 
      });
    }

    // Atualiza a filial
    await branch.update({
      name: data.name,
      email: data.email,
      phone: data.phone,
      cnpj: data.cnpj,
      area: data.area,
      is_main_branch: willBeMainBranch,
      street: addr.street,
      number: addr.number,
      complement: addr.complement,
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
      zip_code: addr.zipCode
    }, { transaction: t });
    
    await t.commit();
    res.json({ message: 'Filial atualizada com sucesso.' });
  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'atualizar filial');
  }
};

// ========================================================================
// 5. GESTÃO DE LOCAIS / FILIAIS (POST /api/clients/:id/locations)
// ========================================================================
// exports.addClientLocation = async (req, res) => {
//   try {
//     const { id } = req.params; // company_id
//     const { name, street, number, neighborhood, city, state, zip_code } = req.body;

//     const newBranch = await models.client_branches.create({
//       company_id: id,
//       name: name || `${street}, ${number}`, // Nome automático se não vier
//       street, number, neighborhood, city, state, zip_code,
//       is_main_branch: false
//     });

//     res.status(201).json(newBranch);

//   } catch (error) {
//     handleDatabaseError(res, error, 'adicionar local');
//   }
// };

// ========================================================================
// 6. GESTÃO DE FILIAIS E STATUS
// ========================================================================

exports.addClientLocation = async (req, res) => {
  const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const data = req.body; 
      const addr = data.address || {};

      if (data.isPrimary) {
         await models.client_branches.update({ is_main_branch: false }, { where: { company_id: id }, transaction: t });
         
         // SE VIROU MATRIZ, ATUALIZA A EMPRESA PAI TAMBÉM
         await models.companies.update({
             main_email: data.email,
             main_phone: data.phone,
             cnpj: data.cnpj
         }, { where: { company_id: id }, transaction: t });
      }

      const newBranch = await models.client_branches.create({
        company_id: id,
        name: data.name,
        email: data.email, // Novo
        phone: data.phone, // Novo
        cnpj: data.cnpj,   // Novo
        street: addr.street,
        number: addr.number,
        complement: addr.complement,
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        zip_code: addr.zipCode,
        area: data.area || 'centro',
        is_main_branch: data.isPrimary || false,
        is_active: true
      }, { transaction: t });

      await t.commit();
      return res.status(201).json(newBranch);
    } catch (error) {
      await t.rollback();
      handleDatabaseError(res, error, 'adicionar filial');
    }
  },

exports.updateClientLocation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
      const { id, locationId } = req.params;
      const data = req.body;
      const addr = data.address || {};

      console.log("🔍 DEBUG - Iniciando atualização de filial");
      console.log("🔍 DEBUG - company_id:", id);
      console.log("🔍 DEBUG - branch_id:", locationId);
      console.log("🔍 DEBUG - isPrimary recebido:", data.isPrimary);
      console.log("🔍 DEBUG - Tipo de isPrimary:", typeof data.isPrimary);

      const branch = await models.client_branches.findOne({ 
        where: { branch_id: locationId, company_id: id }, 
        transaction: t 
      });
      
      if (!branch) { 
        await t.rollback(); 
        return res.status(404).json({ message: 'Filial não encontrada.' }); 
      }

      // VERIFICAÇÃO IMPORTANTE: data.isPrimary pode vir como string "true"
      const isPrimary = data.isPrimary === true || data.isPrimary === "true" || data.isPrimary === 1;
      
      console.log("🔍 DEBUG - isPrimary após conversão:", isPrimary);

      if (isPrimary) {
        console.log("🔄 DEBUG - Marcando como PRINCIPAL - Iniciando troca");
        
        // 1. Desmarca todas as outras filiais
        const result = await models.client_branches.update({ 
          is_main_branch: false 
        }, { 
          where: { company_id: id }, 
          transaction: t 
        });
        
        console.log("🔄 DEBUG - Filiais desmarcadas:", result[0]);
        
        // 2. Sincroniza empresa pai
        const companyUpdate = await models.companies.update({
          main_email: data.email,
          main_phone: data.phone,
          cnpj: data.cnpj
        }, { 
          where: { company_id: id }, 
          transaction: t 
        });
        
        console.log("🔄 DEBUG - Empresa atualizada:", companyUpdate[0]);
      }

      console.log("🔍 DEBUG - Atualizando dados da filial...");
      
      await branch.update({
         name: data.name,
         email: data.email, // Novo
         phone: data.phone, // Novo
         cnpj: data.cnpj,   // Novo
         area: data.area,
         is_main_branch: isPrimary, // Usa o valor convertido
         street: addr.street,
         number: addr.number,
         complement: addr.complement,
         neighborhood: addr.neighborhood,
         city: addr.city,
         state: addr.state,
         zip_code: addr.zipCode
      }, { transaction: t });
      
      await t.commit();
      console.log("✅ DEBUG - Transação commitada com sucesso");
      
      res.json({ message: 'Filial atualizada com sucesso.' });
  } catch (error) {
      await t.rollback();
      console.error("❌ DEBUG - Erro na transação:", error);
      handleDatabaseError(res, error, 'atualizar filial');
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