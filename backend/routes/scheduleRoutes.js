const express = require('express');
const router = express.Router();

// IMPORTANTE: Agora o arquivo deve se chamar ScheduleController.js
const ScheduleController = require('../controllers/ScheduleController');
const { protect } = require('../middleware/authMiddleware');

// =======================================================================
// SCHEDULE ROUTES (HYBRID: SERVICES + EVENTS)
// =======================================================================

// 1. Protection: Ensure user is logged in
router.use(protect);

// -----------------------------------------------------------------------
// READ & STATS
// -----------------------------------------------------------------------

// GET /api/schedule/stats
// Returns counters for dashboard cards (Total, Scheduled, Completed)
router.get('/stats', ScheduleController.getScheduleStats);

// GET /api/schedule
// Main route for filtering.
// Usage: /api/schedule?startDate=2025-10-01&endDate=2025-10-31&type=service
router.get('/', ScheduleController.getSchedule);

// GET /api/schedule/:id
// Get item details.
// Usage: /api/schedule/123?type=service
router.get('/:id', ScheduleController.getScheduleItemById);

// -----------------------------------------------------------------------
// WRITE (Create, Update, Delete)
// -----------------------------------------------------------------------

// POST /api/schedule
// Creates a new event or service
router.post('/', ScheduleController.createScheduleItem);

// PUT /api/schedule/:id/status
// Update status only (e.g. dragging card to "Completed")
router.put('/:id/status', ScheduleController.updateScheduleItemStatus);

// DELETE /api/schedule/:id
// Deletes an item. Usage: /api/schedule/123?type=event
router.delete('/:id', ScheduleController.deleteScheduleItem);

module.exports = router;