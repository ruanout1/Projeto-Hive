const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize, User, Team, TeamMember, Collaborator, ClientUser } = require('../database/db');

// ==========================================
// OBTER TODOS OS USUÁRIOS (Gestores e Colaboradores)
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        user_type: {
          [Op.in]: ['manager', 'collaborator']
        }
      },
      attributes: [
        'user_id',
        'full_name',
        'email',
        'phone',
        'user_type',
        'is_active',
        'created_at',
        'last_login'
      ],
      include: [
        {
          model: Collaborator,
          as: 'collaboratorDetails',
          attributes: ['position'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Formatar para o frontend
    const formattedUsers = await Promise.all(users.map(async (user) => {
      const userJson = user.toJSON();
      
      // Formatar role
      const role = userJson.user_type === 'manager' ? 'gestor' : 'colaborador';
      
      // Formatar status
      const status = userJson.is_active ? 'active' : 'inactive';
      
      // Formatar data de criação
      const createdAt = new Date(userJson.created_at).toLocaleDateString('pt-BR');
      
      // Formatar último acesso
      let lastAccess = 'Nunca acessou';
      if (userJson.last_login) {
        const lastLoginDate = new Date(userJson.last_login);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLoginDate.toDateString() === today.toDateString()) {
          lastAccess = `Hoje às ${lastLoginDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (lastLoginDate.toDateString() === yesterday.toDateString()) {
          lastAccess = `Ontem às ${lastLoginDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          lastAccess = lastLoginDate.toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }
      
      // Buscar áreas se for gestor
      let areas = undefined;
      if (role === 'gestor') {
        const managerAreas = await ManagerArea.findAll({
          where: { manager_user_id: userJson.user_id },
          include: [{
            model: Area,
            as: 'area',
            attributes: ['name']
          }]
        });
        areas = managerAreas.map(ma => ma.area.name.toLowerCase());
      }
      
      return {
        id: userJson.user_id.toString(),
        name: userJson.full_name,
        email: userJson.email,
        phone: userJson.phone || '',
        role,
        position: userJson.collaboratorDetails?.position,
        areas,
        status,
        createdAt,
        lastAccess
      };
    }));

    res.json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários',
      error: error.message
    });
  }
};

// ==========================================
// CRIAR NOVO USUÁRIO
// ==========================================
exports.createUser = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { name, email, phone, role, position, team, areas, status } = req.body;

    // Validações
    if (!name || !email || !phone || !role) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando'
      });
    }

    if (role === 'colaborador' && !position) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cargo é obrigatório para colaboradores'
      });
    }

    if (role === 'gestor' && (!areas || areas.length === 0)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Áreas de responsabilidade são obrigatórias para gestores'
      });
    }

    // Verificar se email já existe
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

    // Senha padrão temporária
    const defaultPassword = 'Hive@2025';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Inserir usuário
    const userType = role === 'gestor' ? 'manager' : 'collaborator';
    const newUser = await User.create({
      email,
      password_hash: hashedPassword,
      user_type: userType,
      full_name: name,
      phone,
      is_active: status === 'active'
    }, { transaction: t });

    // Se for colaborador, inserir na tabela collaborators
    if (role === 'colaborador') {
      await Collaborator.create({
        user_id: newUser.user_id,
        position
      }, { transaction: t });
    }

    // Se for gestor, inserir áreas de responsabilidade
    if (role === 'gestor' && areas && areas.length > 0) {
      for (const areaName of areas) {
        const area = await Area.findOne({
          where: {
            name: {
              [Op.like]: areaName
            }
          },
          transaction: t
        });

        if (area) {
          await ManagerArea.create({
            manager_user_id: newUser.user_id,
            area_id: area.area_id
          }, { transaction: t });
        }
      }
    }

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        id: newUser.user_id,
        name,
        email,
        role,
        defaultPassword
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
};

// ==========================================
// ATUALIZAR USUÁRIO
// ==========================================
exports.updateUser = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { name, email, phone, role, position, team, areas, status } = req.body;

    // Verificar se usuário existe
    const user = await User.findByPk(id, { transaction: t });

    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualizar dados básicos
    const userType = role === 'gestor' ? 'manager' : 'collaborator';
    await user.update({
      full_name: name,
      email,
      phone,
      user_type: userType,
      is_active: status === 'active'
    }, { transaction: t });

    // Atualizar cargo se for colaborador
    if (role === 'colaborador' && position) {
      const collaborator = await Collaborator.findOne({
        where: { user_id: id },
        transaction: t
      });

      if (collaborator) {
        await collaborator.update({ position }, { transaction: t });
      } else {
        await Collaborator.create({
          user_id: id,
          position
        }, { transaction: t });
      }
    }

    // Atualizar áreas se for gestor
    if (role === 'gestor' && areas) {
      // Remover áreas antigas
      await ManagerArea.destroy({
        where: { manager_user_id: id },
        transaction: t
      });

      // Inserir novas áreas
      for (const areaName of areas) {
        const area = await Area.findOne({
          where: {
            name: {
              [Op.like]: areaName
            }
          },
          transaction: t
        });

        if (area) {
          await ManagerArea.create({
            manager_user_id: id,
            area_id: area.area_id
          }, { transaction: t });
        }
      }
    }

    await t.commit();

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });

  } catch (error) {
    await t.rollback();
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
};

// ==========================================
// DELETAR USUÁRIO
// ==========================================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário',
      error: error.message
    });
  }
};

// ==========================================
// ALTERNAR STATUS DO USUÁRIO (Ativar/Desativar)
// ==========================================
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const newStatus = !user.is_active;

    await user.update({ is_active: newStatus });

    res.json({
      success: true,
      message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
      data: { status: newStatus ? 'active' : 'inactive' }
    });

  } catch (error) {
    console.error('Erro ao alternar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alternar status do usuário',
      error: error.message
    });
  }
};

// ==========================================
// FUNÇÕES AUXILIARES (Mantidas do código original)
// ==========================================

// GET /api/users/managers (Lista gestores disponíveis para equipes)
exports.getAvailableManagers = async (req, res) => {
  try {
    const managers = await User.findAll({
      where: {
        user_type: 'manager', 
        is_active: true
      },
      attributes: ['user_id', 'full_name', 'email']
    });
    res.status(200).json(managers);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar gestores');
  }
};

// GET /api/users/staff (Lista colaboradores disponíveis para equipes)
exports.getAvailableStaff = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: {
        user_type: 'collaborator', 
        is_active: true
      },
      attributes: ['user_id', 'full_name', 'email']
    });
    res.status(200).json(staff);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar colaboradores');
  }
};