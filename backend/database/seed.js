// Importa as ferramentas necessárias
const sequelize = require('./connection');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- Defina seu primeiro usuário Admin aqui ---
const adminUserData = {
  full_name: 'Administrador do Sistema',
  email: 'admin@hive.com',
  password: 'admin123', // Vamos usar 'admin123' como senha
  user_type: 'admin',
  is_active: true
};
// ---------------------------------------------

const seedAdminUser = async () => {
  try {
    // 1. Sincroniza o model User (apenas para garantir que a tabela existe)
    await User.sync();

    // 2. Verifica se o usuário já existe
    const existingUser = await User.findOne({ where: { email: adminUserData.email } });

    if (existingUser) {
      console.log('✅ Usuário admin já existe. Nada a fazer.');
      return;
    }

    // 3. CRIPTOGRAFA a senha
    console.log('Criptografando senha...');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(adminUserData.password, salt);

    // 4. Cria o usuário no banco
    console.log('Criando usuário admin...');
    await User.create({
      full_name: adminUserData.full_name,
      email: adminUserData.email,
      password_hash: password_hash, // Salva a senha criptografada
      user_type: adminUserData.user_type,
      is_active: adminUserData.is_active
    });

    console.log('✅ SUCESSO! Usuário admin criado:');
    console.log(`   E-mail: ${adminUserData.email}`);
    console.log(`   Senha: ${adminUserData.password}`);

  } catch (error) {
    console.error('❌ ERRO AO CRIAR ADMIN:', error);
  } finally {
    // 5. Fecha a conexão com o banco
    await sequelize.close();
  }
};

// Executa a função
seedAdminUser();