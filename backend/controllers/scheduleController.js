const db = require('../database/connection'); // Pega sua conexão SQL
// Importa o helper de erro que acabamos de criar
const { handleDatabaseError } = require('../utils/errorHandling');

// ===================================
// FUNÇÕES AUXILIARES DE BANCO DE DADOS
// (Lógica do seu antigo ScheduleService.js)
// ===================================

// Utilitário para formatar data para o banco (YYYY-MM-DD)
const formatDateForDB = (date) => {
  return date.toISOString().split('T')[0];
};

// Converter dados do banco para o formato do frontend
const formatScheduleItemForFrontend = (dbItem) => {
  if (!dbItem) return null;
  
  const startTime = new Date(dbItem.start_date);
  const endTime = new Date(dbItem.end_date);
  
  return {
    id: dbItem.event_id.toString(),
    date: startTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    endTime: endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    title: dbItem.title,
    type: dbItem.event_type,
    client: dbItem.client_name,
    clientPhone: dbItem.client_phone,
    service: dbItem.service_name,
    location: dbItem.location,
    status: dbItem.status,
    notes: dbItem.service_notes || dbItem.meeting_agenda,
    organizer: dbItem.organizer_name
  };
};

// Função auxiliar para buscar item por ID (usada internamente por 'create' e 'update')
const fetchScheduleItemById = async (id, managerId) => {
  const [results] = await db.query(`
    SELECT 
      ce.*, c.main_company_name as client_name, u_client.phone as client_phone,
      sc.name as service_name, u_organizer.full_name as organizer_name
    FROM calendar_events ce
    LEFT JOIN clients c ON ce.client_id = c.client_id
    LEFT JOIN users u_client ON c.user_id = u_client.user_id
    LEFT JOIN service_catalog sc ON ce.service_catalog_id = sc.service_catalog_id
    LEFT JOIN users u_organizer ON ce.organizer_user_id = u_organizer.user_id
    WHERE ce.event_id = ? AND ce.organizer_user_id = ?
  `, [id, managerId]);
  return results[0] || null;
};

// Função auxiliar para checar conflitos
const checkTimeConflict = async (managerId, startDate, endDate, excludeId = null) => {
  let query = `
    SELECT event_id, title, start_date, end_date 
    FROM calendar_events 
    WHERE organizer_user_id = ? 
    AND status != 'cancelled'
    AND (
      (start_date < ? AND end_date > ?) OR
      (start_date < ? AND end_date > ?) OR
      (start_date >= ? AND start_date < ?)
    )
  `;
  
  const params = [
    managerId, 
    endDate, startDate,
    startDate, endDate,
    startDate, endDate
  ];
  
  if (excludeId) {
    query += ` AND event_id != ?`;
    params.push(excludeId);
  }
  
  const [results] = await db.query(query, params);
  return results;
};


// ===================================
// CONTROLLERS DA AGENDA (CRUD Completo)
// ===================================

