const express = require('express');
const router = express.Router();
const { clockIn, clockOut, startBreak, endBreak, getTimeClockHistory } = require('../controllers/collaboratorTimeClockController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// Protect all routes, only collaborators can access
router.use(protect, checkRole(['colaborador']));

// Routes
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/start-break', startBreak);
router.post('/end-break', endBreak);
router.get('/history', getTimeClockHistory);

module.exports = router;
