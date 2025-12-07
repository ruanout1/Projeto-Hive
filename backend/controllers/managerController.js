module.exports = {
    getScheduleStats: (req, res) => res.json({}),
    getSchedule: (req, res) => res.json([]),
    getScheduleItemById: (req, res) => res.json({}),
    getScheduleByDate: (req, res) => res.json([]),
    getScheduleByType: (req, res) => res.json([]),
    getScheduleByStatus: (req, res) => res.json([]),
    
    createScheduleItem: (req, res) => res.json({ message: "Item criado (mock)" }),
    updateScheduleItem: (req, res) => res.json({ message: "Item atualizado (mock)" }),
    updateScheduleItemStatus: (req, res) => res.json({ message: "Status alterado (mock)" }),
    deleteScheduleItem: (req, res) => res.json({ message: "Item excluído (mock)" }),
    checkScheduleConflicts: (req, res) => res.json([]),
  
    getDashboardStats: (req, res) => res.json({}),
    getActiveRequests: (req, res) => res.json([]),
  
    getServiceRequestsStats: (req, res) => res.json({}),
    getServiceRequests: (req, res) => res.json([]),
    getServiceRequestById: (req, res) => res.json({}),
    acceptServiceRequest: (req, res) => res.json({ message: "Solicitação aceita (mock)" }),
    refuseServiceRequest: (req, res) => res.json({ message: "Solicitação recusada (mock)" }),
    getRequestsByArea: (req, res) => res.json([]),
    searchServiceRequests: (req, res) => res.json([]),
  
    getTimeRecordsStats: (req, res) => res.json({}),
    getTimeRecords: (req, res) => res.json([]),
    getManagerTeams: (req, res) => res.json([]),
    getTimeRecordById: (req, res) => res.json({}),
    justifyTimeRecord: (req, res) => res.json({ message: "Justificativa enviada (mock)" }),
    exportTimeRecords: (req, res) => res.json({ message: "Exportado (mock)" }),
    previewTimeRecordsExport: (req, res) => res.json({ preview: true }),
  };
  