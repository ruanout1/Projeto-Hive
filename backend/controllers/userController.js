const { models, sequelize } = require('../database/connection');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await models.users.findAll({
      // Busca gestores e colaboradores
      where: { role_key: { [Op.in]: ['manager', 'collaborator'] } },
      attributes: ['user_id', 'full_name', 'email', 'phone', 'role_key', 'is_active', 'created_at', 'last_login'],
      include: [
        { model: models.collaborators, as: 'collaborator', attributes: ['position'] } // as 'collaborator' vem do init-models
      ],
      order: [['created_at', 'DESC']]
    });

    // Formata retorno
    const formatted = users.map(u => ({
      id: u.user_id,
      name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role_key === 'manager' ? 'Gestor' : 'Colaborador',
      position: u.collaborator?.position || '-',
      status: u.is_active ? 'active' : 'inactive',
      lastAccess: u.last_login
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, phone, role, position, areas, status } = req.body;

    // Validação básica
    if (!name || !email || !role) {
      await t.rollback();
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    const existing = await models.users.findOne({ where: { email } });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ message: 'Email já existe' });
    }

    const hash = await bcrypt.hash('Senha123', 10); // Senha padrão
    const roleKey = role === 'Gestor' ? 'manager' : 'collaborator';

    // 1. Cria Usuário
    const newUser = await models.users.create({
      full_name: name,
      email,
      phone,
      password_hash: hash,
      role_key: roleKey,
      is_active: status === 'active'
    }, { transaction: t });

    // 2. Se for Colaborador, cria perfil extra
    if (roleKey === 'collaborator') {
      await models.collaborators.create({
        user_id: newUser.user_id,
        position: position || 'Operacional'
      }, { transaction: t });
    }

    // 3. Se for Gestor, vincula áreas
    if (roleKey === 'manager' && areas && areas.length > 0) {
      // Busca IDs das áreas pelo nome
      const areaRecs = await models.areas.findAll({
        where: { name: { [Op.in]: areas } },
        transaction: t
      });
      
      const bulkAreas = areaRecs.map(a => ({
        manager_user_id: newUser.user_id,
        area_id: a.area_id
      }));

      if(bulkAreas.length) {
        await models.manager_areas.bulkCreate(bulkAreas, { transaction: t });
      }
    }

    await t.commit();
    res.status(201).json({ success: true, message: 'Usuário criado!' });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

// ... (Implementar update e delete seguindo a mesma lógica de transaction)