const bcrypt = require('bcryptjs');
const { models, sequelize } = require('./config/database');

async function createManager() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    
    // 1. Defina os dados do Gestor
    const managerData = {
      full_name: 'Roberto Gestor',
      email: 'gestor@hive.com', // Esse será o login
      password: '123456',          // Essa será a senha
      phone: '(11) 98888-7777',
      role_key: 'manager',      // O papel fundamental para o login
      is_active: true
    };

    // 2. Verificar se já existe
    const existingUser = await models.users.findOne({ where: { email: managerData.email } });
    if (existingUser) {
      console.log('⚠️ Este email de gestor já existe no banco.');
      process.exit(0);
    }

    // 3. Criptografar a senha (O Pulo do Gato)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(managerData.password, salt);

    // 4. Criar o Usuário no Banco
    const newUser = await models.users.create({
      full_name: managerData.full_name,
      email: managerData.email,
      password_hash: passwordHash, // Salvamos o hash, não a senha plana
      phone: managerData.phone,
      role_key: managerData.role_key,
      is_active: managerData.is_active
    });

    console.log(`✅ Gestor criado com sucesso!`);
    console.log(`🆔 ID: ${newUser.user_id}`);
    console.log(`📧 Email: ${managerData.email}`);
    console.log(`🔑 Senha: ${managerData.password}`);

  } catch (error) {
    console.error('❌ Erro ao criar gestor:', error);
  } finally {
    // Fecha a conexão
    await sequelize.close();
  }
}

createManager();