const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/authorizationMiddleware");
const ScheduledService = require("../models/ScheduledService");
const Client = require("../models/Client");
const ServiceCatalog = require("../models/ServiceCatalog");
const db = require('../database/connection');

// Cliente logado, role = client
router.use(protect, checkRole(["client"]));

router.get('/scheduled-services', async (req, res) => {
    try {
      const clientId = req.user.client_id;
      console.log("🔍 Dados do usuário logado:", req.user);
      console.log("🔍 client_id:", req.user?.client_id);
  
      const [services] = await db.query(`
        SELECT 
          ss.scheduled_service_id AS id,
          ss.scheduled_date,
          ss.start_time,
          ss.end_time,
          ss.status,
          ss.notes,
          sc.name AS service_name,
          c.address
        FROM scheduled_services ss
        LEFT JOIN service_catalog sc 
          ON ss.service_catalog_id = sc.service_catalog_id
        LEFT JOIN clients c 
          ON ss.client_id = c.client_id
        WHERE ss.client_id = ?
        ORDER BY ss.scheduled_date ASC
      `, [clientId]
    );
  
      // 🔄 MAPEAR PARA O FORMATO QUE O FRONTEND ESPERA
      const formatted = services.map(s => ({
        id: s.id,
        serviceType: s.service_name,
        serviceIcon: "activity",   // temporário
        scheduledDate: s.scheduled_date,
        scheduledTime: s.start_time,
        estimatedDuration: `${s.start_time} - ${s.end_time}`,
        address: s.address || "Endereço não informado",
        status: s.status === "in_progress" ? "in-progress" : s.status,
        teamMembers: [],         // por enquanto vazio
        serviceNotes: [],
        timeline: []
      }));
  
      res.json(formatted);
  
    } catch (error) {
      console.error("Erro ao buscar serviços agendados:", error);
      res.status(500).json({ message: 'Erro interno ao carregar serviços agendados.' });
    }
  });
  

module.exports = router;
