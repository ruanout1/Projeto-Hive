const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// =============================================
// CONTROLLER DE PERFIL DO USUÁRIO
// =============================================

// GET /api/profile - Buscar dados do usuário logado
exports.getMyProfile = async (req, res) => {
  try {
    // req.user vem do middleware protect
    const userId = req.user.user_id;

    const user = await User.findOne({
      where: { user_id: userId },
      attributes: ['user_id', 'full_name', 'email', 'phone', 'user_type', 'avatar_url', 'is_active']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        type: user.user_type,
        avatar: user.avatar_url,
        isActive: user.is_active
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil do usuário'
    });
  }
};

// PUT /api/profile - Atualizar dados do usuário logado
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name, email, phone } = req.body;

    // Validações
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      });
    }

    // Verificar se o email já está em uso por outro usuário
    if (email) {
      const existingUser = await User.findOne({
        where: {
          email,
          user_id: { [Op.ne]: userId } // Diferente do usuário atual
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso por outro usuário'
        });
      }
    }

    // Atualizar usuário
    await User.update(
      {
        full_name: name,
        email,
        phone: phone || null
      },
      { where: { user_id: userId } }
    );

    // Buscar usuário atualizado
    const updatedUser = await User.findOne({
      where: { user_id: userId },
      attributes: ['user_id', 'full_name', 'email', 'phone', 'user_type', 'avatar_url']
    });

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        id: updatedUser.user_id,
        name: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        type: updatedUser.user_type,
        avatar: updatedUser.avatar_url
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil'
    });
  }
};

// PUT /api/profile/password - Alterar senha do usuário
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    // Validações
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    // Validar força da senha
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,15}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve conter: letra maiúscula, minúscula, caractere especial e ter entre 8-15 dígitos'
      });
    }

    // Buscar usuário
    const user = await User.findOne({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Criptografar nova senha
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Atualizar senha
    await User.update(
      { password_hash: newPasswordHash },
      { where: { user_id: userId } }
    );

    res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha'
    });
  }
};

// PUT /api/profile/avatar - Atualizar foto do perfil
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { avatarUrl } = req.body;

    await User.update(
      { avatar_url: avatarUrl },
      { where: { user_id: userId } }
    );

    res.status(200).json({
      success: true,
      message: 'Foto de perfil atualizada',
      data: { avatar: avatarUrl }
    });

  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar foto de perfil'
    });
  }
};