const express = require('express');
const router = express.Router();

// Importa os dados do nosso "banco de dados" mock
// Assumindo que mockData.js está em database/mockData.js
const {
  currentService,
  serviceHistory,
  timeline,
  serviceNotesData,
  pastRatingsData,
  serviceRequestsData
} = require('../database/mockData');

// =====================
// ROTAS GET (Clientes)
// =====================
// As rotas aqui são relativas a /api/clientes

// GET /api/clientes/current-service
router.get("/current-service", (req, res) => res.json(currentService));

// GET /api/clientes/history
router.get("/history", (req, res) => res.json(serviceHistory));

// GET /api/clientes/timeline
router.get("/timeline", (req, res) => res.json(timeline));

// GET /api/clientes/service-notes
router.get("/service-notes", (req, res) => res.json(serviceNotesData));

// GET /api/clientes/servicos (antiga /api/servicos)
router.get("/servicos", (req, res) => res.json(serviceHistory));

// GET /api/clientes/ratings
router.get("/ratings", (req, res) => res.json(pastRatingsData));

// GET /api/clientes/requests
router.get("/requests", (req, res) => {
  console.log("Enviando lista de solicitações para o frontend");
  res.json(serviceRequestsData);
});

// =====================
// ROTAS POST (Clientes)
// =====================

// POST /api/clientes/ratings
router.post("/ratings", (req, res) => {
  const newRating = req.body;
  pastRatingsData.unshift(newRating);
  console.log(" Nova avaliação recebida do frontend:", newRating);
  res.status(201).json({ message: "Avaliação recebida com sucesso!", data: newRating });
});

// POST /api/clientes/history
router.post("/history", (req, res) => {
  const newService = req.body;
  newService.id = `OS-2025-${Math.floor(Math.random() * 900) + 100}`; 
  newService.service = `${newService.service} (Criado via POST)`; 
  console.log(" Novo serviço recebido do frontend:", newService);
  serviceHistory.unshift(newService); 
  res.status(201).json(newService);
});

// POST /api/clientes/requests
router.post("/requests", (req, res) => {
  const newRequest = req.body;
  newRequest.id = `REQ-2025-${Math.floor(Math.random() * 900) + 100}`;
  newRequest.status = 'em-analise'; // O backend define o status inicial
  newRequest.requestedAt = new Date().toLocaleString('pt-BR');
  console.log(" Nova solicitação recebida do frontend:", newRequest);
  serviceRequestsData.unshift(newRequest); // Adiciona no início da lista
  res.status(201).json(newRequest);
});

// Exporta o router para o server.js usar
module.exports = router;
