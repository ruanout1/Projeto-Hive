// Importa as ferramentas necessárias
const sequelize = require('./connection');
const User = require('../models/User');
const Client = require('../models/Client');

const seedClientRecord = async () => {
  try {
    // 1. Busca o usuário cliente
    console.log(' Buscando usuário cliente@hive.com...');
    const user = await User.findOne({ 
      where: { email: 'cliente@hive.com' } 
    });
    
    if (!user) {
      console.log(' Usuário cliente@hive.com não encontrado!');
      console.log(' Execute primeiro: node database/seedClientUser.js');
      return;
    }

    console.log(` Usuário encontrado: ID ${user.user_id}`);

    // 2. Verifica se já existe registro de cliente
    const existingClient = await Client.findOne({ 
      where: { user_id: user.user_id } 
    });
    
    if (existingClient) {
      console.log('  Registro de cliente já existe!');
      console.log(`   client_id: ${existingClient.client_id}`);
      console.log(`   user_id: ${existingClient.user_id}`);
      console.log(`   company: ${existingClient.main_company_name}`);
      return;
    }

    // 3. Cria o registro de cliente
    console.log(' Criando registro de CLIENTE na tabela clients...');
    const client = await Client.create({
      user_id: user.user_id,
      main_company_name: 'Empresa Teste Ltda',
      main_cnpj: '12.345.678/0001-90',
      payment_day: 10,
      contract_start_date: new Date(),
      contract_value: 1500.00,
      is_active: true
    });

    console.log('\n SUCESSO! Registro de cliente criado:');
    console.log(`   client_id: ${client.client_id}`);
    console.log(`   user_id: ${client.user_id}`);
    console.log(`   company: ${client.main_company_name}`);
    console.log(`   cnpj: ${client.main_cnpj}`);
    console.log('\n Agora o portal do cliente funcionará corretamente!');

  } catch (error) {
    console.error(' ERRO AO CRIAR REGISTRO DE CLIENTE:', error);
  } finally {
    // Fecha a conexão
    await sequelize.close();
  }
};

// Executa o seed
seedClientRecord();