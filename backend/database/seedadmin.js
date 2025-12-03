// Importa as ferramentas necessárias
const sequelize = require('./connection');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- Defina seu primeiro usuário Admin aqui ---
const adminUserData = {
  full_name: 'Administrador do Sistema',
  email: 'admin@hive.com',
  password: 'Admin@123', // Senha padrão
  user_type: 'admin',
  is_active: true
};
// ---------------------------------------------

/**
 * Cria usuário admin padrão
 * ADAPTADO para funcionar quando o servidor inicia
 */
const createDefaultAdmin = async () => {
  try {
    console.log('🔍 Verificando usuário admin...');

    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ 
      where: { email: adminUserData.email } 
    });

    if (existingUser) {
      console.log('✅ Admin já existe no sistema.');
      return;
    }

    // CRIPTOGRAFA a senha
    console.log('📝 Criando usuário admin...');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(adminUserData.password, salt);

    // Cria o usuário no banco
    await User.create({
      full_name: adminUserData.full_name,
      email: adminUserData.email,
      password_hash: password_hash,
      user_type: adminUserData.user_type,
      is_active: adminUserData.is_active
    });

    console.log('✅ Admin criado com sucesso!');
    console.log(`📧 Email: ${adminUserData.email}`);
    console.log(`🔑 Senha: ${adminUserData.password}`);
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
  }
  // ⚠️ NÃO fechamos a conexão aqui, pois o servidor vai continuar usando!
};

module.exports = { createDefaultAdmin };