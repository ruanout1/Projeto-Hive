const sequelize = require('./connection');

const User = require('../models/User');
const Client = require('../models/Client');
const ServiceCatalog = require('../models/ServiceCatalog');
const ScheduledService = require('../models/ScheduledService');

const seedScheduledService = async () => {
  try {
    console.log("🔗 Conectando ao banco...");
    await sequelize.authenticate();

    // ============================
    // 1) BUSCAR O USUÁRIO CLIENTE
    // ============================
    const clientUser = await User.findOne({
      where: { email: 'cliente@hive.com' }
    });

    if (!clientUser) {
      throw new Error("Usuário cliente@hive.com não encontrado!");
    }

    // ============================
    // 2) GARANTIR QUE O CLIENT EXISTE
    // ============================
    let client = await Client.findOne({
      where: { user_id: clientUser.user_id }
    });

    if (!client) {
      console.log("⚠️ Nenhum CLIENT encontrado. Criando agora...");
      client = await Client.create({
        user_id: clientUser.user_id,
        main_company_name: 'Cliente Teste LTDA'
      });
      console.log(" CLIENT criado:", client.client_id);
    }

    // ============================
    // 3) BUSCAR MANAGER E COLLABORATOR
    // ============================
    const managerUser = await User.findOne({ where: { user_type: 'manager' } });
    const collaboratorUser = await User.findOne({ where: { user_type: 'collaborator' } });

    // ============================
    // 4) GARANTIR SERVICE CATALOG
    // ============================
    const [service] = await ServiceCatalog.findOrCreate({
      where: { name: 'Limpeza Geral' },
      defaults: {
        description: 'Serviço completo de limpeza.',
        price: 500,
        duration_value: 4,
        duration_type: 'horas',
        category_id: null
      }
    });

    console.log("🟡 Criando serviço agendado...");

    // ============================
    // 5) CRIAR SERVIÇO AGENDADO
    // ============================
    const scheduled = await ScheduledService.create({
      client_id: client.client_id,
      service_catalog_id: service.service_catalog_id,
      collaborator_user_id: collaboratorUser?.user_id || null,
      assigned_manager_area_id: null,
      scheduled_date: '2025-01-10',
      start_time: '08:00',
      end_time: '12:00',
      status: 'scheduled',
      notes: 'Primeira limpeza programada'
    });

    console.log(" Serviço agendado criado com sucesso!");
    console.log(scheduled.toJSON());

  } catch (error) {
    console.error(" Erro ao rodar seed:", error);
  } finally {
    await sequelize.close();
  }
};

seedScheduledService();
