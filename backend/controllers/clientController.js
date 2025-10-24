const { currentService, serviceHistory, timeline, serviceNotesData } = require("../data/mockData");

exports.getCurrentService = (req, res) => res.json(currentService);
exports.getServiceHistory = (req, res) => res.json(serviceHistory);
exports.getTimeline = (req, res) => res.json(timeline);
exports.getServiceNotes = (req, res) => res.json(serviceNotesData);