// GET /api/schedule/stats
exports.getScheduleStats = async (req, res) => {
  try {
    const managerId = req.user.id; // Vem do middleware 'protect'
    const today = new Date();
    const todayFormatted = formatDateForDB(today);
    
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN event_type = 'service' AND status = 'scheduled' AND DATE(start_date) >= ? THEN 1 END) as upcoming_services,
        COUNT(CASE WHEN event_type = 'meeting' AND status = 'scheduled' AND DATE(start_date) >= ? THEN 1 END) as upcoming_meetings,
        COUNT(CASE WHEN DATE(start_date) = ? AND status = 'completed' THEN 1 END) as completed_today
      FROM calendar_events 
      WHERE organizer_user_id = ? AND status != 'cancelled'
    `, [todayFormatted, todayFormatted, todayFormatted, managerId]);
    
    res.status(200).json(stats[0] || {
      total: 0, upcoming_services: 0, upcoming_meetings: 0, completed_today: 0
    });
  } catch (error) {
    handleDatabaseError(res, error, 'buscar estatísticas da agenda');
  }
};

// GET /api/schedule (com filtros)
exports.getSchedule = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { startDate, endDate, type, status } = req.query; 

    let query = `
      SELECT 
        ce.*, c.main_company_name as client_name, u_client.phone as client_phone,
        sc.name as service_name, u_organizer.full_name as organizer_name
      FROM calendar_events ce
      LEFT JOIN clients c ON ce.client_id = c.client_id
      LEFT JOIN users u_client ON c.user_id = u_client.user_id
      LEFT JOIN service_catalog sc ON ce.service_catalog_id = sc.service_catalog_id
      LEFT JOIN users u_organizer ON ce.organizer_user_id = u_organizer.user_id
      WHERE ce.organizer_user_id = ?
    `;
    
    const params = [managerId];
    
    if (startDate && endDate) {
      query += ` AND DATE(ce.start_date) BETWEEN ? AND ?`;
      params.push(formatDateForDB(new Date(startDate)));
      params.push(formatDateForDB(new Date(endDate)));
    }
    if (type) {
      query += ` AND ce.event_type = ?`;
      params.push(type);
    }
    if (status) {
      query += ` AND ce.status = ?`;
      params.push(status);
    }
    query += ` ORDER BY DATE(ce.start_date), TIME(ce.start_date)`;
    
    const [results] = await db.query(query, params);
    const formattedSchedule = results.map(formatScheduleItemForFrontend);
    res.status(200).json(formattedSchedule);

  } catch (error) {
    handleDatabaseError(res, error, 'buscar agenda');
  }
};

// GET /api/schedule/:id
exports.getScheduleItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    
    const dbItem = await fetchScheduleItemById(id, managerId);
      
    if (!dbItem) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    
    res.status(200).json(formatScheduleItemForFrontend(dbItem));
  } catch (error) {
    handleDatabaseError(res, error, 'buscar agendamento');
  }
};

// POST /api/schedule (NOVO - Lógica do seu ScheduleService)
exports.createScheduleItem = async (req, res) => {
  try {
    const managerId = req.user.id;
    const scheduleData = {
      ...req.body,
      organizer_user_id: managerId, // Garante que o gestor é o organizador
      created_by_user_id: managerId // Garante que o gestor é o criador
    };
    
    // 1. Verificar conflitos
    const conflicts = await checkTimeConflict(
      managerId,
      scheduleData.start_date,
      scheduleData.end_date
    );
    
    if (conflicts.length > 0) {
      // 409: Conflict
      return res.status(409).json({
        message: 'Conflito de horário: Já existe um agendamento neste horário',
        conflicts: conflicts
      });
    }
    
    // 2. Inserir no banco
    const [result] = await db.query(`
      INSERT INTO calendar_events 
      (event_number, title, description, event_type, event_subtype, start_date, end_date, 
       is_all_day, location, address_details, status, priority, organizer_user_id, 
       client_id, service_catalog_id, area_id, client_phone, service_notes, 
       meeting_agenda, meeting_room, meeting_link, created_by_user_id)
      VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      scheduleData.title,
      scheduleData.description || null,
      scheduleData.event_type,
      scheduleData.event_subtype || null,
      scheduleData.start_date,
      scheduleData.end_date,
      scheduleData.is_all_day || false,
      scheduleData.location || null,
      scheduleData.address_details ? JSON.stringify(scheduleData.address_details) : null,
      scheduleData.status || 'scheduled',
      scheduleData.priority || 'medium',
      managerId, // organizer_user_id
      scheduleData.client_id || null,
      scheduleData.service_catalog_id || null,
      scheduleData.area_id || null,
      scheduleData.client_phone || null,
      scheduleData.service_notes || null,
      scheduleData.meeting_agenda || null,
      scheduleData.meeting_room || null,
      scheduleData.meeting_link || null,
      managerId // created_by_user_id
    ]);
    
    // 3. Retornar o item criado
    const newItem = await fetchScheduleItemById(result.insertId, managerId);
    res.status(201).json(formatScheduleItemForFrontend(newItem));
  } catch (error) {
    handleDatabaseError(res, error, 'criar agendamento');
  }
};

// PUT /api/schedule/:id (NOVO)
exports.updateScheduleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const updateData = req.body;

    // 1. Verificar se o item existe e pertence ao gestor
    const existingItem = await fetchScheduleItemById(id, managerId);
    if (!existingItem) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // 2. Verificar conflitos (excluindo o próprio item)
    const conflicts = await checkTimeConflict(
      managerId,
      updateData.start_date,
      updateData.end_date,
      id // Exclui este ID da verificação
    );
    
    if (conflicts.length > 0) {
      return res.status(409).json({
        message: 'Conflito de horário: Já existe outro agendamento neste horário',
        conflicts: conflicts
      });
    }

    // 3. Atualizar no banco
    await db.query(`
      UPDATE calendar_events SET
        title = ?, description = ?, event_type = ?, event_subtype = ?, 
        start_date = ?, end_date = ?, is_all_day = ?, location = ?, 
        address_details = ?, status = ?, priority = ?, client_id = ?, 
        service_catalog_id = ?, area_id = ?, client_phone = ?, service_notes = ?, 
        meeting_agenda = ?, meeting_room = ?, meeting_link = ?, 
        updated_by_user_id = ?
      WHERE event_id = ? AND organizer_user_id = ?
    `, [
      updateData.title,
      updateData.description || null,
      updateData.event_type,
      updateData.event_subtype || null,
      updateData.start_date,
      updateData.end_date,
      updateData.is_all_day || false,
      updateData.location || null,
      updateData.address_details ? JSON.stringify(updateData.address_details) : null,
      updateData.status || 'scheduled',
      updateData.priority || 'medium',
      updateData.client_id || null,
      updateData.service_catalog_id || null,
      updateData.area_id || null,
      updateData.client_phone || null,
      updateData.service_notes || null,
      updateData.meeting_agenda || null,
      updateData.meeting_room || null,
      updateData.meeting_link || null,
      managerId, // updated_by_user_id
      id, // WHERE event_id = ?
      managerId // AND organizer_user_id = ?
    ]);

    // 4. Retornar o item atualizado
    const updatedItem = await fetchScheduleItemById(id, managerId);
    res.status(200).json(formatScheduleItemForFrontend(updatedItem));
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar agendamento');
  }
};

