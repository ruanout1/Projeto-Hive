// ✅ Importação correta seguindo a nova estrutura
const { sequelize, models } = require('./connection');
const bcrypt = require('bcryptjs');

const seedClientUser = async () => {
  try {
    await sequelize.authenticate();
    console.log('🔌 Conectado ao banco para criar Cliente...');

    // DADOS DO CLIENTE
    const clientData = {
      full_name: 'Cliente Teste',
      email: 'cliente@hive.com',
      password: 'cliente123',
      role_key: 'client', // ✅ No novo banco, usamos 'role_key' e não 'user_type'
      is_active: true
    };

    // 1. Garante que a ROLE 'client' existe
    // Se tentar criar o usuário sem a role existir, o banco trava.
    const clientRole = await models.roles.findOne({ where: { role_key: 'client' } });
    
    if (!clientRole) {
        console.log("⚠️ A role 'client' não existe! Criando agora...");
        await models.roles.create({ 
            role_key: 'client', 
            label: 'Cliente' ,
            description: 'Usuário do tipo cliente com acesso ao portal' // ✅ LINHA NOVA OBRIGATÓRIA
        });
    }

    // 2. Verifica se o usuário já existe
    const existingUser = await models.users.findOne({ where: { email: clientData.email } });

    if (existingUser) {
      console.log(`⚠️ O cliente ${clientData.email} já existe. ID: ${existingUser.user_id}`);
      return;
    }

    // 3. Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(clientData.password, salt);

    // 4. Cria o usuário
    const newUser = await models.users.create({
      full_name: clientData.full_name,
      email: clientData.email,
      password_hash: passwordHash,
      role_key: clientData.role_key,
      is_active: clientData.is_active
    });

    console.log('✅ SUCESSO! Cliente criado:');
    console.log(`   E-mail: ${clientData.email}`);
    console.log(`   Senha: ${clientData.password}`);
    console.log(`   ID: ${newUser.user_id}`);

  } catch (error) {
    console.error('❌ ERRO AO CRIAR CLIENTE:', error);
  } finally {
    await sequelize.close();
  }
};

seedClientUser();