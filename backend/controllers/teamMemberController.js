const { models } = require('../database/connection');
const { handleDatabaseError } = require('../utils/errorHandling');

module.exports = {
  // LISTAR MEMBROS DE UMA EQUIPE (GET /api/teams/:teamId/members)
  async getMembers(req, res) {
    try {
      const { teamId } = req.params;
      
      const members = await models.team_members.findAll({
        where: { team_id: teamId },
        include: [{
            model: models.users,
            as: 'user',
            attributes: ['user_id', 'full_name', 'email', 'avatar_url', 'role_key']
        }]
      });

      // Formata para o frontend
      const formattedMembers = members.map(m => ({
          id: m.team_member_id,
          userId: m.user_id,
          name: m.user?.full_name,
          role: m.role, // 'leader' ou 'member'
          avatar: m.user?.avatar_url,
          email: m.user?.email,
          teamId: m.team_id,
          isActive: true // Assumindo ativo se está na tabela
      }));

      return res.json(formattedMembers);
    } catch (error) {
      handleDatabaseError(res, error, 'listar membros da equipe');
    }
  },

  // ADICIONAR MEMBRO (POST /api/teams/:teamId/members)
  async addMember(req, res) {
    try {
      const { teamId } = req.params;
      const { userId, role } = req.body;

      // Verifica se já existe
      const exists = await models.team_members.findOne({
        where: { team_id: teamId, user_id: userId }
      });

      if (exists) {
        return res.status(400).json({ message: 'Usuário já está nesta equipe.' });
      }

      const newMember = await models.team_members.create({
        team_id: teamId,
        user_id: userId,
        role: role || 'member',
        joined_at: new Date()
      });

      return res.status(201).json(newMember);
    } catch (error) {
      handleDatabaseError(res, error, 'adicionar membro');
    }
  },

  // REMOVER MEMBRO (DELETE /api/team-members/:id)
  async removeMember(req, res) {
    try {
      const { id } = req.params; // ID do relacionamento (team_member_id)
      
      const deleted = await models.team_members.destroy({
        where: { team_member_id: id }
      });

      if (!deleted) return res.status(404).json({ message: 'Membro não encontrado.' });

      return res.json({ message: 'Membro removido da equipe.' });
    } catch (error) {
      handleDatabaseError(res, error, 'remover membro');
    }
  },

  // ATUALIZAR PAPEL (PUT /api/team-members/:id/role)
  async updateMemberRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body; // 'leader' ou 'member'

      const [updated] = await models.team_members.update(
        { role },
        { where: { team_member_id: id } }
      );

      if (!updated) return res.status(404).json({ message: 'Membro não encontrado.' });

      return res.json({ message: 'Função atualizada.' });
    } catch (error) {
      handleDatabaseError(res, error, 'atualizar função do membro');
    }
  }
};