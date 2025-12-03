// Importa as ferramentas necessárias
const sequelize = require('./connection');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- Defina seu primeiro usuário CLIENTE aqui ---
const clientUserData = {
  full_name: 'Cliente Teste',
  email: 'cliente@hive.com',
  password: 'cliente123', // Senha padrão
  user_type: 'client',    // IMPORTANTE: mesma role usada no checkRole(['client'])
  is_active: true
};
// ---------------------------------------------

const seedClientUser = async () => {
  try {
    // 1. Sincroniza o model User (apenas para garantir)
    await User.sync();

    // 2. Verifica se o usuário já existe
    const existingUser = await User.findOne({ where: { email: clientUserData.email } });

    if (existingUser) {
      console.log('⚠️ Usuário cliente já existe. Nada a fazer.');
      return;
    }

    // 3. Criptografa a senha
    console.log('🔐 Criptografando senha do cliente...');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(clientUserData.password, salt);

    // 4. Cria o usuário
    console.log('🟡 Criando CLIENTE no banco...');
    await User.create({
      full_name: clientUserData.full_name,
      email: clientUserData.email,
      password_hash: password_hash,
      user_type: clientUserData.user_type,
      is_active: clientUserData.is_active
    });

    console.log(' SUCESSO! Usuário cliente criado:');
    console.log(`   E-mail: ${clientUserData.email}`);
    console.log(`   Senha: ${clientUserData.password}`);

  } catch (error) {
    console.error('❌ ERRO AO CRIAR CLIENTE:', error);
  } finally {
    // Fecha a conexão
    await sequelize.close();
  }
};

// Executa o seed
seedClientUser();