// PUT /api/schedule/:id/status (NOVO)
exports.updateScheduleItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status é obrigatório' });
    }

    const [result] = await db.query(`
      UPDATE calendar_events SET
        status = ?,
        updated_by_user_id = ?
      WHERE event_id = ? AND organizer_user_id = ?
    `, [status, managerId, id, managerId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a você' });
    }
    
    const updatedItem = await fetchScheduleItemById(id, managerId);
    res.status(200).json(formatScheduleItemForFrontend(updatedItem));
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar status do agendamento');
  }
};

// DELETE /api/schedule/:id (NOVO)
exports.deleteScheduleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    
    const [result] = await db.query(`
      DELETE FROM calendar_events 
      WHERE event_id = ? AND organizer_user_id = ?
    `, [id, managerId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a você' });
    }
    
    res.status(200).json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    handleDatabaseError(res, error, 'excluir agendamento');
  }
};

// ===================================
// CONTROLLERS DAS ROTAS ANTIGAS (que não estão mais no frontend, mas existiam)
// =Obs: O frontend não parece usar estas, mas vou mantê-las caso você precise
// ===================================

// GET /api/schedule/filter/date
exports.getScheduleByDate = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { date } = req.query;
    
    const [results] = await db.query(`
      SELECT ce.*, c.main_company_name as client_name, u_client.phone as client_phone,
             sc.name as service_name, u_organizer.full_name as organizer_name
      FROM calendar_events ce
      LEFT JOIN clients c ON ce.client_id = c.client_id
      LEFT JOIN users u_client ON c.user_id = u_client.user_id
      LEFT JOIN service_catalog sc ON ce.service_catalog_id = sc.service_catalog_id
      LEFT JOIN users u_organizer ON ce.organizer_user_id = u_organizer.user_id
      WHERE ce.organizer_user_id = ? AND DATE(ce.start_date) = ?
      ORDER BY TIME(ce.start_date)
    `, [managerId, formatDateForDB(new Date(date))]);
    
    res.status(200).json(results.map(formatScheduleItemForFrontend));
  } catch (error) {
    handleDatabaseError(res, error, 'buscar agenda por data');
  }
};

// GET /api/schedule/:id/conflicts
exports.checkScheduleConflicts = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;

    // Pega o item atual para saber o start/end
    const item = await fetchScheduleItemById(id, managerId);
    if (!item) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    
    const conflicts = await checkTimeConflict(
      managerId,
      item.start_date,
      item.end_date,
      id // Exclui ele mesmo
    );
    
    res.status(200).json(conflicts);
  } catch (error) {
    handleDatabaseError(res, error, 'verificar conflitos');
  }
};

// GET /api/schedule/filter/type
exports.getScheduleByType = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { type } = req.query;
    
    const [results] = await db.query(`
      SELECT ce.*, c.main_company_name as client_name, u_client.phone as client_phone,
             sc.name as service_name, u_organizer.full_name as organizer_name
      FROM calendar_events ce
      LEFT JOIN clients c ON ce.client_id = c.client_id
      LEFT JOIN users u_client ON c.user_id = u_client.user_id
      LEFT JOIN service_catalog sc ON ce.service_catalog_id = sc.service_catalog_id
      LEFT JOIN users u_organizer ON ce.organizer_user_id = u_organizer.user_id
      WHERE ce.organizer_user_id = ? AND ce.event_type = ?
      ORDER BY DATE(ce.start_date), TIME(ce.start_date)
    `, [managerId, type]);
    
    res.status(200).json(results.map(formatScheduleItemForFrontend));
  } catch (error) {
    handleDatabaseError(res, error, 'buscar agenda por tipo');
  }
};

// GET /api/schedule/filter/status  
exports.getScheduleByStatus = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { status } = req.query;
    
    const [results] = await db.query(`
      SELECT ce.*, c.main_company_name as client_name, u_client.phone as client_phone,
             sc.name as service_name, u_organizer.full_name as organizer_name
      FROM calendar_events ce
      LEFT JOIN clients c ON ce.client_id = c.client_id
      LEFT JOIN users u_client ON c.user_id = u_client.user_id
      LEFT JOIN service_catalog sc ON ce.service_catalog_id = sc.service_catalog_id
      LEFT JOIN users u_organizer ON ce.organizer_user_id = u_organizer.user_id
      WHERE ce.organizer_user_id = ? AND ce.status = ?
      ORDER BY DATE(ce.start_date), TIME(ce.start_date)
    `, [managerId, status]);
    
    res.status(200).json(results.map(formatScheduleItemForFrontend));
  } catch (error) {
    handleDatabaseError(res, error, 'buscar agenda por status');
  }
};