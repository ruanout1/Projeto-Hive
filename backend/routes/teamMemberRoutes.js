const express = require('express');
const router = express.Router();
const teamMemberController = require('../controllers/teamMemberController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// =====================
// ROTAS DE *UM* MEMBRO DE EQUIPE
// =====================

// Proteger TODAS as rotas. Apenas Admins podem gerenciar membros.
router.use(protect, checkRole(['admin']));

// DELETE /api/team-members/:id (Remove o *vínculo* do membro com a equipe)
router.delete('/:id', teamMemberController.removeTeamMember);

// PUT /api/team-members/:id/role (Muda a função, ex: 'member')
router.put('/:id/role', teamMemberController.updateTeamMemberRole);

module.exports = router;