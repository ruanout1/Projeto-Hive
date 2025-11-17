const db = require('../database/connection');

class ScheduleService {
  
  // Buscar estatísticas da agenda do gestor
  static async getScheduleStats(managerId) {
    try {
      const today = new Date();
      const todayFormatted = this.formatDateForDB(today);
      
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN event_type = 'service' AND status = 'scheduled' AND DATE(start_date) >= ? THEN 1 END) as upcoming_services,
          COUNT(CASE WHEN event_type = 'meeting' AND status = 'scheduled' AND DATE(start_date) >= ? THEN 1 END) as upcoming_meetings,
          COUNT(CASE WHEN DATE(start_date) = ? AND status = 'completed' THEN 1 END) as completed_today
        FROM calendar_events 
        WHERE organizer_user_id = ? AND status != 'cancelled'
      `, [todayFormatted, todayFormatted, todayFormatted, managerId]);
      
      return stats[0] || {
        total: 0,
        upcoming_services: 0,
        upcoming_meetings: 0,
        completed_today: 0
      };
    } catch (error) {
      console.error('Erro no ScheduleService.getScheduleStats:', error);
      throw new Error('Erro ao buscar estatísticas da agenda');
    }
  }

  // Buscar agenda com filtros
  static async getManagerSchedule(filters) {
    try {
      let query = `
        SELECT 
          ce.*,
          c.main_company_name as client_name,
          u_client.phone as client_phone,
          sc.name as service_name,
          u_organizer.full_name as organizer_name
        FROM calendar_events ce
        LEFT JOIN clients c ON ce.client_id = c.client_id
        LEFT JOIN users u_client ON c.user_id = u_client.user_id
        LEFT JOIN service_catalog sc ON ce.service_catalog_id = sc.service_catalog_id
        LEFT JOIN users u_organizer ON ce.organizer_user_id = u_organizer.user_id
        WHERE ce.organizer_user_id = ?
      `;
      
      const params = [filters.managerId];
      
      if (filters.startDate && filters.endDate) {
        query += ` AND DATE(ce.start_date) BETWEEN ? AND ?`;
        params.push(
          this.formatDateForDB(new Date(filters.startDate)),
          this.formatDateForDB(new Date(filters.endDate))
        );
      }
      
      if (filters.type) {
        query += ` AND ce.event_type = ?`;
        params.push(filters.type);
      }
      
      if (filters.status) {
        query += ` AND ce.status = ?`;
        params.push(filters.status);
      }
      
      query += ` ORDER BY DATE(ce.start_date), TIME(ce.start_date)`;
      
      const [results] = await db.query(query, params);
      return results;
    } catch (error) {
      console.error('Erro no ScheduleService.getManagerSchedule:', error);
      throw new Error('Erro ao buscar agenda');
    }
  }

  // Buscar agendamento por ID
  static async getScheduleItemById(id, managerId) {
    try {
      const [results] = await db.query(`
        SELECT 
          ce.*,
          c.main_company_name as client_name,
          u_client.phone as client_phone,
          sc.name as service_name,
          u_organizer.full_name as organizer_name
        FROM calendar_events ce
        LEFT JOIN clients c ON ce.client_id = c.client_id
        LEFT JOIN users u_client ON c.user_id = u_client.user_id
        LEFT JOIN service_catalog sc ON ce.service_catalog_id = sc.service_catalog_id
        LEFT JOIN users u_organizer ON ce.organizer_user_id = u_organizer.user_id
        WHERE ce.event_id = ? AND ce.organizer_user_id = ?
      `, [id, managerId]);
      
      return results[0] || null;
    } catch (error) {
      console.error('Erro no ScheduleService.getScheduleItemById:', error);
      throw new Error('Erro ao buscar agendamento');
    }
  }

  // Criar novo agendamento
  static async createScheduleItem(scheduleData) {
    try {
      // Verificar conflitos de horário
      const conflicts = await this.checkTimeConflict(
        scheduleData.managerId,
        scheduleData.start_date,
        scheduleData.end_date
      );
      
      if (conflicts.length > 0) {
        throw new Error('Conflito de horário: Já existe um agendamento neste horário');
      }
      
      // Inserir no banco
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
        scheduleData.location,
        scheduleData.address_details ? JSON.stringify(scheduleData.address_details) : null,
        scheduleData.status || 'scheduled',
        scheduleData.priority || 'medium',
        scheduleData.organizer_user_id,
        scheduleData.client_id || null,
        scheduleData.service_catalog_id || null,
        scheduleData.area_id || null,
        scheduleData.client_phone || null,
        scheduleData.service_notes || null,
        scheduleData.meeting_agenda || null,
        scheduleData.meeting_room || null,
        scheduleData.meeting_link || null,
        scheduleData.created_by_user_id
      ]);
      
      // Retornar o item criado
      return await this.getScheduleItemById(result.insertId, scheduleData.organizer_user_id);
    } catch (error) {
      console.error('Erro no ScheduleService.createScheduleItem:', error);
      throw error;
    }
  }

  // Verificar conflitos de horário
  static async checkTimeConflict(managerId, startDate, endDate, excludeId = null) {
    try {
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
    } catch (error) {
      console.error('Erro no ScheduleService.checkTimeConflict:', error);
      throw new Error('Erro ao verificar conflitos de horário');
    }
  }

  // Buscar agenda por data específica
  static async getScheduleByDate(managerId, date) {
    try {
      const [results] = await db.query(`
        SELECT 
          ce.*,
          c.main_company_name as client_name,
          u_client.phone as client_phone,
          sc.name as service_name,
          u_organizer.full_name as organizer_name
        FROM calendar_events ce
        LEFT JOIN clients c ON ce.client_id = c.client_id
        LEFT JOIN users u_client ON c.user_id = u_client.user_id
        LEFT JOIN service_catalog sc ON ce.service_catalog_id = sc.service_catalog_id
        LEFT JOIN users u_organizer ON ce.organizer_user_id = u_organizer.user_id
        WHERE ce.organizer_user_id = ? AND DATE(ce.start_date) = ?
        ORDER BY TIME(ce.start_date)
      `, [managerId, this.formatDateForDB(new Date(date))]);
      
      return results;
    } catch (error) {
      console.error('Erro no ScheduleService.getScheduleByDate:', error);
      throw new Error('Erro ao buscar agenda por data');
    }
  }

  // Utilitário para formatar data para o banco (YYYY-MM-DD)
  static formatDateForDB(date) {
    return date.toISOString().split('T')[0];
  }

  // Converter dados do banco para o formato do frontend
  static formatScheduleItemForFrontend(dbItem) {
    if (!dbItem) return null;
    
    return {
      id: dbItem.event_id.toString(),
      date: this.formatDateForFrontend(dbItem.start_date),
      time: this.formatTimeForFrontend(dbItem.start_date),
      endTime: this.formatTimeForFrontend(dbItem.end_date),
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
  }

  static formatDateForFrontend(dateTime) {
    const date = new Date(dateTime);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  static formatTimeForFrontend(dateTime) {
    const date = new Date(dateTime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Buscar agenda por tipo
  static async getScheduleByType(managerId, type) {
    try {
      const [results] = await db.query(`
        SELECT 
          ce.*,
          c.main_company_name as client_name,
          u_client.phone as client_phone,
          sc.name as service_name,
          u_organizer.full_name as organizer_name
        FROM calendar_events ce
        LEFT JOIN clients c ON ce.client_id = c.client_id
        LEFT JOIN users u_client ON c.user_id = u_client.user_id
        LEFT JOIN service_catalog sc ON ce.service_catalog_id = sc.service_catalog_id
        LEFT JOIN users u_organizer ON ce.organizer_user_id = u_organizer.user_id
        WHERE ce.organizer_user_id = ? AND ce.event_type = ?
        ORDER BY DATE(ce.start_date), TIME(ce.start_date)
      `, [managerId, type]);
      
      return results.map(item => this.formatScheduleItemForFrontend(item));
    } catch (error) {
      console.error('Erro no ScheduleService.getScheduleByType:', error);
      throw new Error('Erro ao buscar agenda por tipo');
    }
  }

  // Buscar agenda por status
  static async getScheduleByStatus(managerId, status) {
    try {
      const [results] = await db.query(`
        SELECT 
          ce.*,
          c.main_company_name as client_name,
          u_client.phone as client_phone,
          sc.name as service_name,
          u_organizer.full_name as organizer_name
        FROM calendar_events ce
        LEFT JOIN clients c ON ce.client_id = c.client_id
        LEFT JOIN users u_client ON c.user_id = u_client.user_id
        LEFT JOIN service_catalog sc ON ce.service_catalog_id = sc.service_catalog_id
        LEFT JOIN users u_organizer ON ce.organizer_user_id = u_organizer.user_id
        WHERE ce.organizer_user_id = ? AND ce.status = ?
        ORDER BY DATE(ce.start_date), TIME(ce.start_date)
      `, [managerId, status]);
      
      return results.map(item => this.formatScheduleItemForFrontend(item));
    } catch (error) {
      console.error('Erro no ScheduleService.getScheduleByStatus:', error);
      throw new Error('Erro ao buscar agenda por status');
    }
  }
}

module.exports = ScheduleService;