const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/TeamController');
const { protect } = require('../middleware/authMiddleware');
const TeamMemberController = require('../controllers/teamMemberController');

router.use(protect);

router.get('/', TeamController.listTeams);
router.post('/', TeamController.createTeam);
router.put('/:id', TeamController.updateTeam);
router.put('/:id/status', TeamController.updateTeamStatus);
router.delete('/:id', TeamController.deleteTeam);
router.get('/:teamId/members', TeamMemberController.getMembers);
router.post('/:teamId/members', TeamMemberController.addMember);

module.exports = router;