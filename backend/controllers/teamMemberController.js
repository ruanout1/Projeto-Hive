const TeamMember = require('../models/TeamMember');
const { handleDatabaseError } = require('../utils/errorHandling');

// ==========================================================
// FUNÇÕES - GERENCIAMENTO DE *UM* MEMBRO
// ==========================================================

// DELETE /api/team-members/:id
exports.removeTeamMember = async (req, res) => {
  const { id } = req.params; // id é 'team_member_id'
  try {
    const member = await TeamMember.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: 'Vínculo de membro não encontrado.' });
    }
    
    // TODO: Adicionar checagem de permissão (se o admin pode mexer nessa equipe)

    await member.destroy();
    res.status(200).json({ message: 'Membro removido da equipe com sucesso.' });
  } catch (error) {
    handleDatabaseError(res, error, 'remover membro');
  }
};

// PUT /api/team-members/:id/role
exports.updateTeamMemberRole = async (req, res) => {
  const { id } = req.params; // id é 'team_member_id'
  const { role } = req.body;
  try {
    const member = await TeamMember.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: 'Vínculo de membro não encontrado.' });
    }
    
    // TODO: Adicionar checagem de permissão

    await member.update({ role });
    res.status(200).json({ message: 'Função do membro atualizada.' });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar função do membro');
  }
};