const { sequelize, models } = require('./db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    // 1. Conecta no banco
    await sequelize.authenticate();
    console.log('🔌 Conectado ao banco para criar usuário...');

    // 2. Define os dados do Admin
    const email = 'admin@hive.com';
    const passwordRaw = '123456'; // A senha que você vai digitar no login
    
    // 3. Gera o Hash da senha (segurança)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordRaw, salt);

    // 4. Cria o usuário usando o Model novo
    // Verifica se já existe para não duplicar
    const existing = await models.users.findOne({ where: { email } });
    
    if (existing) {
      console.log('⚠️ O usuário admin@hive.com já existe!');
    } else {
      const newUser = await models.users.create({
        full_name: 'Admin Hive',
        email: email,
        password_hash: passwordHash,
        role_key: 'admin', // Importante: deve bater com a tabela 'roles'
        is_active: true
      });
      console.log(`✅ Usuário criado com sucesso! ID: ${newUser.user_id}`);
    }

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    // 5. Fecha a conexão
    await sequelize.close();
  }
}

createAdmin();